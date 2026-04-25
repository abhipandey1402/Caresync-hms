import * as patientService from "../services/patient.service.js";
import { sendCreated, sendOk } from "../utils/index.js";

/**
 * Creates a new patient.
 */
export const createPatient = async (req, res, next) => {
  try {
    const patient = await patientService.createPatient(req.user.tenantId, req.body);
    return sendCreated(res, patient, "Patient registered successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Searches for patients.
 */
export const searchPatients = async (req, res, next) => {
  try {
    const q = req.query.q || "";
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = parseInt(req.query.skip, 10) || 0;

    const result = await patientService.searchPatients(req.user.tenantId, q, { limit, skip });
    return sendOk(res, result, "Patients retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Gets a full patient profile.
 */
export const getPatientProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const visitLimit = parseInt(req.query.visitLimit, 10) || 10;
    const visitSkip = parseInt(req.query.visitSkip, 10) || 0;

    const profile = await patientService.getPatientProfile(req.user.tenantId, id, { visitLimit, visitSkip });
    return sendOk(res, profile, "Patient profile retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a patient's details.
 */
export const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await patientService.updatePatient(req.user.tenantId, id, req.body);
    return sendOk(res, patient, "Patient updated successfully");
  } catch (error) {
    next(error);
  }
};
