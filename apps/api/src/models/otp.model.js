import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../database/constants.js";
import { registerModel } from "./modelUtils.js";

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, trim: true },
    otp: { type: String, required: true, trim: true },
    purpose: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
  },
  {
    collection: COLLECTION_NAMES.otps,
    minimize: false,
    versionKey: false
  }
);

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });
otpSchema.index({ phone: 1, otp: 1 });

export const Otp = registerModel("Otp", otpSchema);
