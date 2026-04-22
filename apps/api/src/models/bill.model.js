import mongoose from "mongoose";
import { BILL_STATUSES, COLLECTION_NAMES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const billLineItemSchema = new mongoose.Schema(
  {
    serviceCode: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    sacCode: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const billSchema = createTenantScopedSchema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: "Visit", default: null },
    billNumber: { type: String, required: true, trim: true, uppercase: true },
    status: { type: String, enum: BILL_STATUSES, default: "draft" },
    lineItems: [billLineItemSchema],
    subtotal: { type: Number, required: true, min: 0, default: 0 },
    totalTax: { type: Number, required: true, min: 0, default: 0 },
    grandTotal: { type: Number, required: true, min: 0, default: 0 },
    paidAmount: { type: Number, min: 0, default: 0 }
  },
  { collection: COLLECTION_NAMES.bills }
);

billSchema.index({ tenantId: 1, billNumber: 1 }, { unique: true });
billSchema.index({ tenantId: 1, patientId: 1, createdAt: -1 });
billSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
billSchema.index({ tenantId: 1, createdAt: -1 });

export const Bill = registerModel("Bill", billSchema);
