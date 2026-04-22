import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const auditLogSchema = createTenantScopedSchema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    entityType: { type: String, required: true, trim: true },
    entityId: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { collection: COLLECTION_NAMES.auditLogs }
);

auditLogSchema.index({ tenantId: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

export const AuditLog = registerModel("AuditLog", auditLogSchema);
