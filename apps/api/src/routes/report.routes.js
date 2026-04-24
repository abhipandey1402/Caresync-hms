import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { can } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import {
  getDashboardSchema,
  requestExportSchema,
  getExportJobSchema
} from "../schemas/report.schema.js";
import {
  getDashboard,
  requestExport,
  getExportJobStatus,
  getRevenueReport,
  getOutstandingDues
} from "../controllers/report.controller.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/reports/dashboard",
  can("reports", "read"),
  validate(getDashboardSchema),
  getDashboard
);

router.get(
  "/reports/revenue",
  can("reports", "read"),
  getRevenueReport
);

router.get(
  "/reports/outstanding-dues",
  can("reports", "read"),
  getOutstandingDues
);

router.post(
  "/reports/export",
  can("reports", "read"),
  validate(requestExportSchema),
  requestExport
);

router.get(
  "/reports/export/:jobId",
  can("reports", "read"),
  validate(getExportJobSchema),
  getExportJobStatus
);

export default router;
