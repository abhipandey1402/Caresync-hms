import { COLLECTION_NAMES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const sequenceSchema = createTenantScopedSchema(
  {
    type: { type: String, required: true, trim: true, uppercase: true },
    value: { type: Number, required: true, min: 0, default: 0 },
    prefix: { type: String, trim: true }
  },
  { collection: COLLECTION_NAMES.sequences }
);

sequenceSchema.index({ tenantId: 1, type: 1 }, { unique: true });

export const Sequence = registerModel("Sequence", sequenceSchema);
