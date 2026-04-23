import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { can } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import {
  createVisitSchema,
  updateVisitStatusSchema,
  vitalsSchema,
  getQueueSchema,
  visitParamsSchema
} from "../schemas/opd.schema.js";
import {
  createVisit,
  getQueue,
  getLiveQueue,
  updateVisitStatus,
  recordVitals,
  getVisit
} from "../controllers/opd.controller.js";

const router = Router();

router.use(requireAuth);

// Visit creation — receptionist, doctor, admin
router.post("/opd/visits", can("opd", "write"), validate(createVisitSchema), createVisit);

// Queue — static snapshot
router.get("/opd/queue", can("opd", "read"), validate(getQueueSchema), getQueue);

// Queue — live SSE stream (NOTE: no validate for SSE — res.flushHeaders() must be called before any write)
router.get("/opd/queue/live", can("opd", "read"), getLiveQueue);

// Individual visit
router.get("/opd/visits/:id", can("opd", "read"), validate(visitParamsSchema), getVisit);

// Status update — doctor, receptionist
router.patch("/opd/visits/:id/status", can("opd", "write"), validate(updateVisitStatusSchema), updateVisitStatus);

// Vitals — nurse can write (nurse has opd:read but NOT opd:write, need special handling below)
// Doctors also can write vitals. Using opd:read for nurses since they can enter vitals.
router.put("/opd/visits/:id/vitals", can("opd", "read"), validate(vitalsSchema), recordVitals);

export default router;
