import { AuditLog } from "../models/index.js";

const buildDateRangeFilter = ({ from, to }) => {
  const filter = {};

  if (from) {
    filter.$gte = new Date(from);
  }

  if (to) {
    filter.$lte = new Date(to);
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
};

const listAuditLogs = async ({ tenantId, resource, from, to }) => {
  const filter = {
    tenantId
  };

  if (resource) {
    filter.resource = resource;
  }

  const timestampFilter = buildDateRangeFilter({ from, to });

  if (timestampFilter) {
    filter.timestamp = timestampFilter;
  }

  return AuditLog.find(filter)
    .setOptions({ _skipTenantFilter: true })
    .sort({ timestamp: -1 })
    .limit(250)
    .lean()
    .exec();
};

export const auditLogService = {
  listAuditLogs
};
