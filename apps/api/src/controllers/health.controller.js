import { asyncHandler, sendOk } from "../utils/index.js";
import { healthService } from "../services/health.service.js";

export const getHealth = asyncHandler(async (_req, res) => {
  const healthStatus = healthService.getHealthStatus();

  return sendOk(
    res,
    healthStatus,
    "Health check fetched successfully"
  );
});
