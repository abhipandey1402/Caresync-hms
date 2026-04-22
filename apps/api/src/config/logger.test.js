import winston from "winston";
import {
  buildLoggerTransports,
  getRequestLogContext,
  resolveLogLevel,
  sanitizeForLogging
} from "./logger.js";

describe("logger configuration", () => {
  it("allows debug logging only in development", () => {
    expect(resolveLogLevel({ NODE_ENV: "development" })).toBe("debug");
    expect(resolveLogLevel({ NODE_ENV: "production" })).toBe("info");
    expect(resolveLogLevel({ NODE_ENV: "production", LOG_LEVEL: "debug" })).toBe("info");
    expect(resolveLogLevel({ NODE_ENV: "production", LOG_LEVEL: "warn" })).toBe("warn");
  });

  it("redacts sensitive values recursively", () => {
    expect(
      sanitizeForLogging({
        authorization: "Bearer token",
        nested: {
          password: "secret",
          refreshToken: "refresh-value"
        },
        items: [{ apiKey: "key-1" }],
        safe: "ok"
      })
    ).toEqual({
      authorization: "[REDACTED]",
      nested: {
        password: "[REDACTED]",
        refreshToken: "[REDACTED]"
      },
      items: [{ apiKey: "[REDACTED]" }],
      safe: "ok"
    });
  });

  it("extracts request logging context", () => {
    expect(
      getRequestLogContext({
        user: { id: "user-1", tenantId: "tenant-1" },
        originalUrl: "/api/v1/patients",
        method: "POST"
      })
    ).toEqual({
      userId: "user-1",
      tenantId: "tenant-1",
      url: "/api/v1/patients",
      method: "POST"
    });
  });

  it("adds CloudWatch transport only in production with a log group", () => {
    class FakeCloudWatchTransport {
      constructor(options) {
        this.options = options;
      }
    }

    const transports = buildLoggerTransports({
      env: {
        NODE_ENV: "production",
        CLOUDWATCH_LOG_GROUP: "caresync-prod",
        AWS_REGION: "ap-south-1"
      },
      now: () => new Date("2026-04-22T00:00:00.000Z"),
      winstonLib: winston,
      WinstonCloudWatchTransport: FakeCloudWatchTransport
    });

    expect(transports).toHaveLength(2);
    expect(transports[1].options).toMatchObject({
      logGroupName: "caresync-prod",
      logStreamName: "api-2026-04-22",
      awsRegion: "ap-south-1",
      uploadRate: 5000
    });
  });
});
