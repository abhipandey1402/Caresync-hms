import { COLLECTION_NAMES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const patientSchema = createTenantScopedSchema(
  {
    uhid: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    dateOfBirth: { type: Date, default: null },
    abhaId: { type: String, trim: true },
    bloodGroup: { type: String, trim: true },
    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true }
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relation: { type: String, trim: true }
    },
    notes: { type: String, trim: true }
  },
  { collection: COLLECTION_NAMES.patients }
);

patientSchema.index({ tenantId: 1, uhid: 1 }, { unique: true });
patientSchema.index({ tenantId: 1, phone: 1 });
patientSchema.index({ tenantId: 1, name: "text", phone: "text" });
patientSchema.index({ tenantId: 1, abhaId: 1 });

export const Patient = registerModel("Patient", patientSchema);
