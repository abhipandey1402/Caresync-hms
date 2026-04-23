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
    "reports:own"
  ],
  receptionist: [
    "patients:read",
    "patients:write",
    "opd:read",
    "opd:write",
    "billing:read",
    "billing:write",
    "ipd:read",
    "ipd:write"
  ],
  pharmacist: ["patients:read", "pharmacy:read", "pharmacy:write", "billing:read"],
  nurse: ["patients:read", "opd:read", "ipd:read", "ipd:write", "emr:read"],
  billing: ["billing:read", "billing:write", "patients:read", "reports:read"],
  staff: []
});

export const hasPermission = (role, resource, action) => {
  const permissions = PERMISSIONS[role] || [];

  return (
    permissions.includes("*") ||
    permissions.includes(`${resource}:${action}`) ||
    permissions.includes(`${resource}:*`) ||
    (action === "read" && permissions.includes(`${resource}:own`))
  );
};
