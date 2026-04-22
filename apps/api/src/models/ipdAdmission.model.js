import mongoose from "mongoose";
import { COLLECTION_NAMES, IPD_STATUSES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const ipdAdmissionSchema = createTenantScopedSchema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bedId: { type: String, trim: true },
    admissionNumber: { type: String, required: true, trim: true, uppercase: true },
    admissionDate: { type: Date, required: true, default: Date.now },
    dischargeDate: { type: Date, default: null },
    status: { type: String, enum: IPD_STATUSES, default: "admitted" },
    reason: { type: String, trim: true }
  },
  { collection: COLLECTION_NAMES.ipdAdmissions }
);

ipdAdmissionSchema.index({ tenantId: 1, admissionNumber: 1 }, { unique: true });
ipdAdmissionSchema.index({ tenantId: 1, status: 1 });
ipdAdmissionSchema.index({ tenantId: 1, bedId: 1, status: 1 });

export const IpdAdmission = registerModel("IpdAdmission", ipdAdmissionSchema);
