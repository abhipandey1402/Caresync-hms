import { jest } from "@jest/globals";
import { auditLog } from "./auditLog.js";
import { logger } from "../config/logger.js";
import { AuditLog } from "../models/index.js";

const buildReq = (method, resourceId = "resource-1") => ({
  method,
  params: { id: resourceId },
  user: {
    id: "user-1",
    _id: "user-1",
    tenantId: "tenant-1"
  },
  ip: "::1",
  get: jest.fn().mockReturnValue("Mozilla/5.0 test-agent")
});

const buildRes = (statusCode = 200) => ({
  statusCode,
  json: jest.fn((body) => body)
});

describe("auditLog middleware", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("writes audit logs for patients, bills, and pharmacy write operations", async () => {
    const createSpy = jest.spyOn(AuditLog, "create").mockResolvedValue({});

    for (const entry of [
      { resource: "patients", method: "POST", action: "create", resourceId: "patient-1" },
      { resource: "bills", method: "PUT", action: "update", resourceId: "bill-1" },
      { resource: "pharmacy", method: "DELETE", action: "delete", resourceId: "stock-1" }
    ]) {
      const req = buildReq(entry.method, entry.resourceId);
      const res = buildRes();

      auditLog(entry.resource)(req, res, jest.fn());
      res.json({ data: { _id: entry.resourceId } });
    }

    await Promise.resolve();

    expect(createSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        tenantId: "tenant-1",
        userId: "user-1",
        action: "create",
        resource: "patients",
        resourceId: "patient-1",
        ipAddress: "::1",
        userAgent: "Mozilla/5.0 test-agent"
      })
    );
    expect(createSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        action: "update",
        resource: "bills",
        resourceId: "bill-1"
      })
    );
    expect(createSpy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        action: "delete",
        resource: "pharmacy",
        resourceId: "stock-1"
      })
    );
  });

  it("does not store request body PII in audit logs", async () => {
    const createSpy = jest.spyOn(AuditLog, "create").mockResolvedValue({});
    const req = buildReq("POST", "patient-7");
    const res = buildRes();

    auditLog("patients")(req, res, jest.fn());
    res.json({
      data: { _id: "patient-7", phone: "9876543210" },
      password: "secret-value"
    });

    await Promise.resolve();

    expect(createSpy).toHaveBeenCalledWith(
      expect.not.objectContaining({
        phone: "9876543210",
        password: "secret-value"
      })
    );
    expect(createSpy.mock.calls[0][0].meta).toEqual({});
  });

  it("does not fail the API response when audit logging fails", async () => {
    const errorSpy = jest.spyOn(logger, "error").mockImplementation(() => logger);
    jest.spyOn(AuditLog, "create").mockRejectedValue(new Error("audit unavailable"));
    const req = buildReq("POST", "patient-2");
    const res = buildRes();

    auditLog("patients")(req, res, jest.fn());
    const body = res.json({ data: { _id: "patient-2" } });

    await Promise.resolve();

    expect(body).toEqual({ data: { _id: "patient-2" } });
    expect(errorSpy).toHaveBeenCalledWith(
      "Audit log failed",
      expect.objectContaining({
        userId: "user-1",
        tenantId: "tenant-1",
        resource: "patients",
        method: "POST",
        errorMessage: "audit unavailable"
      })
    );
  });
});
