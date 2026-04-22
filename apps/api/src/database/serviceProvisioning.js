import { buildDefaultServicesForTenant } from "./defaultServices.js";
import { Service } from "../models/service.model.js";

export const ensureDefaultServicesForTenant = async (tenantId, options = {}) => {
  const now = options.now || new Date();
  const services = buildDefaultServicesForTenant(tenantId, now);

  const operations = services.map((service) => ({
    updateOne: {
      filter: {
        tenantId: service.tenantId,
        code: service.code
      },
      update: {
        $setOnInsert: service
      },
      upsert: true
    }
  }));

  if (operations.length === 0) {
    return 0;
  }

  const result = await Service.bulkWrite(operations, {
    ordered: false,
    session: options.session
  });

  return result.upsertedCount || 0;
};
