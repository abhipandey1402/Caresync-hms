import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../database/constants.js";
import { ensureDefaultServicesForTenant } from "../database/serviceProvisioning.js";
import { registerModel } from "./modelUtils.js";

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    legalName: { type: String, trim: true },
    plan: {
      type: String,
      enum: ["trial", "starter", "growth", "enterprise"],
      default: "trial"
    },
    planExpiresAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["active", "suspended", "cancelled"],
      default: "active"
    },
    timezone: { type: String, default: "Asia/Kolkata" },
    contact: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true }
    },
    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true }
    }
  },
  {
    collection: COLLECTION_NAMES.tenants,
    minimize: false,
    versionKey: false,
    timestamps: true
  }
);

tenantSchema.index({ slug: 1 }, { unique: true });
tenantSchema.index({ planExpiresAt: 1 });

tenantSchema.pre("save", function rememberNewState(next) {
  this.$locals.wasNew = this.isNew;
  next();
});

tenantSchema.post("save", async function provisionDefaultServices(document, next) {
  try {
    if (document.$locals.wasNew) {
      await ensureDefaultServicesForTenant(document._id);
    }

    next();
  } catch (error) {
    next(error);
  }
});

export const Tenant = registerModel("Tenant", tenantSchema);
