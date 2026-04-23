import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const auditLogSchema = createTenantScopedSchema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    action: {
      type: String,
      enum: ["create", "update", "delete"],
      required: true,
      trim: true
    },
    resource: { type: String, required: true, trim: true },
    resourceId: { type: String, required: true, trim: true },
    ipAddress: { type: String, trim: true, default: null },
    userAgent: { type: String, trim: true, maxlength: 200, default: null },
    timestamp: { type: Date, default: Date.now, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { collection: COLLECTION_NAMES.auditLogs }
);

auditLogSchema.index({ tenantId: 1, timestamp: -1 });
auditLogSchema.index({ tenantId: 1, resource: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

export const AuditLog = registerModel("AuditLog", auditLogSchema);
