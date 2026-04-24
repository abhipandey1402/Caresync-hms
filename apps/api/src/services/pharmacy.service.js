/**
 * pharmacy.service.js
 * Core business logic for PHARMA-001 (inventory + FIFO) and PHARMA-003 (POS sale).
 *
 * Monetary conventions:
 *   - All amounts stored/returned in PAISE (integer × 100).
 *   - Callers pass values in rupees; toPaise() converts on entry.
 */
import dayjs from "dayjs";
import mongoose from "mongoose";
import { Bill, Inventory, MedicineMaster, Patient, Sequence, Tenant } from "../models/index.js";
import { toPaise, calculateGST } from "./billing.service.js";
import { queue } from "../shared/adapters/queue.adapter.js";
import { ApiError } from "../utils/apiError.js";

// ── FIFO stock deduction ──────────────────────────────────────────────────

/**
 * Deducts `qty` units from the oldest non-expired batches (FIFO by expiryDate).
 * Must be called inside a Mongoose session for atomicity with bill creation.
 *
 * @throws {ApiError} 400 if available stock < qty
 */
export const deductStock = async (tenantId, medicineId, qty, session) => {
  const medicine = await Inventory.findOne({ _id: medicineId, tenantId }).session(session);

  if (!medicine) {
    throw new ApiError(404, "Medicine not found in inventory", [{ code: "MEDICINE_NOT_FOUND" }]);
  }

  // Exclude expired batches from the available pool
  const now = new Date();
  const availableQty = medicine.batches
    .filter((b) => b.qty > 0 && b.expiryDate > now)
    .reduce((sum, b) => sum + b.qty, 0);

  if (availableQty < qty) {
    throw new ApiError(
      400,
      `Insufficient stock for "${medicine.medicineName}". Available: ${availableQty}`,
      [{ code: "INSUFFICIENT_STOCK", medicineId: String(medicineId), available: availableQty, requested: qty }]
    );
  }

  // Sort non-expired batches: oldest expiry first (FIFO)
  const sortedBatches = medicine.batches
    .filter((b) => b.qty > 0 && b.expiryDate > now)
    .sort((a, b) => a.expiryDate - b.expiryDate);

  let remaining = qty;
  for (const batch of sortedBatches) {
    if (remaining <= 0) break;
    const deduct = Math.min(batch.qty, remaining);
    // Update by reference — batch is a sub-document object, Mongoose tracks the change
    const idx = medicine.batches.findIndex(
      (b) => b.batchNumber === batch.batchNumber && b.expiryDate.getTime() === batch.expiryDate.getTime()
    );
    if (idx !== -1) {
      medicine.batches[idx].qty -= deduct;
    }
    remaining -= deduct;
  }

  // Pre-save hook on Inventory recalculates totalQty automatically
  await medicine.save({ session });

  return medicine;
};

// ── Inventory CRUD ────────────────────────────────────────────────────────

export const addInventoryItem = async (tenantId, actorId, data) => {
  const medicine = await Inventory.create([{
    tenantId,
    medicineName: data.medicineName,
    genericName: data.genericName || null,
    manufacturer: data.manufacturer || null,
    medicineCode: data.medicineCode || null,
    medicineId: data.medicineId || null,
    hsnCode: data.hsnCode || null,
    gstRate: data.gstRate ?? 12,
    unit: data.unit || "Tab",
    reorderLevel: data.reorderLevel ?? 0,
    totalQty: 0,
    batches: [],
    createdBy: actorId,
    updatedBy: actorId
  }]);

  return medicine[0].toObject();
};

export const addBatch = async (tenantId, inventoryId, batchData, actorId) => {
  const medicine = await Inventory.findOne({ _id: inventoryId, tenantId });

  if (!medicine) {
    throw new ApiError(404, "Inventory item not found", [{ code: "INVENTORY_NOT_FOUND" }]);
  }

  // Convert rupees → paise for storage
  medicine.batches.push({
    batchNumber: batchData.batchNumber,
    mfgDate: batchData.mfgDate || null,
    expiryDate: batchData.expiryDate,
    qty: batchData.quantity,
    mrp: toPaise(batchData.mrp),
    purchasePrice: toPaise(batchData.purchasePrice),
    supplierId: batchData.supplierId || null
  });

  medicine.updatedBy = actorId;
  await medicine.save(); // pre-save hook recomputes totalQty

  return medicine.toObject();
};

export const listInventory = async (tenantId, query = {}) => {
  const filter = { tenantId };
  const now = new Date();

  if (query.q) {
    filter.$or = [
      { medicineName: { $regex: query.q, $options: "i" } },
      { genericName: { $regex: query.q, $options: "i" } },
      { medicineCode: { $regex: query.q, $options: "i" } }
    ];
  }

  if (query.lowStock) {
    filter.$expr = { $lte: ["$totalQty", "$reorderLevel"] };
  }

  const items = await Inventory.find(filter)
    .sort({ medicineName: 1 })
    .skip(query.skip || 0)
    .limit(query.limit || 50)
    .lean();

  // Annotate each item with expiry status for frontend
  return items.map((item) => {
    const activeBatches = (item.batches || []).filter((b) => b.qty > 0 && b.expiryDate > now);
    const nearestExpiry = activeBatches.length
      ? activeBatches.reduce((min, b) => (b.expiryDate < min ? b.expiryDate : min), activeBatches[0].expiryDate)
      : null;
    const daysToExpiry = nearestExpiry ? dayjs(nearestExpiry).diff(dayjs(), "day") : null;

    return {
      ...item,
      isLowStock: item.totalQty <= item.reorderLevel,
      nearestExpiry,
      daysToExpiry
    };
  });
};

export const getInventoryItem = async (tenantId, inventoryId) => {
  const medicine = await Inventory.findOne({ _id: inventoryId, tenantId }).lean();

  if (!medicine) {
    throw new ApiError(404, "Inventory item not found", [{ code: "INVENTORY_NOT_FOUND" }]);
  }

  const now = new Date();
  return {
    ...medicine,
    isLowStock: medicine.totalQty <= medicine.reorderLevel,
    batches: (medicine.batches || []).map((b) => ({
      ...b,
      isExpired: b.expiryDate <= now,
      margin: b.mrp - b.purchasePrice
    }))
  };
};

// ── Schedule enforcement ──────────────────────────────────────────────────

const BLOCKED_SCHEDULES = new Set(["H1", "X"]);
const RX_REQUIRED_SCHEDULES = new Set(["H"]);

const enforceSchedule = (schedule, prescriptionId, medicineName) => {
  if (!schedule) return; // OTC — no restriction

  const normalized = String(schedule).toUpperCase().trim();

  if (BLOCKED_SCHEDULES.has(normalized)) {
    throw new ApiError(
      403,
      `"${medicineName}" is a Schedule ${normalized} medicine and cannot be dispensed without regulatory approval.`,
      [{ code: "SCHEDULE_BLOCKED", schedule: normalized }]
    );
  }

  if (RX_REQUIRED_SCHEDULES.has(normalized) && !prescriptionId) {
    throw new ApiError(
      400,
      `"${medicineName}" is a Schedule H medicine. A valid prescription is required.`,
      [{ code: "PRESCRIPTION_REQUIRED", schedule: normalized }]
    );
  }
};

// ── Pharmacy POS — transactional sale creation ────────────────────────────

/**
 * Generates a pharmacy-specific bill number using its own Sequence counter.
 * Format: PHM-YYYYMM-NNNN
 */
const generatePharmacyBillNumber = async (tenantId, session, now = new Date()) => {
  const ym = dayjs(now).format("YYYYMM");
  const seq = await Sequence.findOneAndUpdate(
    { tenantId, type: "PHARMBILL", meta: ym },
    { $inc: { value: 1 } },
    { upsert: true, new: true, session, setDefaultsOnInsert: true }
  );

  return `PHM-${ym}-${String(seq.value).padStart(4, "0")}`;
};

/**
 * Creates a pharmacy sale atomically:
 *   1. Validates all medicines (schedule enforcement)
 *   2. Deducts stock (FIFO) inside a Mongoose session
 *   3. Creates a Bill of type "pharmacy"
 *   4. Queues a WhatsApp receipt
 *
 * @returns {object} The created bill (populated)
 */
export const createSale = async (tenantId, actorId, saleData) => {
  // Fetch all inventory items and patient upfront (outside transaction for read-only checks)
  const medicineIds = saleData.items.map((i) => i.medicineId);
  const [inventories, patient, tenant] = await Promise.all([
    Inventory.find({ _id: { $in: medicineIds }, tenantId }).lean(),
    Patient.findOne({ _id: saleData.patientId, tenantId }).lean(),
    Tenant.findById(tenantId).lean()
  ]);

  if (!patient) {
    throw new ApiError(404, "Patient not found", [{ code: "PATIENT_NOT_FOUND" }]);
  }

  if (!tenant) {
    throw new ApiError(404, "Tenant not found", [{ code: "TENANT_NOT_FOUND" }]);
  }

  const inventoryMap = new Map(inventories.map((inv) => [String(inv._id), inv]));

  // Build line items and enforce schedule restrictions
  const lineItemsRaw = await Promise.all(
    saleData.items.map(async (item) => {
      const inv = inventoryMap.get(String(item.medicineId));
      if (!inv) {
        throw new ApiError(404, `Medicine not found in inventory`, [
          { code: "MEDICINE_NOT_FOUND", medicineId: item.medicineId }
        ]);
      }

      // Fetch schedule from MedicineMaster if linked
      let schedule = null;
      if (inv.medicineId) {
        const master = await MedicineMaster.findById(inv.medicineId).lean();
        schedule = master?.schedule || null;
      }

      enforceSchedule(schedule, saleData.prescriptionId, inv.medicineName);

      const mrpPerUnit = toPaise(item.mrp); // caller passes rupees
      const gstRate = inv.gstRate ?? 0;

      return {
        description: inv.medicineName,
        hsnCode: inv.hsnCode || null,
        quantity: item.qty,
        rate: mrpPerUnit,
        gstRate
      };
    })
  );

  // Apply GST computation
  const patientState = patient.address?.state || patient.address?.district || null;
  const lineItems = calculateGST(lineItemsRaw, tenant.gstin, patientState);

  const subtotal = lineItems.reduce((sum, li) => sum + li.baseAmount, 0);
  const totalTax = lineItems.reduce((sum, li) => sum + li.gstAmount, 0);
  const discountPaise = toPaise(saleData.discount || 0);
  const grossTotal = subtotal + totalTax;
  const total = Math.max(0, grossTotal - discountPaise);
  const paymentAmountPaise = toPaise(saleData.payment.amount);

  const session = await mongoose.startSession();
  let bill;

  try {
    await session.withTransaction(async () => {
      // 1. FIFO stock deduction for each item
      for (const item of saleData.items) {
        await deductStock(tenantId, item.medicineId, item.qty, session);
      }

      // 2. Create pharmacy bill
      const now = new Date();
      const billNumber = await generatePharmacyBillNumber(tenantId, session, now);

      const taxBreakup = {
        cgst: lineItems.reduce((s, li) => s + li.cgst, 0),
        sgst: lineItems.reduce((s, li) => s + li.sgst, 0),
        igst: lineItems.reduce((s, li) => s + li.igst, 0)
      };

      [bill] = await Bill.create(
        [
          {
            tenantId,
            patientId: saleData.patientId,
            visitId: null,
            type: "pharmacy",
            billNumber,
            status: paymentAmountPaise >= total ? "paid" : paymentAmountPaise > 0 ? "partial" : "unpaid",
            lineItems,
            subtotal,
            totalTax,
            taxBreakup,
            discount: discountPaise,
            discountReason: null,
            total,
            amountPaid: paymentAmountPaise,
            balance: Math.max(0, total - paymentAmountPaise),
            payments: [
              {
                mode: saleData.payment.mode,
                amount: paymentAmountPaise,
                reference: saleData.payment.reference || null,
                receivedBy: actorId,
                timestamp: now
              }
            ],
            finalizedAt: now,
            invoiceDeliveryStatus: "queued",
            createdBy: actorId,
            updatedBy: actorId
          }
        ],
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  // 3. Queue WhatsApp receipt (outside transaction — best-effort)
  if (bill) {
    await queue.send("whatsapp", {
      type: "bill-receipt",
      billId: String(bill._id),
      tenantId: String(tenantId)
    });
  }

  return getPharmacySaleById(tenantId, bill._id);
};

// ── Query helpers ─────────────────────────────────────────────────────────

export const getPharmacySaleById = async (tenantId, billId) => {
  const bill = await Bill.findOne({ _id: billId, tenantId, type: "pharmacy" })
    .populate("patientId", "name uhid phone")
    .lean();

  if (!bill) {
    throw new ApiError(404, "Pharmacy sale not found", [{ code: "SALE_NOT_FOUND" }]);
  }

  return bill;
};

export const listSales = async (tenantId, query = {}) => {
  const filter = { tenantId, type: "pharmacy" };

  if (query.patientId) filter.patientId = query.patientId;
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = query.from;
    if (query.to) filter.createdAt.$lte = query.to;
  }

  return Bill.find(filter)
    .sort({ createdAt: -1 })
    .skip(query.skip || 0)
    .limit(query.limit || 50)
    .populate("patientId", "name uhid phone")
    .lean();
};

export const getExpiryAlerts = async (tenantId) => {
  const now = dayjs();
  const windows = [30, 60, 90];

  const results = {};

  await Promise.all(
    windows.map(async (days) => {
      const startOfWindow = now.toDate();
      const endOfWindow = now.add(days, "day").toDate();

      const items = await Inventory.find({
        tenantId,
        "batches.expiryDate": { $gte: startOfWindow, $lte: endOfWindow },
        "batches.qty": { $gt: 0 }
      }).lean();

      results[`expiring${days}`] = items.map((item) => {
        const relevantBatch = (item.batches || [])
          .filter((b) => b.qty > 0 && b.expiryDate >= startOfWindow && b.expiryDate <= endOfWindow)
          .sort((a, b) => a.expiryDate - b.expiryDate)[0];

        return {
          _id: item._id,
          medicineName: item.medicineName,
          batchNumber: relevantBatch?.batchNumber,
          expiryDate: relevantBatch?.expiryDate,
          qty: relevantBatch?.qty,
          daysToExpiry: dayjs(relevantBatch?.expiryDate).diff(now, "day")
        };
      });
    })
  );

  // Also include expired batches for display (marked red on UI)
  const expired = await Inventory.find({
    tenantId,
    "batches.expiryDate": { $lt: now.toDate() },
    "batches.qty": { $gt: 0 }
  }).lean();

  results.expired = expired.map((item) => {
    const expiredBatch = (item.batches || [])
      .filter((b) => b.qty > 0 && b.expiryDate < now.toDate())
      .sort((a, b) => b.expiryDate - a.expiryDate)[0];

    return {
      _id: item._id,
      medicineName: item.medicineName,
      batchNumber: expiredBatch?.batchNumber,
      expiryDate: expiredBatch?.expiryDate,
      qty: expiredBatch?.qty,
      daysToExpiry: dayjs(expiredBatch?.expiryDate).diff(now, "day") // negative
    };
  });

  return results;
};

export const getLowStockItems = async (tenantId) => {
  const items = await Inventory.find({
    tenantId,
    $expr: { $lte: ["$totalQty", "$reorderLevel"] }
  })
    .sort({ totalQty: 1 })
    .lean();

  return items.map((item) => ({
    ...item,
    shortage: Math.max(0, item.reorderLevel - item.totalQty)
  }));
};
