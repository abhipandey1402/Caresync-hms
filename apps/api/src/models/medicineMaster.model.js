import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../database/constants.js";
import { registerModel } from "./modelUtils.js";

const medicineMasterSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true },
    medicineName: { type: String, required: true, trim: true },
    genericName: { type: String, required: true, trim: true },
    strength: { type: String, trim: true },
    form: { type: String, trim: true },
    manufacturer: { type: String, trim: true },
    schedule: { type: String, trim: true },
    searchTerms: [{ type: String, trim: true, lowercase: true }],
    isActive: { type: Boolean, default: true }
  },
  {
    collection: COLLECTION_NAMES.medicineMasters,
    minimize: false,
    versionKey: false,
    timestamps: true
  }
);

medicineMasterSchema.index({ code: 1 }, { unique: true });
medicineMasterSchema.index({ medicineName: "text", genericName: "text" });

export const MedicineMaster = registerModel("MedicineMaster", medicineMasterSchema);
