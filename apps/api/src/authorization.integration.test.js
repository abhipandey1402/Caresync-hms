import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import app from "./app.js";
import { AuditLog } from "./models/index.js";

const buildAuditLogQuery = (result) => {
  const query = {
    setOptions: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(result)
  };

  return query;
};

describe("authorization integration", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 403 on admin routes for non-admin roles", async () => {
    jest.spyOn(jwt, "verify").mockImplementation(() => ({
      sub: "user-1",
      tid: "tenant-1",
      role: "doctor"
    }));

    const settingsResponse = await request(app)
      .get("/api/v1/admin/settings")
      .set("Authorization", "Bearer token");
    const staffResponse = await request(app)
      .get("/api/v1/admin/staff")
      .set("Authorization", "Bearer token");

    expect(settingsResponse.statusCode).toBe(403);
    expect(settingsResponse.body.error.code).toBe("FORBIDDEN");
    expect(staffResponse.statusCode).toBe(403);
    expect(staffResponse.body.error.code).toBe("FORBIDDEN");
  });

  it("returns audit logs for admin users with resource and date filters", async () => {
    const logs = [
      {
        _id: "log-1",
        tenantId: "tenant-1",
        userId: "user-1",
        action: "update",
        resource: "bills",
        resourceId: "bill-1",
        ipAddress: "::1",
        timestamp: new Date("2026-04-22T00:00:00.000Z")
      }
    ];

    jest.spyOn(jwt, "verify").mockImplementation(() => ({
      sub: "admin-1",
      tid: "tenant-1",
      role: "admin"
    }));
    const findSpy = jest
      .spyOn(AuditLog, "find")
      .mockImplementation((filter) => buildAuditLogQuery({ filter, rows: logs }));

    const response = await request(app)
      .get("/api/v1/audit-logs")
      .query({
        resource: "bills",
        from: "2026-04-01T00:00:00.000Z",
        to: "2026-04-30T23:59:59.999Z"
      })
      .set("Authorization", "Bearer token");

    expect(findSpy).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      resource: "bills",
      timestamp: {
        $gte: new Date("2026-04-01T00:00:00.000Z"),
        $lte: new Date("2026-04-30T23:59:59.999Z")
      }
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
