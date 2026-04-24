import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { can } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import {
  createTemplateSchema,
  diagnosisSearchSchema,
  medicineSearchSchema,
  prescriptionParamsSchema,
  prescriptionQuerySchema,
  savePrescriptionSchema,
  templateQuerySchema
} from "../schemas/prescription.schema.js";
import {
  createTemplate,
  finalizePrescription,
  getPrescription,
  getPrescriptionPdf,
  listPrescriptions,
  listTemplates,
  savePrescription,
  searchDiagnoses,
  searchMedicines
} from "../controllers/prescription.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/medicines/search", can("emr", "read"), validate(medicineSearchSchema), searchMedicines);
router.get("/diagnoses/search", can("emr", "read"), validate(diagnosisSearchSchema), searchDiagnoses);
router.get("/rx-templates", can("emr", "read"), validate(templateQuerySchema), listTemplates);
router.post("/rx-templates", can("emr", "write"), validate(createTemplateSchema), createTemplate);
router.post("/prescriptions", can("emr", "write"), validate(savePrescriptionSchema), savePrescription);
router.get("/prescriptions", can("emr", "read"), validate(prescriptionQuerySchema), listPrescriptions);
router.get("/prescriptions/:id", can("emr", "read"), validate(prescriptionParamsSchema), getPrescription);
router.post("/prescriptions/:id/finalize", can("emr", "write"), validate(prescriptionParamsSchema), finalizePrescription);
router.get("/prescriptions/:id/pdf", can("emr", "read"), validate(prescriptionParamsSchema), getPrescriptionPdf);

export default router;
