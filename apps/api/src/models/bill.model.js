import mongoose from "mongoose";
import { BILL_STATUSES, COLLECTION_NAMES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const billLineItemSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", default: null },
    serviceCode: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    hsnCode: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, required: true, min: 0 },
    baseAmount: { type: Number, required: true, min: 0 },
    gstAmount: { type: Number, required: true, min: 0 },
    cgst: { type: Number, required: true, min: 0, default: 0 },
    sgst: { type: Number, required: true, min: 0, default: 0 },
    igst: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ["cash", "upi", "card", "cheque", "insurance", "online"],
      required: true
    },
    amount: { type: Number, required: true, min: 1 },
    reference: { type: String, trim: true },
    note: { type: String, trim: true },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    timestamp: { type: Date, required: true }
  },
  { _id: false }
);

const billSchema = createTenantScopedSchema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: "Visit", default: null },
    type: {
      type: String,
      enum: ["opd", "ipd", "pharmacy", "procedure", "other"],
      default: "opd"
    },
    billNumber: { type: String, required: true, trim: true, uppercase: true },
    gstInvoiceNumber: { type: String, trim: true, uppercase: true, default: null },
    status: { type: String, enum: BILL_STATUSES, default: "draft" },
    lineItems: [billLineItemSchema],
    subtotal: { type: Number, required: true, min: 0, default: 0 },
    totalTax: { type: Number, required: true, min: 0, default: 0 },
    taxBreakup: {
      cgst: { type: Number, required: true, min: 0, default: 0 },
      sgst: { type: Number, required: true, min: 0, default: 0 },
      igst: { type: Number, required: true, min: 0, default: 0 }
    },
    discount: { type: Number, required: true, min: 0, default: 0 },
    discountReason: { type: String, trim: true, default: null },
    total: { type: Number, required: true, min: 0, default: 0 },
    amountPaid: { type: Number, min: 0, default: 0 },
    balance: { type: Number, min: 0, default: 0 },
    payments: { type: [paymentSchema], default: [] },
    finalizedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelledReason: { type: String, trim: true, default: null },
    invoicePdfKey: { type: String, trim: true, default: null },
    pdfGeneratedAt: { type: Date, default: null },
    invoiceDeliveryStatus: {
      type: String,
      enum: ["pending", "queued", "sent", "failed"],
      default: "pending"
    },
    invoiceDeliveredAt: { type: Date, default: null }
  },
  { collection: COLLECTION_NAMES.bills }
);

billSchema.index({ tenantId: 1, billNumber: 1 }, { unique: true });
billSchema.index({ tenantId: 1, patientId: 1, createdAt: -1 });
billSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
billSchema.index({ tenantId: 1, createdAt: -1 });

export const Bill = registerModel("Bill", billSchema);
