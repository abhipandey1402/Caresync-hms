import winston from "winston";
import WinstonCloudWatchModule from "winston-cloudwatch";
import "./loadEnv.js";

const WinstonCloudWatch = WinstonCloudWatchModule.default || WinstonCloudWatchModule;
const { combine, timestamp, json, colorize, errors, printf } = winston.format;

const SENSITIVE_KEYS = new Set([
  "password",
  "confirmpassword",
  "oldpassword",
  "newpassword",
  "token",
  "accesstoken",
  "refreshtoken",
  "authorization",
  "cookie",
  "set-cookie",
  "secret",
  "clientsecret",
  "apikey",
  "x-api-key",
  "jwt",
  "otp"
]);

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value) && !(value instanceof Error);

const isSensitiveKey = (key = "") => {
  const normalizedKey = String(key).toLowerCase();

  return [...SENSITIVE_KEYS].some(
    (sensitiveKey) => normalizedKey === sensitiveKey || normalizedKey.includes(sensitiveKey)
  );
};

export const sanitizeForLogging = (value, key = "") => {
  if (isSensitiveKey(key)) {
    return "[REDACTED]";
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLogging(item, key));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        sanitizeForLogging(entryValue, entryKey)
      ])
    );
  }

  return value;
};

export const resolveLogLevel = (env = process.env) => {
  const configuredLevel = env.LOG_LEVEL || (env.NODE_ENV === "development" ? "debug" : "info");

  if (env.NODE_ENV !== "development" && configuredLevel === "debug") {
    return "info";
  }

  return configuredLevel;
};

export const getRequestLogContext = (req = {}) => ({
  userId:
    req.user?.id ||
    req.user?._id ||
    req.userId ||
    req.headers?.["x-user-id"] ||
    null,
  tenantId:
    req.tenantId ||
    req.user?.tenantId ||
    req.headers?.["x-tenant-id"] ||
    req.params?.tenantId ||
    req.body?.tenantId ||
    req.query?.tenantId ||
    null,
  url: req.originalUrl || req.url,
  method: req.method
});

export const buildErrorLogMeta = (error, req, extra = {}) => ({
  ...getRequestLogContext(req),
  statusCode: error?.statusCode || error?.status || 500,
  errorName: error?.name,
  stack: error?.stack,
  ...sanitizeForLogging(extra)
});

const sanitizeLogInfo = winston.format((info) => {
  const sanitizedInfo = sanitizeForLogging(info);

  Object.keys(info).forEach((key) => delete info[key]);
  Object.assign(info, sanitizedInfo);

  return info;
});

const buildPrettyConsoleFormat = () =>
  combine(
    errors({ stack: true }),
    timestamp(),
    sanitizeLogInfo(),
    colorize({ all: true }),
    printf(({ timestamp: ts, level, message, stack, ...meta }) => {
      const payload = stack ? { ...meta, stack } : meta;
      const serializedMeta = Object.keys(payload).length ? ` ${JSON.stringify(payload)}` : "";
      return `${ts} ${level}: ${message}${serializedMeta}`;
    })
  );

const buildJsonFormat = () => combine(errors({ stack: true }), timestamp(), sanitizeLogInfo(), json());

export const buildLoggerTransports = ({
  env = process.env,
  now = () => new Date(),
  winstonLib = winston,
  WinstonCloudWatchTransport = WinstonCloudWatch
} = {}) => {
  const transports = [
    new winstonLib.transports.Console({
      format: env.NODE_ENV === "production" ? buildJsonFormat() : buildPrettyConsoleFormat()
    })
  ];

  if (env.NODE_ENV === "production" && env.CLOUDWATCH_LOG_GROUP) {
    transports.push(
      new WinstonCloudWatchTransport({
        logGroupName: env.CLOUDWATCH_LOG_GROUP,
        logStreamName: env.CLOUDWATCH_LOG_STREAM || `api-${now().toISOString().split("T")[0]}`,
        awsRegion: env.AWS_REGION || "ap-south-1",
        uploadRate: 5000,
        messageFormatter: ({ level, message, ...meta }) =>
          JSON.stringify(
            sanitizeForLogging({
              level,
              message,
              ...meta
            })
          )
      })
    );
  }

  return transports;
};

export const buildLogger = ({
  env = process.env,
  winstonLib = winston,
  WinstonCloudWatchTransport = WinstonCloudWatch,
  now = () => new Date()
} = {}) =>
  winstonLib.createLogger({
    level: resolveLogLevel(env),
    format: buildJsonFormat(),
    defaultMeta: {
      service: "caresync-api",
      version: env.npm_package_version
    },
    transports: buildLoggerTransports({
      env,
      now,
      winstonLib,
      WinstonCloudWatchTransport
    })
  });

export const logger = buildLogger();

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", {
    reason: sanitizeForLogging(reason)
  });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", {
    errorName: error?.name,
    message: error?.message,
    stack: error?.stack
  });
});
