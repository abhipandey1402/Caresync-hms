import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const serviceSchema = createTenantScopedSchema(
  {
    code: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    sacCode: { type: String, required: true, trim: true },
    gstRate: { type: Number, required: true, min: 0, max: 28 },
    defaultRate: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { collection: COLLECTION_NAMES.services }
);

serviceSchema.index({ tenantId: 1, code: 1 }, { unique: true });
serviceSchema.index({ tenantId: 1, category: 1, isActive: 1 });

export const Service = registerModel("Service", serviceSchema);
