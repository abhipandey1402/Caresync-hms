import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  createPatient,
  searchPatients,
  getPatientProfile,
  updatePatient
} from "../controllers/patient.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/patients", createPatient);
router.get("/patients", searchPatients);
router.get("/patients/:id", getPatientProfile);
router.put("/patients/:id", updatePatient);

export default router;
