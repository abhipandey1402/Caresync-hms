import { Router } from "express";
import adminRoutes from "./admin.routes.js";
import auditLogRoutes from "./auditLog.routes.js";
import authRoutes from "./auth.routes.js";
import { echoPayload, getApiConventions, getApiRoot } from "../controllers/system.controller.js";

const router = Router();

router.get("/", getApiRoot);

router.get("/conventions", getApiConventions);

router.post("/echo", echoPayload);
router.use(authRoutes);
router.use(adminRoutes);
router.use(auditLogRoutes);

export default router;
