import { Router } from "express";
import { listAuditLogs } from "../controllers/auditLog.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { can } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import { listAuditLogsSchema } from "../schemas/auditLog.schema.js";

const router = Router();

router.get("/audit-logs", requireAuth, can("audit_logs", "read"), validate(listAuditLogsSchema), listAuditLogs);

export default router;
