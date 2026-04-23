import { logger } from "../config/logger.js";
import { AuditLog } from "../models/index.js";

const ACTION_MAP = Object.freeze({
  POST: "create",
  PUT: "update",
  PATCH: "update",
  DELETE: "delete"
});

const shouldAuditRequest = (req, res) =>
  Boolean(ACTION_MAP[req.method]) && res.statusCode < 400;

const resolveResourceId = (req, body) => {
  const candidate =
    body?.data?._id ||
    body?.data?.id ||
    req.params?.id ||
    req.params?.resourceId ||
    null;

  return candidate ? String(candidate) : "unknown";
};

export const auditLog = (resource) => (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (shouldAuditRequest(req, res)) {
      Promise.resolve(
        AuditLog.create({
          tenantId: req.user?.tenantId || req.tenant?._id,
          userId: req.user?._id || req.user?.id || null,
          action: ACTION_MAP[req.method],
          resource,
          resourceId: resolveResourceId(req, body),
          ipAddress: req.ip,
          userAgent: req.get("user-agent")?.slice(0, 200) || null,
          timestamp: new Date(),
          meta: {}
        })
      ).catch((error) => {
        logger.error("Audit log failed", {
          userId: req.user?.id || req.user?._id || null,
          tenantId: req.user?.tenantId || null,
          resource,
          method: req.method,
          errorMessage: error?.message
        });
      });
    }

    return originalJson(body);
  };

  next();
};
