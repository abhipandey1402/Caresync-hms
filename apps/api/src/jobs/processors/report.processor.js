import { logger } from "../../config/logger.js";

export const processReport = async (payload) => {
  logger.info("[report] Placeholder processor executed", {
    jobType: payload?.type || "default"
  });
};
