import { jest } from "@jest/globals";
import { errorHandler } from "./errorHandler.js";
import { ApiError } from "../utils/apiError.js";
import { logger } from "../utils/logger.js";

describe("errorHandler observability", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("logs API errors with request context", () => {
    const errorSpy = jest.spyOn(logger, "error").mockImplementation(() => logger);
    const req = {
      method: "GET",
      originalUrl: "/api/v1/patients/p-1",
      headers: {
        "x-user-id": "user-1",
        "x-tenant-id": "tenant-1"
      },
      body: {},
      query: {},
      params: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    errorHandler(new ApiError(404, "Patient not found"), req, res, jest.fn());

    expect(errorSpy).toHaveBeenCalledWith(
      "ApiError occurred",
      expect.objectContaining({
        userId: "user-1",
        tenantId: "tenant-1",
        url: "/api/v1/patients/p-1",
        method: "GET",
        statusCode: 404,
        stack: expect.any(String)
      })
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("logs unexpected errors with the full stack trace", () => {
    const errorSpy = jest.spyOn(logger, "error").mockImplementation(() => logger);
    const req = {
      method: "POST",
      originalUrl: "/api/v1/echo",
      headers: {},
      body: { tenantId: "tenant-9" },
      query: {},
      params: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const error = new Error("Boom");

    errorHandler(error, req, res, jest.fn());

    expect(errorSpy).toHaveBeenCalledWith(
      "Unhandled error",
      expect.objectContaining({
        tenantId: "tenant-9",
        url: "/api/v1/echo",
        method: "POST",
        errorMessage: "Boom",
        stack: expect.any(String)
      })
    );
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
