import { Router } from "express";
import adminRoutes from "./admin.routes.js";
import auditLogRoutes from "./auditLog.routes.js";
import authRoutes from "./auth.routes.js";
import billingRoutes from "./billing.routes.js";
import patientRoutes from "./patient.routes.js";
import prescriptionRoutes from "./prescription.routes.js";
import opdRoutes from "./opd.routes.js";
import { echoPayload, getApiConventions, getApiRoot } from "../controllers/system.controller.js";

const router = Router();

router.get("/", getApiRoot);

router.get("/conventions", getApiConventions);

router.post("/echo", echoPayload);
router.use(authRoutes);
router.use(adminRoutes);
router.use(auditLogRoutes);
router.use(billingRoutes);
router.use(patientRoutes);
router.use(prescriptionRoutes);
router.use(opdRoutes);

export default router;
