import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../database/constants.js";
import { registerModel } from "./modelUtils.js";

const diagnosisMasterSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true },
    category: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String, required: true, trim: true },
    chapter: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true }
  },
  {
    collection: COLLECTION_NAMES.diagnosisMasters,
    minimize: false,
    versionKey: false,
    timestamps: true
  }
);

diagnosisMasterSchema.index({ code: 1 }, { unique: true });
diagnosisMasterSchema.index({ description: "text", category: 1 });

export const DiagnosisMaster = registerModel("DiagnosisMaster", diagnosisMasterSchema);
