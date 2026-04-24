import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const bedSchema = createTenantScopedSchema(
  {
    wardId: { type: mongoose.Schema.Types.ObjectId, ref: "Ward", required: true },
    bedNumber: { type: String, required: true, trim: true },
    type: { 
      type: String, 
      enum: ["general", "semi_private", "private", "icu", "emergency"], 
      default: "general" 
    },
    dailyRate: { type: Number, required: true, min: 0 }, // in paise
    status: { 
      type: String, 
      enum: ["available", "occupied", "maintenance"], 
      default: "available" 
    },
    currentAdmissionId: { type: mongoose.Schema.Types.ObjectId, ref: "IpdAdmission", default: null }
  },
  { collection: COLLECTION_NAMES.beds }
);

bedSchema.index({ tenantId: 1, wardId: 1, bedNumber: 1 }, { unique: true });
bedSchema.index({ tenantId: 1, status: 1 });

export const Bed = registerModel("Bed", bedSchema);
