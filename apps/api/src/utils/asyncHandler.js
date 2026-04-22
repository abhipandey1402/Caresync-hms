import { ApiError } from "./apiError.js";
import { buildErrorLogMeta, getRequestLogContext, logger, sanitizeForLogging } from "./logger.js";

const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      logger.debug("Incoming request", {
        ...getRequestLogContext(req),
        headers: sanitizeForLogging(req.headers),
        query: sanitizeForLogging(req.query),
        body: process.env.NODE_ENV === "development" ? sanitizeForLogging(req.body) : undefined
      });

      await requestHandler(req, res, next);
    } catch (err) {
      if (!(err instanceof ApiError)) {
        logger.error("Unhandled error in asyncHandler", {
          ...buildErrorLogMeta(err, req),
          message: err?.message || "Unhandled error occurred"
        });
      }

      next(err);
    }
  };
};

export { asyncHandler };
