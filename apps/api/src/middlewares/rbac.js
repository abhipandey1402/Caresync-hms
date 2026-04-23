import { logger } from "../config/logger.js";

export const PERMISSIONS = Object.freeze({
  owner: ["*"],
  admin: ["*"],
  doctor: [
    "patients:read",
    "opd:read",
    "opd:write",
    "emr:read",
    "emr:write",
    "billing:read",
    "pharmacy:read",
    "ipd:read",
    "ipd:write",
    "reports:own",
    "staff:read"
  ],
  receptionist: [
    "patients:read",
    "patients:write",
    "opd:read",
    "opd:write",
    "billing:read",
    "billing:write",
    "ipd:read",
    "ipd:write",
    "staff:read"
  ],
  pharmacist: ["patients:read", "pharmacy:read", "pharmacy:write", "billing:read"],
  nurse: ["patients:read", "opd:read", "opd:write", "ipd:read", "ipd:write", "emr:read", "staff:read"],
  billing: ["billing:read", "billing:write", "patients:read", "reports:read"],
  staff: []
});

const buildPermissionKey = (resource, action) => `${resource}:${action}`;
const buildWildcardPermissionKey = (resource) => `${resource}:*`;
const buildOwnPermissionKey = (resource) => `${resource}:own`;

export const getPermissionsForRole = (role) => PERMISSIONS[role] || [];

export const hasPermission = (role, resource, action) => {
  const permissions = getPermissionsForRole(role);

  return (
    permissions.includes("*") ||
    permissions.includes(buildPermissionKey(resource, action)) ||
    permissions.includes(buildWildcardPermissionKey(resource))
  );
};

export const hasOwnPermission = (role, resource) => {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(buildOwnPermissionKey(resource));
};

export const applyOwnershipScope = (req, resource) => {
  if (!req.permissionScope) {
    req.permissionScope = {};
  }

  if (resource === "reports") {
    req.permissionScope.reports = {
      doctorId: req.user?.id || req.user?._id || null
    };
  }
};

const sendForbidden = (res, role, resource, action) =>
  res.status(403).json({
    success: false,
    error: {
      code: "FORBIDDEN",
      message: `Role '${role || "anonymous"}' cannot perform '${action}' on '${resource}'`
    }
  });

export const can = (resource, action) => (req, res, next) => {
  const role = req.user?.role;

  if (hasPermission(role, resource, action)) {
    return next();
  }

  if (action === "read" && hasOwnPermission(role, resource)) {
    applyOwnershipScope(req, resource);
    return next();
  }

  logger.warn("RBAC access denied", {
    userId: req.user?.id || req.user?._id || null,
    tenantId: req.user?.tenantId || null,
    role: role || null,
    resource,
    action
  });

  return sendForbidden(res, role, resource, action);
};

export const getScopedResourceFilter = (req, resource, baseFilter = {}) => ({
  ...baseFilter,
  ...(req.permissionScope?.[resource] || {})
});
