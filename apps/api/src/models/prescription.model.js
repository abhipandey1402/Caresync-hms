import mongoose from "mongoose";
import { COLLECTION_NAMES, PRESCRIPTION_STATUSES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const diagnosisSchema = new mongoose.Schema(
  {
    icdCode: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["primary", "secondary"], default: "primary" }
  },
  { _id: false }
);

const prescriptionItemSchema = new mongoose.Schema(
  {
    medicineCode: { type: String, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    dose: { type: String, trim: true },
    frequency: { type: String, trim: true, uppercase: true },
    duration: { type: String, trim: true },
    route: { type: String, trim: true, lowercase: true },
    instructions: { type: String, trim: true },
    isSubstitutable: { type: Boolean, default: true }
  },
  { _id: false }
);

const labTestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    instructions: { type: String, trim: true }
  },
  { _id: false }
);

const prescriptionSchema = createTenantScopedSchema(
  {
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: "Visit", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: PRESCRIPTION_STATUSES, default: "draft" },
    version: { type: Number, required: true, min: 1, default: 1 },
    diagnosis: { type: [diagnosisSchema], default: [] },
    medicines: { type: [prescriptionItemSchema], default: [] },
    labTests: { type: [labTestSchema], default: [] },
    advice: { type: String, trim: true },
    notes: { type: String, trim: true },
    followUpDate: { type: Date, default: null },
    finalizedAt: { type: Date, default: null },
    pdfKey: { type: String, trim: true, default: null },
    pdfGeneratedAt: { type: Date, default: null },
    deliveryStatus: {
      type: String,
      enum: ["pending", "queued", "sent", "failed"],
      default: "pending"
    },
    deliveredAt: { type: Date, default: null }
  },
  { collection: COLLECTION_NAMES.prescriptions }
);

prescriptionSchema.index({ tenantId: 1, visitId: 1 }, { unique: true });
prescriptionSchema.index({ tenantId: 1, patientId: 1, createdAt: -1 });
prescriptionSchema.index({ tenantId: 1, doctorId: 1, createdAt: -1 });

export const Prescription = registerModel("Prescription", prescriptionSchema);
