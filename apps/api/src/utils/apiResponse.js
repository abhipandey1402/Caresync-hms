import { getRequestLogContext, logger, sanitizeForLogging } from "./logger.js";

class ApiResponse {
  constructor(statusCode, data, message = "Success", requestContext = null) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;

    if (this.success) {
      logger.info("ApiResponse sent", {
        ...getRequestLogContext(requestContext || {}),
        statusCode: this.statusCode,
        message: this.message,
        data: process.env.NODE_ENV === "development" ? sanitizeForLogging(data) : undefined
      });
    } else {
      logger.warn("ApiResponse sent with warnings/errors", {
        ...getRequestLogContext(requestContext || {}),
        statusCode: this.statusCode,
        message: this.message
      });
    }
  }
}

export { ApiResponse };
