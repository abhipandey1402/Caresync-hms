import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const templateDiagnosisSchema = new mongoose.Schema(
  {
    icdCode: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["primary", "secondary"], default: "primary" }
  },
  { _id: false }
);

const templateMedicineSchema = new mongoose.Schema(
  {
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

const templateLabTestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    instructions: { type: String, trim: true }
  },
  { _id: false }
);

const rxTemplateSchema = createTenantScopedSchema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    speciality: { type: String, trim: true, default: null },
    name: { type: String, required: true, trim: true },
    diagnosis: { type: [templateDiagnosisSchema], default: [] },
    medicines: { type: [templateMedicineSchema], default: [] },
    labTests: { type: [templateLabTestSchema], default: [] },
    advice: { type: String, trim: true, default: null }
  },
  { collection: COLLECTION_NAMES.rxTemplates }
);

rxTemplateSchema.index({ tenantId: 1, doctorId: 1, name: 1 }, { unique: true });
rxTemplateSchema.index({ tenantId: 1, speciality: 1, createdAt: -1 });

export const RxTemplate = registerModel("RxTemplate", rxTemplateSchema);
