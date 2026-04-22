import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const prescriptionItemSchema = new mongoose.Schema(
  {
    medicineCode: { type: String, trim: true },
    medicineName: { type: String, required: true, trim: true },
    dosage: { type: String, trim: true },
    frequency: { type: String, trim: true },
    durationDays: { type: Number, min: 1 },
    instructions: { type: String, trim: true }
  },
  { _id: false }
);

const prescriptionSchema = createTenantScopedSchema(
  {
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: "Visit", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, trim: true },
    medicines: [prescriptionItemSchema],
    diagnosisCodes: [{ type: String, trim: true }]
  },
  { collection: COLLECTION_NAMES.prescriptions }
);

prescriptionSchema.index({ tenantId: 1, visitId: 1 }, { unique: true });
prescriptionSchema.index({ tenantId: 1, patientId: 1, createdAt: -1 });

export const Prescription = registerModel("Prescription", prescriptionSchema);
