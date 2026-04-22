import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const batchSchema = new mongoose.Schema(
  {
    batchNumber: { type: String, required: true, trim: true },
    expiryDate: { type: Date, required: true },
    qty: { type: Number, required: true, min: 0 },
    purchasePrice: { type: Number, min: 0 },
    sellingPrice: { type: Number, min: 0 }
  },
  { _id: false }
);

const inventorySchema = createTenantScopedSchema(
  {
    medicineCode: { type: String, trim: true },
    medicineName: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    manufacturer: { type: String, trim: true },
    totalQty: { type: Number, required: true, min: 0, default: 0 },
    reorderLevel: { type: Number, min: 0, default: 0 },
    batches: [batchSchema]
  },
  { collection: COLLECTION_NAMES.inventories }
);

inventorySchema.index({ tenantId: 1, medicineName: "text", genericName: "text" });
inventorySchema.index({ tenantId: 1, "batches.expiryDate": 1 });
inventorySchema.index({ tenantId: 1, totalQty: 1 });

export const Inventory = registerModel("Inventory", inventorySchema);
