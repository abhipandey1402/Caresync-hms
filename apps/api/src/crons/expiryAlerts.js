/**
 * expiryAlerts.js — PHARMA-002
 *
 * Daily cron that:
 *  1. Finds medicines expiring in 30/60/90 day windows
 *  2. Deduplicates via PharmacyAlertLog (MongoDB-based, no Redis needed)
 *  3. Queues WhatsApp alerts for pharmacists
 *  4. Sends low-stock alerts separately
 *
 * Schedule: '30 2 * * *' = 8:00 AM IST (UTC+5:30 = UTC 2:30)
 */
import cron from "node-cron";
import dayjs from "dayjs";
import { logger } from "../config/logger.js";
import { Inventory, PharmacyAlertLog } from "../models/index.js";
import { queue } from "../shared/adapters/queue.adapter.js";

const EXPIRY_THRESHOLDS = [30, 60, 90];

/**
 * Groups an array of objects by a string key getter.
 */
const groupBy = (arr, keyFn) =>
  arr.reduce((acc, item) => {
    const key = String(keyFn(item));
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});

/**
 * Returns true if an alert with this key was already sent today.
 * Uses a MongoDB upsert — if the document already exists the upsert is a no-op,
 * meaning we can treat a thrown duplicate-key error as "already sent".
 */
const tryRecordAlert = async (tenantId, medicineId, alertType, alertDate) => {
  try {
    await PharmacyAlertLog.create({ tenantId, medicineId, alertType, alertDate });
    return true; // first time today — alert should be sent
  } catch (err) {
    if (err.code === 11000) {
      return false; // duplicate key — already sent today
    }
    throw err;
  }
};

export const runExpiryAlertCron = async () => {
  logger.info("[expiryAlerts] Cron started");
  const today = dayjs().format("YYYY-MM-DD");

  try {
    // ── 1. Expiry window alerts ──────────────────────────────────────────
    for (const days of EXPIRY_THRESHOLDS) {
      const windowStart = dayjs().startOf("day").toDate();
      const windowEnd = dayjs().add(days, "day").endOf("day").toDate();

      const expiring = await Inventory.find({
        "batches.expiryDate": { $gte: windowStart, $lte: windowEnd },
        "batches.qty": { $gt: 0 }
      })
        .select("tenantId medicineName batches")
        .lean();

      if (expiring.length === 0) continue;

      const alertType = `expiry-${days}`;
      const byTenant = groupBy(expiring, (m) => m.tenantId);

      for (const [tenantId, medicines] of Object.entries(byTenant)) {
        const medicineAlerts = [];

        for (const med of medicines) {
          // Find the specific batch(es) expiring in this window
          const relevantBatches = (med.batches || []).filter(
            (b) =>
              b.qty > 0 &&
              b.expiryDate >= windowStart &&
              b.expiryDate <= windowEnd
          );

          for (const batch of relevantBatches) {
            const shouldSend = await tryRecordAlert(
              tenantId,
              med._id,
              alertType,
              today
            );

            if (shouldSend) {
              medicineAlerts.push({
                name: med.medicineName,
                batch: batch.batchNumber,
                expiry: dayjs(batch.expiryDate).format("DD/MM/YYYY"),
                qty: batch.qty
              });
            }
          }
        }

        if (medicineAlerts.length > 0) {
          await queue.send("whatsapp", {
            type: "expiry-alert",
            tenantId,
            medicines: medicineAlerts,
            daysUntilExpiry: days
          });

          logger.info(`[expiryAlerts] Queued expiry-${days}d alert`, {
            tenantId,
            count: medicineAlerts.length
          });
        }
      }
    }

    // ── 2. Low-stock alerts ──────────────────────────────────────────────
    const lowStock = await Inventory.find({
      $expr: { $lte: ["$totalQty", "$reorderLevel"] }
    })
      .select("tenantId medicineName totalQty reorderLevel")
      .lean();

    if (lowStock.length > 0) {
      const byTenant = groupBy(lowStock, (m) => m.tenantId);

      for (const [tenantId, medicines] of Object.entries(byTenant)) {
        const medicineAlerts = [];

        for (const med of medicines) {
          const shouldSend = await tryRecordAlert(
            tenantId,
            med._id,
            "low-stock",
            today
          );

          if (shouldSend) {
            medicineAlerts.push({
              name: med.medicineName,
              totalQty: med.totalQty,
              reorderLevel: med.reorderLevel
            });
          }
        }

        if (medicineAlerts.length > 0) {
          await queue.send("whatsapp", {
            type: "low-stock-alert",
            tenantId,
            medicines: medicineAlerts
          });

          logger.info(`[expiryAlerts] Queued low-stock alert`, {
            tenantId,
            count: medicineAlerts.length
          });
        }
      }
    }

    logger.info("[expiryAlerts] Cron completed");
  } catch (err) {
    logger.error("[expiryAlerts] Cron failed", { error: err.message, stack: err.stack });
  }
};

/**
 * Starts the cron job. Call once after DB is connected.
 * Schedule: 8:00 AM IST = 2:30 AM UTC
 */
export const startExpiryAlertCron = () => {
  cron.schedule("30 2 * * *", runExpiryAlertCron, {
    timezone: "UTC" // 2:30 UTC = 8:00 IST
  });
  logger.info("[expiryAlerts] Cron scheduled — daily at 08:00 IST");
};
