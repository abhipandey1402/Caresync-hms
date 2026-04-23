import { jest } from "@jest/globals";
import { can, getScopedResourceFilter } from "./rbac.js";
import { logger } from "../config/logger.js";

const buildReq = (role, overrides = {}) => ({
  user: {
    id: "user-1",
    _id: "user-1",
    tenantId: "tenant-1",
    role
  },
  permissionScope: {},
  ...overrides
});

const buildRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe("rbac middleware", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("allows the defined permissions for admin, doctor, receptionist, pharmacist, and nurse", () => {
    const next = jest.fn();

    can("settings", "read")(buildReq("admin"), buildRes(), next);
    can("emr", "write")(buildReq("doctor"), buildRes(), next);
    can("billing", "write")(buildReq("receptionist"), buildRes(), next);
    can("pharmacy", "write")(buildReq("pharmacist"), buildRes(), next);
    can("ipd", "write")(buildReq("nurse"), buildRes(), next);

    expect(next).toHaveBeenCalledTimes(5);
  });

  it("blocks actions outside each role permission set with 403", () => {
    const cases = [
      { role: "doctor", resource: "settings", action: "read" },
      { role: "receptionist", resource: "emr", action: "write" },
      { role: "pharmacist", resource: "staff", action: "read" },
      { role: "nurse", resource: "billing", action: "write" },
      { role: "doctor", resource: "pharmacy", action: "write" }
    ];

    for (const entry of cases) {
      const res = buildRes();
      can(entry.resource, entry.action)(buildReq(entry.role), res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Role '${entry.role}' cannot perform '${entry.action}' on '${entry.resource}'`
        }
      });
    }
  });

  it("applies reports:own scope for doctors", () => {
    const req = buildReq("doctor");
    const next = jest.fn();

    can("reports", "read")(req, buildRes(), next);

    expect(next).toHaveBeenCalled();
    expect(getScopedResourceFilter(req, "reports", { type: "daily" })).toEqual({
      type: "daily",
      doctorId: "user-1"
    });
  });

  it("logs denied attempts with user context for security audits", () => {
    const warnSpy = jest.spyOn(logger, "warn").mockImplementation(() => logger);
    const res = buildRes();

    can("settings", "read")(buildReq("doctor"), res, jest.fn());

    expect(warnSpy).toHaveBeenCalledWith(
      "RBAC access denied",
      expect.objectContaining({
        userId: "user-1",
        tenantId: "tenant-1",
        role: "doctor",
        resource: "settings",
        action: "read"
      })
    );
  });
});
