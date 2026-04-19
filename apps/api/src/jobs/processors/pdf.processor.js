import { logger } from "../../config/logger.js";

export const processPdf = async (payload) => {
  logger.info("[pdf] Placeholder processor executed", {
    jobType: payload?.type || "default"
  });
};
