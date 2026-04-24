import * as prescriptionService from "../services/prescription.service.js";
import { sendCreated, sendOk } from "../utils/index.js";

export const searchMedicines = async (req, res, next) => {
  try {
    const results = await prescriptionService.searchMedicines(req.user.tenantId, req.query.q, req.query.limit);
    return sendOk(res, results, "Medicines retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const searchDiagnoses = async (req, res, next) => {
  try {
    const results = await prescriptionService.searchDiagnoses(req.query.q, req.query.limit);
    return sendOk(res, results, "Diagnoses retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const listTemplates = async (req, res, next) => {
  try {
    const templates = await prescriptionService.listTemplates(
      req.user.tenantId,
      req.user.id,
      req.user.role,
      req.query.speciality
    );
    return sendOk(res, templates, "Templates retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req, res, next) => {
  try {
    const template = await prescriptionService.createTemplate(req.user.tenantId, req.user.id, req.body);
    return sendCreated(res, template, "Prescription template saved");
  } catch (error) {
    next(error);
  }
};

export const savePrescription = async (req, res, next) => {
  try {
    const prescription = await prescriptionService.savePrescription(
      req.user.tenantId,
      req.user.id,
      req.user.role,
      req.body
    );
    return sendCreated(res, prescription, "Prescription saved");
  } catch (error) {
    next(error);
  }
};

export const listPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await prescriptionService.listPrescriptions(
      req.user.tenantId,
      req.query,
      req.user.id,
      req.user.role
    );
    return sendOk(res, prescriptions, "Prescriptions retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getPrescription = async (req, res, next) => {
  try {
    const prescription = await prescriptionService.getPrescriptionById(req.user.tenantId, req.params.id);
    return sendOk(res, prescription, "Prescription retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const finalizePrescription = async (req, res, next) => {
  try {
    const prescription = await prescriptionService.finalizePrescription(
      req.user.tenantId,
      req.params.id,
      req.user.id,
      req.user.role
    );
    return sendOk(res, prescription, "Prescription finalized successfully");
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionPdf = async (req, res, next) => {
  try {
    const pdf = await prescriptionService.getPrescriptionPdfUrl(req.user.tenantId, req.params.id);
    return sendOk(res, pdf, "Prescription PDF URL generated successfully");
  } catch (error) {
    next(error);
  }
};
