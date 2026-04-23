import { asyncHandler, sendOk } from "../utils/index.js";
import { User } from "../models/index.js";

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

export const getStaffOverview = asyncHandler(async (req, res) => {
  const { role, limit = 50, skip = 0 } = req.query;
  const filter = { tenantId: req.user.tenantId, isActive: true };
  if (role) filter.role = role;

  const staff = await User.find(filter)
    .select("name role phone speciality isActive createdAt")
    .sort({ name: 1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .lean();

  const total = await User.countDocuments(filter);

  return sendOk(res, { staff, total }, "Staff retrieved successfully");
});
