import { asyncHandler, sendOk } from "../utils/index.js";
import { auditLogService } from "../services/auditLog.service.js";

export const listAuditLogs = asyncHandler(async (req, res) => {
  const auditLogs = await auditLogService.listAuditLogs({
    tenantId: req.user.tenantId,
    resource: req.query.resource,
    from: req.query.from,
    to: req.query.to
  });

  return sendOk(res, auditLogs, "Audit logs fetched successfully");
});
