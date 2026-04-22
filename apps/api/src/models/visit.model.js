import mongoose from "mongoose";
import { COLLECTION_NAMES, VISIT_STATUSES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const visitSchema = createTenantScopedSchema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    visitDate: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: VISIT_STATUSES, default: "queued" },
    chiefComplaint: { type: String, trim: true },
    diagnosisCodes: [{ type: String, trim: true }],
    vitals: {
      pulse: Number,
      systolicBp: Number,
      diastolicBp: Number,
      temperatureC: Number,
      spo2: Number
    },
    queueToken: { type: String, trim: true }
  },
  { collection: COLLECTION_NAMES.visits }
);

visitSchema.index({ tenantId: 1, visitDate: -1 });
visitSchema.index({ tenantId: 1, doctorId: 1, visitDate: -1 });
visitSchema.index({ tenantId: 1, patientId: 1, visitDate: -1 });
visitSchema.index({ tenantId: 1, status: 1, visitDate: -1 });

export const Visit = registerModel("Visit", visitSchema);
