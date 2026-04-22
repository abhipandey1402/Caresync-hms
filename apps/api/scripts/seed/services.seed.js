import mongoose from "mongoose";
import { logger } from "../../src/config/logger.js";
import { buildDefaultServicesForTenant } from "../../src/database/defaultServices.js";
import { ensureDefaultServicesForTenant } from "../../src/database/serviceProvisioning.js";
import { Service } from "../../src/models/service.model.js";
import { Tenant } from "../../src/models/tenant.model.js";

export const seedServices = async ({ tenantIds = [] } = {}) => {
  let scopedTenantIds = tenantIds;

  if (scopedTenantIds.length === 0) {
    scopedTenantIds = await Tenant.find({}, { _id: 1 }).lean().then((tenants) => tenants.map((tenant) => tenant._id));
  }

  if (scopedTenantIds.length === 0) {
    logger.info("No tenants found - service catalog seed skipped");
    return {
      processedTenants: 0,
      totalServices: 0
    };
  }

  let processedTenants = 0;

  for (const tenantId of scopedTenantIds) {
    const normalizedTenantId =
      tenantId instanceof mongoose.Types.ObjectId ? tenantId : new mongoose.Types.ObjectId(tenantId);
    await ensureDefaultServicesForTenant(normalizedTenantId);
    processedTenants += 1;
  }

  const totalServices = await Service.countDocuments();

  logger.info("Default services seed completed", {
    processedTenants,
    totalServices,
    defaultServicesPerTenant: buildDefaultServicesForTenant(new mongoose.Types.ObjectId()).length
  });

  return {
    processedTenants,
    totalServices
  };
};
