import { logger } from "../../config/logger.js";

export const processSms = async (payload) => {
  logger.info("[sms] Placeholder processor executed", {
    jobType: payload?.type || "default"
  });
};
