import { asyncHandler, sendOk } from "../utils/index.js";
import { systemService } from "../services/system.service.js";

export const getApiRoot = asyncHandler(async (_req, res) => {
  const apiMetadata = systemService.getApiMetadata();

  return sendOk(
    res,
    apiMetadata,
    "API root fetched successfully"
  );
});

export const getApiConventions = asyncHandler(async (_req, res) => {
  const conventions = systemService.getApiConventions();

  return sendOk(
    res,
    conventions,
    "API conventions fetched successfully"
  );
});

export const echoPayload = asyncHandler(async (req, res) => {
  const echoedPayload = systemService.echoPayload(req.body);

  return sendOk(res, echoedPayload, "Echo payload processed successfully");
});
