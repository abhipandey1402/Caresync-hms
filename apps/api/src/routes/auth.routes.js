import { Router } from "express";
import { login, logoutAll, refresh, registerTenant } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  loginSchema,
  logoutAllSchema,
  refreshSchema,
  registerTenantSchema
} from "../schemas/auth.schema.js";

const router = Router();

router.post("/tenants/register", validate(registerTenantSchema), registerTenant);
router.post("/auth/login", validate(loginSchema), login);
router.post("/auth/refresh", validate(refreshSchema), refresh);
router.post("/auth/logout/all", requireAuth, validate(logoutAllSchema), logoutAll);

export default router;
