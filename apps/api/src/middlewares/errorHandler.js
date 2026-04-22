import { ApiError } from "../utils/apiError.js";
import { buildErrorLogMeta, logger } from "../utils/logger.js";

export const errorHandler = (error, req, res, next) => {
  void next;

  if (error?.stream && typeof error.stream.destroy === "function") {
    error.stream.destroy();
    logger.warn("Destroyed error stream to prevent memory leak");
  }

  if (error?.buffer) {
    error.buffer = null;
    logger.warn("Cleared error buffer to prevent memory leak");
  }

  if (error?.type === "entity.parse.failed" || error instanceof SyntaxError) {
    error = new ApiError(400, "Request body contains invalid JSON", [
      {
        code: "INVALID_JSON"
      }
    ]);
  }

  if (error?.type === "entity.too.large" || error?.status === 413) {
    error = new ApiError(413, "Request body exceeds the 10kb limit", [
      {
        code: "PAYLOAD_TOO_LARGE"
      }
    ]);
  }

  if (error instanceof ApiError) {
    error.logError(buildErrorLogMeta(error, req));
    return res.status(error.statusCode).json(error.toResponse());
  }

  logger.error("Unhandled error", {
    ...buildErrorLogMeta(error, req),
    errorMessage: error?.message
  });

  return res.status(error?.statusCode || error?.status || 500).json({
    success: false,
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error?.message || "An unexpected error occurred"
        : "An unexpected error occurred"
  });
};
