import { logger } from "../../config/logger.js";

export const processWhatsApp = async (payload) => {
  logger.info("[whatsapp] Placeholder processor executed", {
    jobType: payload?.type || "default"
  });
};
