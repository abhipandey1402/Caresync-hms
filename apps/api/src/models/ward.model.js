import { COLLECTION_NAMES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const wardSchema = createTenantScopedSchema(
  {
    name: { type: String, required: true, trim: true },
    floor: { type: String, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    description: { type: String, trim: true }
  },
  { collection: COLLECTION_NAMES.wards }
);

wardSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const Ward = registerModel("Ward", wardSchema);
