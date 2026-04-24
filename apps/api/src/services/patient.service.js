import mongoose from "mongoose";
import { Patient } from "../models/patient.model.js";
import { Visit } from "../models/visit.model.js";
import { Bill } from "../models/bill.model.js";
import { ApiError } from "../utils/ApiError.js";
import { generateUHID } from "../shared/sequenceGen.js";

const normalizeGender = (gender) => {
  const normalized = String(gender || "").trim().toLowerCase();
  if (normalized === "m" || normalized === "male") {
    return "male";
  }
  if (normalized === "f" || normalized === "female") {
    return "female";
  }
  if (normalized === "o" || normalized === "other") {
    return "other";
  }

  throw new ApiError(400, "Gender must be one of male, female, other, M, F, or O");
};

const normalizePatientPayload = (data) => {
  const {
    dob,
    dateOfBirth,
    gender,
    address,
    ...rest
  } = data;

  return {
    ...rest,
    gender: normalizeGender(gender),
    dateOfBirth: dateOfBirth || dob || null,
    address: address
      ? {
          ...address,
          pincode: address.pincode || address.pin || null
        }
      : undefined
  };
};

/**
 * @typedef {Object} CreatePatientDTO
 * @property {string} name
 * @property {string} phone
 * @property {string} gender
 * @property {Date} [dateOfBirth]
 * @property {string} [bloodGroup]
 * @property {Object} [address]
 * @property {Object} [emergencyContact]
 */

/**
 * Creates a new patient with auto-generated UHID.
 * 
 * @param {string} tenantId 
 * @param {CreatePatientDTO} data 
 * @returns {Promise<Object>}
 */
export const createPatient = async (tenantId, data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const normalizedData = normalizePatientPayload(data);
    const uhid = await generateUHID(tenantId, session);

    const [patient] = await Patient.create(
      [
        {
          ...normalizedData,
          tenantId,
          uhid
        }
      ],
      { session }
    );

    await session.commitTransaction();
    return patient;
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 11000) {
      throw new ApiError(409, "Patient with this UHID or phone already exists");
    }
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Searches for patients using offline fallback strategy logic in frontend,
 * this handles the server-side searching.
 * 
 * @param {string} tenantId 
 * @param {string} q - Search query (name, phone, or UHID)
 * @param {Object} options 
 * @param {number} options.limit
 * @param {number} options.skip
 * @returns {Promise<Object>}
 */
export const searchPatients = async (tenantId, q, { limit = 10, skip = 0 }) => {
  if (!q || q.length < 2) {
    // Return recent patients
    const items = await Patient.find({ tenantId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Patient.countDocuments({ tenantId });
    return { items, total };
  }

  let query = { tenantId };

  // Phone number search
  if (/^\d+$/.test(q)) {
    query.phone = { $regex: `^${q}` };
  } 
  // UHID exact search
  else if (q.toUpperCase().startsWith("P-")) {
    query.uhid = q.toUpperCase();
    limit = 5; // Restricted limit for exact match
  } 
  // Full-text search on name
  else {
    query.$text = { $search: q };
  }

  const itemsQuery = Patient.find(query);
  
  if (query.$text) {
    itemsQuery.select({ score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
  } else {
    itemsQuery.sort({ updatedAt: -1 });
  }

  const items = await itemsQuery.skip(skip).limit(limit).lean();
  const total = await Patient.countDocuments(query);

  return { items, total };
};

/**
 * Gets a full patient profile including demographics and visit history.
 * 
 * @param {string} tenantId 
 * @param {string} patientId 
 * @param {Object} options 
 * @param {number} options.visitLimit
 * @param {number} options.visitSkip
 * @returns {Promise<Object>}
 */
export const getPatientProfile = async (tenantId, patientId, { visitLimit = 10, visitSkip = 0 } = {}) => {
  const patient = await Patient.findOne({ _id: patientId, tenantId }).lean();
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // Get visits with doctor details
  const visits = await Visit.find({ patientId, tenantId })
    .sort({ visitDate: -1 })
    .skip(visitSkip)
    .limit(visitLimit)
    .populate("doctorId", "name")
    .lean();

  const totalVisits = await Visit.countDocuments({ patientId, tenantId });

  // Get pending balance from finalized outstanding bills
  const pendingBills = await Bill.find({ 
    patientId, 
    tenantId, 
    status: { $in: ["unpaid", "partial"] } 
  }).lean();

  const pendingBalance = pendingBills.reduce((acc, bill) => {
    return acc + (bill.balance || 0);
  }, 0);

  const lastVisit = visits.length > 0 ? {
    date: visits[0].visitDate,
    doctor: visits[0].doctorId?.name,
    diagnosis: visits[0].diagnosisCodes?.join(", ") || visits[0].chiefComplaint
  } : null;

  return {
    ...patient,
    visits,
    totalVisits,
    pendingBalance,
    lastVisit
  };
};

/**
 * Updates a patient's demographics.
 * 
 * @param {string} tenantId 
 * @param {string} patientId 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
export const updatePatient = async (tenantId, patientId, data) => {
  const normalizedData = normalizePatientPayload(data);
  const patient = await Patient.findOneAndUpdate(
    { _id: patientId, tenantId },
    { $set: normalizedData },
    { new: true, runValidators: true }
  );

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  return patient;
};

export const __private__ = {
  normalizeGender,
  normalizePatientPayload
};
