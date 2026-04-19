import { logger } from "./logger.js";

class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;

    if (this.success) {
      logger.info("ApiResponse sent", {
        statusCode: this.statusCode,
        message: this.message
      });
    } else {
      logger.warn("ApiResponse sent with warnings/errors", {
        statusCode: this.statusCode,
        message: this.message
      });
    }
  }
}

export { ApiResponse };
