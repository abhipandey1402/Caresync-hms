import { asyncHandler, sendOk } from "../utils/index.js";

export const getSettingsOverview = asyncHandler(async (_req, res) =>
  sendOk(
    res,
    {
      section: "settings",
      access: "admin"
    },
    "Settings access granted"
  )
);

export const getStaffOverview = asyncHandler(async (_req, res) =>
  sendOk(
    res,
    {
      section: "staff",
      access: "admin"
    },
    "Staff management access granted"
  )
);
