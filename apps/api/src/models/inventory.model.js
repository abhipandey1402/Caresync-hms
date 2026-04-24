import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

/**
 * Sub-schema for a purchase batch.
 * All monetary values stored in paise (integer) for consistency with billing.service.js.
 */
const batchSchema = new mongoose.Schema(
  {
    batchNumber: { type: String, required: true, trim: true },
    mfgDate: { type: Date, default: null },
    expiryDate: { type: Date, required: true },
    qty: { type: Number, required: true, min: 0, default: 0 },
    mrp: { type: Number, required: true, min: 0 },          // paise
    purchasePrice: { type: Number, required: true, min: 0 }, // paise
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null }
  },
  { _id: false }
);

const inventorySchema = createTenantScopedSchema(
  {
    // Optional link to the medicine catalogue
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "MedicineMaster", default: null },
    medicineCode: { type: String, trim: true, default: null },
    medicineName: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true, default: null },
    manufacturer: { type: String, trim: true, default: null },
    hsnCode: { type: String, trim: true, default: null },
    gstRate: { type: Number, min: 0, max: 28, default: 0 },
    unit: { type: String, trim: true, default: "Tab" }, // Tab, Cap, ml, Syrup, Strip, …
    /** Derived: sum of qty across non-expired active batches — recomputed on every save */
    totalQty: { type: Number, required: true, min: 0, default: 0 },
    reorderLevel: { type: Number, min: 0, default: 0 },
    batches: { type: [batchSchema], default: [] }
  },
  { collection: COLLECTION_NAMES.inventories }
);

// ── indexes ──────────────────────────────────────────────────────────────────
inventorySchema.index({ tenantId: 1, medicineName: "text", genericName: "text" });
inventorySchema.index({ tenantId: 1, "batches.expiryDate": 1 });
inventorySchema.index({ tenantId: 1, totalQty: 1 });
inventorySchema.index({ tenantId: 1, medicineId: 1 });

// ── pre-save: recompute totalQty from active, non-expired batches ─────────
inventorySchema.pre("save", function recomputeTotalQty(next) {
  const now = new Date();
  // Keep only batches that have quantity and are not expired
  const activeBatches = this.batches.filter(
    (b) => b.qty > 0 && b.expiryDate > now
  );
  this.totalQty = activeBatches.reduce((sum, b) => sum + b.qty, 0);
  next();
});

export const Inventory = registerModel("Inventory", inventorySchema);
