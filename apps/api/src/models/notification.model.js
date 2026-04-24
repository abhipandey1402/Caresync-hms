import mongoose from "mongoose";
import { COLLECTION_NAMES, NOTIFICATION_STATUSES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const notificationSchema = createTenantScopedSchema(
  {
    channel: { type: String, enum: ["sms", "whatsapp", "email", "in_app"], required: true },
    recipient: { type: String, required: true, trim: true },
    template: { type: String, trim: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    status: { type: String, enum: NOTIFICATION_STATUSES, default: "queued" },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    sentAt: { type: Date, default: null }
  },
  { collection: COLLECTION_NAMES.notifications }
);

notificationSchema.index({ tenantId: 1, createdAt: -1 });

export const Notification = registerModel("Notification", notificationSchema);
