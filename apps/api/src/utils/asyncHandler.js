import { ApiError } from "./apiError.js";
import { logger } from "./logger.js";

const redactHeaders = (headers = {}) => {
  const nextHeaders = { ...headers };

  if (nextHeaders.authorization) {
    nextHeaders.authorization = "[REDACTED]";
  }

  if (nextHeaders.cookie) {
    nextHeaders.cookie = "[REDACTED]";
  }

  return nextHeaders;
};

const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      logger.info("Incoming request", {
        method: req.method,
        url: req.originalUrl,
        headers: redactHeaders(req.headers),
        query: req.query,
        body: process.env.NODE_ENV === "development" ? req.body : undefined
      });

      await requestHandler(req, res, next);
    } catch (err) {
      if (!(err instanceof ApiError)) {
        logger.error("Unhandled error in asyncHandler", {
          statusCode: err?.statusCode || 500,
          message: err?.message || "Unhandled error occurred",
          stack: err?.stack
        });
      }

      next(err);
    }
  };
};

export { asyncHandler };
