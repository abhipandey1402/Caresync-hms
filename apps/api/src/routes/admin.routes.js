import { Router } from "express";
import { getSettingsOverview, getStaffOverview } from "../controllers/admin.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { can } from "../middlewares/rbac.js";

const router = Router();

router.get("/admin/settings", requireAuth, can("settings", "read"), getSettingsOverview);
router.get("/admin/staff", requireAuth, can("staff", "read"), getStaffOverview);

export default router;
