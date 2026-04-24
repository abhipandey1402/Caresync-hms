import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { can } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import {
  createWardSchema,
  addBedsSchema,
  admitPatientSchema,
  addChargesSchema,
  listBedsSchema
} from "../schemas/ipd.schema.js";
import {
  createWard,
  addBeds,
  getBedMap,
  listBeds,
  admitPatient,
  addDailyCharges,
  listAdmissions,
  dischargePatient
} from "../controllers/ipd.controller.js";

const router = Router();

router.use(requireAuth);

// ── Wards & Beds ─────────────────────────────────────────────────────────────
router.post(
  "/ipd/wards",
  can("ipd", "write"),
  validate(createWardSchema),
  createWard
);

router.post(
  "/ipd/beds",
  can("ipd", "write"),
  validate(addBedsSchema),
  addBeds
);

router.get(
  "/ipd/bed-map",
  can("ipd", "read"),
  getBedMap
);

router.get(
  "/ipd/beds",
  can("ipd", "read"),
  validate(listBedsSchema),
  listBeds
);

// ── Admissions ────────────────────────────────────────────────────────────────
router.post(
  "/ipd/admissions",
  can("ipd", "write"),
  validate(admitPatientSchema),
  admitPatient
);

router.get(
  "/ipd/admissions",
  can("ipd", "read"),
  listAdmissions
);

router.post(
  "/ipd/admissions/:id/charges",
  can("ipd", "write"),
  validate(addChargesSchema),
  addDailyCharges
);

router.post(
  "/ipd/admissions/:id/discharge",
  can("ipd", "write"),
  dischargePatient
);

export default router;
