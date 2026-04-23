import { COLLECTION_NAMES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const sequenceSchema = createTenantScopedSchema(
  {
    type: { type: String, required: true, trim: true, uppercase: true },
    meta: { type: String, trim: true, default: null }, // e.g. "doctorId_2024-01-10" for token sequences
    value: { type: Number, required: true, min: 0, default: 0 },
    prefix: { type: String, trim: true }
  },
  { collection: COLLECTION_NAMES.sequences }
);

// Updated: meta allows per-doctor-per-day uniqueness for token sequences
sequenceSchema.index({ tenantId: 1, type: 1, meta: 1 }, { unique: true });

export const Sequence = registerModel("Sequence", sequenceSchema);
