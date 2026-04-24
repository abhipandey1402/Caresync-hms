import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../database/constants.js";
import { registerModel } from "./modelUtils.js";

/**
 * Deduplication log for expiry/low-stock alerts.
 * One document per (tenantId, medicineId, alertType, alertDate).
 * The unique compound index prevents the daily cron from sending the same alert twice.
 */
const pharmacyAlertLogSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true
    },
    alertType: {
      type: String,
      enum: ["expiry-30", "expiry-60", "expiry-90", "low-stock"],
      required: true
    },
    alertDate: {
      type: String, // "YYYY-MM-DD" — kept as string for cheap dedup key
      required: true
    },
    sentAt: { type: Date, default: Date.now }
  },
  {
    collection: COLLECTION_NAMES.pharmacyAlertLogs,
    minimize: false,
    versionKey: false,
    timestamps: false
  }
);

pharmacyAlertLogSchema.index(
  { tenantId: 1, medicineId: 1, alertType: 1, alertDate: 1 },
  { unique: true }
);

export const PharmacyAlertLog = registerModel("PharmacyAlertLog", pharmacyAlertLogSchema);
