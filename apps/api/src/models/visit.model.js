import mongoose from "mongoose";
import { COLLECTION_NAMES, VISIT_STATUSES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const visitSchema = createTenantScopedSchema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    visitDate: { type: Date, required: true, default: Date.now },
    type: { type: String, enum: ["opd", "follow_up", "emergency"], default: "opd" },
    status: { type: String, enum: VISIT_STATUSES, default: "queued" },
    tokenNumber: { type: Number, default: null },
    chiefComplaint: { type: String, trim: true },
    diagnosisCodes: [{ type: String, trim: true }],
    isFollowUp: { type: Boolean, default: false },
    followUpOf: { type: mongoose.Schema.Types.ObjectId, ref: "Visit", default: null },
    noShow: { type: Boolean, default: false },
    consultationStartedAt: { type: Date, default: null },
    consultationEndedAt: { type: Date, default: null },
    vitals: {
      pulse: Number,
      systolicBp: Number,
      diastolicBp: Number,
      temperatureF: Number, // stored in Fahrenheit
      spo2: Number,
      weight: Number, // kg
      height: Number, // cm
      rbs: Number,   // mg/dL
      // Computed fields (stored on save)
      bmi: Number,
      bpStatus: { type: String, enum: ["low", "normal", "high", "critical"], default: null },
      spo2Status: { type: String, enum: ["normal", "low", "critical"], default: null },
      recordedAt: { type: Date, default: null },
      recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
    },
    queueToken: { type: String, trim: true } // legacy field kept for compat
  },
  { collection: COLLECTION_NAMES.visits }
);

visitSchema.index({ tenantId: 1, visitDate: -1 });
visitSchema.index({ tenantId: 1, doctorId: 1, visitDate: -1 });
visitSchema.index({ tenantId: 1, patientId: 1, visitDate: -1 });
visitSchema.index({ tenantId: 1, status: 1, visitDate: -1 });
visitSchema.index({ tenantId: 1, doctorId: 1, tokenNumber: 1 });

export const Visit = registerModel("Visit", visitSchema);
