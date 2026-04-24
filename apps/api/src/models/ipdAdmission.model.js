import mongoose from "mongoose";
import { COLLECTION_NAMES, IPD_STATUSES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const dailyChargeItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
  qty: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true }, // in paise
  total: { type: Number, required: true }  // in paise
}, { _id: false });

const dailyChargeSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  services: [dailyChargeItemSchema],
  medicines: [dailyChargeItemSchema],
  notes: { type: String, trim: true }
}, { _id: false });

const ipdAdmissionSchema = createTenantScopedSchema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bedId: { type: mongoose.Schema.Types.ObjectId, ref: "Bed", required: true },
    admissionNumber: { type: String, required: true, trim: true, uppercase: true },
    admissionDate: { type: Date, required: true, default: Date.now },
    dischargeDate: { type: Date, default: null },
    status: { type: String, enum: IPD_STATUSES, default: "admitted" },
    admissionType: { type: String, enum: ["routine", "emergency", "transfer"], default: "routine" },
    diagnosis: { type: String, trim: true },
    attendant: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relation: { type: String, trim: true }
    },
    depositAmount: { type: Number, default: 0 }, // in paise
    depositReceipt: { type: String, trim: true },
    dailyCharges: [dailyChargeSchema],
    finalBillId: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", default: null },
    notes: { type: String, trim: true }
  },
  { collection: COLLECTION_NAMES.ipdAdmissions }
);

ipdAdmissionSchema.index({ tenantId: 1, admissionNumber: 1 }, { unique: true });
ipdAdmissionSchema.index({ tenantId: 1, status: 1 });
ipdAdmissionSchema.index({ tenantId: 1, bedId: 1, status: 1 });

export const IpdAdmission = registerModel("IpdAdmission", ipdAdmissionSchema);
