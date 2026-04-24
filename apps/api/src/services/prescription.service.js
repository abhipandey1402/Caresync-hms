import mongoose from "mongoose";
import { DiagnosisMaster, MedicineMaster, Notification, Prescription, RxTemplate, Tenant, User, Visit } from "../models/index.js";
import { queue } from "../shared/adapters/queue.adapter.js";
import { storage } from "../shared/adapters/storage.adapter.js";
import { ApiError } from "../utils/apiError.js";

const SEARCH_CACHE_TTL_MS = 60 * 60 * 1000;
const DEFAULT_SEARCH_LIMIT = 10;

const frequencyLabels = Object.freeze({
  OD: { en: "Once daily", hi: "दिन में एक बार" },
  BD: { en: "Twice daily", hi: "दिन में दो बार" },
  TDS: { en: "Thrice daily", hi: "दिन में तीन बार" },
  QDS: { en: "Four times daily", hi: "दिन में चार बार" },
  HS: { en: "At bedtime", hi: "सोते समय" },
  SOS: { en: "As needed", hi: "जरूरत पड़ने पर" }
});

const hindiInstructions = Object.freeze({
  "After food": "खाने के बाद",
  "Before food": "खाने से पहले",
  "With food": "खाने के साथ",
  "Empty stomach": "खाली पेट",
  "At bedtime": "सोते समय"
});

const searchCache = new Map();

const normalizeString = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const getCached = (key) => {
  const hit = searchCache.get(key);

  if (!hit) {
    return null;
  }

  if (hit.expiresAt < Date.now()) {
    searchCache.delete(key);
    return null;
  }

  return hit.value;
};

const setCached = (key, value, ttlMs = SEARCH_CACHE_TTL_MS) => {
  searchCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
};

const getDoctorFilter = (tenantId, actorId, actorRole) => {
  if (actorRole === "doctor") {
    return { tenantId, doctorId: actorId };
  }

  return { tenantId };
};

const normalizeDiagnosis = (diagnosis = []) =>
  (diagnosis || []).map((item) => ({
    icdCode: String(item.icdCode || item.code || "").trim().toUpperCase(),
    name: String(item.name || item.description || "").trim(),
    type: item.type === "secondary" ? "secondary" : "primary"
  }));

const normalizeMedicines = (medicines = []) =>
  (medicines || []).map((item) => ({
    medicineCode: normalizeString(item.medicineCode || item.code),
    name: String(item.name || item.medicineName || "").trim(),
    genericName: normalizeString(item.genericName),
    dose: normalizeString(item.dose || item.dosage),
    frequency: normalizeString(item.frequency)?.toUpperCase() || null,
    duration: normalizeString(item.duration) || null,
    route: normalizeString(item.route)?.toLowerCase() || null,
    instructions: normalizeString(item.instructions) || null,
    isSubstitutable: item.isSubstitutable !== false
  }));

const normalizeLabTests = (labTests = []) =>
  (labTests || []).map((item) => ({
    name: String(item.name || "").trim(),
    instructions: normalizeString(item.instructions)
  }));

const validatePrescriptionDraft = ({ diagnosis, medicines }) => {
  if (!diagnosis.length) {
    throw new ApiError(400, "At least one diagnosis is required", [{ code: "DIAGNOSIS_REQUIRED" }]);
  }

  if (!medicines.length) {
    throw new ApiError(400, "At least one medicine is required", [{ code: "MEDICINES_REQUIRED" }]);
  }

  medicines.forEach((medicine, index) => {
    if (!medicine.name) {
      throw new ApiError(400, `Medicine name is required for item ${index + 1}`, [{ code: "MEDICINE_NAME_REQUIRED" }]);
    }
  });
};

const buildReminderPayload = (prescription) => ({
  prescriptionId: String(prescription._id),
  followUpDate: prescription.followUpDate,
  patientId: String(prescription.patientId),
  doctorId: String(prescription.doctorId)
});

export const getFrequencyLabels = () => frequencyLabels;
export const getHindiInstructionsMap = () => hindiInstructions;

export const translateInstructionToHindi = (instruction) => {
  const normalized = normalizeString(instruction);

  if (!normalized) {
    return null;
  }

  return hindiInstructions[normalized] || null;
};

export const searchMedicines = async (tenantId, q, limit = DEFAULT_SEARCH_LIMIT) => {
  const normalizedQuery = normalizeString(q);

  if (!normalizedQuery || normalizedQuery.length < 2) {
    return [];
  }

  const cacheKey = `medicine:search:${normalizedQuery.toLowerCase()}:${limit}`;
  const cached = getCached(cacheKey);

  if (cached) {
    return cached;
  }

  const results = await MedicineMaster.find(
    { $text: { $search: normalizedQuery }, isActive: true },
    {
      score: { $meta: "textScore" },
      code: 1,
      medicineName: 1,
      genericName: 1,
      form: 1,
      strength: 1
    }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .lean();

  const response = results.map((item) => ({
    code: item.code,
    name: item.medicineName,
    genericName: item.genericName,
    form: item.form,
    strength: item.strength
  }));

  setCached(cacheKey, response);
  return response;
};

export const searchDiagnoses = async (q, limit = DEFAULT_SEARCH_LIMIT) => {
  const normalizedQuery = normalizeString(q);

  if (!normalizedQuery || normalizedQuery.length < 2) {
    return [];
  }

  const cacheKey = `diagnosis:search:${normalizedQuery.toLowerCase()}:${limit}`;
  const cached = getCached(cacheKey);

  if (cached) {
    return cached;
  }

  const isCodeSearch = /^[a-z]\d/i.test(normalizedQuery);
  const results = isCodeSearch
    ? await DiagnosisMaster.find({
        code: { $regex: `^${normalizedQuery}`, $options: "i" },
        isActive: true
      })
        .sort({ code: 1 })
        .limit(limit)
        .lean()
    : await DiagnosisMaster.find(
        { $text: { $search: normalizedQuery }, isActive: true },
        { score: { $meta: "textScore" }, code: 1, category: 1, description: 1, chapter: 1 }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(limit)
        .lean();

  const response = results.map((item) => ({
    icdCode: item.code,
    name: item.description,
    category: item.category,
    chapter: item.chapter
  }));

  setCached(cacheKey, response);
  return response;
};

export const listTemplates = async (tenantId, actorId, actorRole, speciality) => {
  const filter = getDoctorFilter(tenantId, actorId, actorRole);

  if (speciality) {
    filter.$or = [{ speciality }, { speciality: null }];
  }

  return RxTemplate.find(filter)
    .sort({ updatedAt: -1 })
    .lean();
};

export const createTemplate = async (tenantId, actorId, payload) => {
  const template = await RxTemplate.create({
    tenantId,
    doctorId: actorId,
    speciality: normalizeString(payload.speciality) || null,
    name: String(payload.name || "").trim(),
    diagnosis: normalizeDiagnosis(payload.diagnosis),
    medicines: normalizeMedicines(payload.medicines),
    labTests: normalizeLabTests(payload.labTests),
    advice: normalizeString(payload.advice)
  });

  return template.toObject();
};

const loadPrescriptionContext = async (tenantId, visitId, doctorId) => {
  const [visit, doctor, tenant] = await Promise.all([
    Visit.findOne({ _id: visitId, tenantId }).populate("patientId").lean(),
    User.findOne({ _id: doctorId, tenantId }).lean(),
    Tenant.findById(tenantId).lean()
  ]);

  if (!visit) {
    throw new ApiError(404, "Visit not found", [{ code: "VISIT_NOT_FOUND" }]);
  }

  if (!doctor) {
    throw new ApiError(404, "Doctor not found", [{ code: "DOCTOR_NOT_FOUND" }]);
  }

  if (!tenant) {
    throw new ApiError(404, "Tenant not found", [{ code: "TENANT_NOT_FOUND" }]);
  }

  return { visit, doctor, tenant };
};

export const savePrescription = async (tenantId, actorId, actorRole, payload) => {
  const session = await mongoose.startSession();
  let savedPrescriptionId;

  try {
    await session.withTransaction(async () => {
      const { visit } = await loadPrescriptionContext(tenantId, payload.visitId, actorId);

      if (actorRole === "doctor" && String(visit.doctorId) !== String(actorId)) {
        throw new ApiError(403, "Doctors can only prescribe for their own visits", [{ code: "VISIT_DOCTOR_MISMATCH" }]);
      }

      const diagnosis = normalizeDiagnosis(payload.diagnosis);
      const medicines = normalizeMedicines(payload.medicines);
      const labTests = normalizeLabTests(payload.labTests);

      validatePrescriptionDraft({ diagnosis, medicines });

      const existing = await Prescription.findOne({ tenantId, visitId: payload.visitId }).session(session);

      if (existing?.status === "finalized") {
        throw new ApiError(403, "Finalized prescription cannot be edited", [{ code: "PRESCRIPTION_FINALIZED" }]);
      }

      const nextVersion = existing ? existing.version + 1 : 1;
      const draft = {
        tenantId,
        visitId: payload.visitId,
        patientId: visit.patientId._id,
        doctorId: visit.doctorId,
        status: "draft",
        version: nextVersion,
        diagnosis,
        medicines,
        labTests,
        advice: normalizeString(payload.advice),
        notes: normalizeString(payload.notes),
        followUpDate: payload.followUpDate || null,
        updatedBy: actorId,
        createdBy: existing?.createdBy || actorId,
        deliveryStatus: "pending"
      };

      const prescription = existing
        ? await Prescription.findOneAndUpdate(
            { _id: existing._id, tenantId },
            { $set: draft },
            { new: true, runValidators: true, session }
          )
        : await Prescription.create([draft], { session }).then(([created]) => created);

      await Visit.findOneAndUpdate(
        { _id: payload.visitId, tenantId },
        {
          $set: {
            diagnosisCodes: diagnosis.map((item) => item.icdCode)
          }
        },
        { session }
      );

      savedPrescriptionId = prescription._id;
    });
  } finally {
    await session.endSession();
  }

  return getPrescriptionById(tenantId, savedPrescriptionId);
};

export const listPrescriptions = async (tenantId, query = {}, actorId, actorRole) => {
  const filter = getDoctorFilter(tenantId, actorId, actorRole);

  if (query.status) {
    filter.status = query.status;
  }

  if (query.visitId) {
    filter.visitId = query.visitId;
  }

  if (query.patientId) {
    filter.patientId = query.patientId;
  }

  return Prescription.find(filter)
    .sort({ createdAt: -1 })
    .populate("patientId", "name uhid phone gender dateOfBirth")
    .populate("doctorId", "name profile")
    .lean();
};

export const getPrescriptionById = async (tenantId, prescriptionId) => {
  const prescription = await Prescription.findOne({ _id: prescriptionId, tenantId })
    .populate("patientId", "name uhid phone gender dateOfBirth")
    .populate("doctorId", "name profile")
    .populate({
      path: "visitId",
      populate: [
        { path: "patientId", select: "name uhid phone gender dateOfBirth" },
        { path: "doctorId", select: "name profile" }
      ]
    })
    .lean();

  if (!prescription) {
    throw new ApiError(404, "Prescription not found", [{ code: "PRESCRIPTION_NOT_FOUND" }]);
  }

  return prescription;
};

export const finalizePrescription = async (
  tenantId,
  prescriptionId,
  actorId,
  actorRole,
  { queueAdapter = queue, NotificationModel = Notification, getPrescription = getPrescriptionById } = {}
) => {
  const prescription = await Prescription.findOne({ _id: prescriptionId, tenantId });

  if (!prescription) {
    throw new ApiError(404, "Prescription not found", [{ code: "PRESCRIPTION_NOT_FOUND" }]);
  }

  if (actorRole === "doctor" && String(prescription.doctorId) !== String(actorId)) {
    throw new ApiError(403, "Doctors can only finalize their own prescriptions", [{ code: "PRESCRIPTION_DOCTOR_MISMATCH" }]);
  }

  if (prescription.status === "finalized") {
    return getPrescription(tenantId, prescriptionId);
  }

  prescription.status = "finalized";
  prescription.finalizedAt = new Date();
  prescription.deliveryStatus = "queued";
  prescription.updatedBy = actorId;
  await prescription.save();

  await queueAdapter.send("pdf", {
    type: "prescription-pdf",
    tenantId: String(tenantId),
    prescriptionId: String(prescription._id)
  });

  if (prescription.followUpDate) {
    await NotificationModel.create({
      tenantId,
      channel: "in_app",
      recipient: String(prescription.patientId),
      template: "follow_up_reminder",
      status: "queued",
      resourceId: prescription._id,
      payload: buildReminderPayload(prescription)
    });
  }

  return getPrescription(tenantId, prescriptionId);
};

export const getPrescriptionPdfUrl = async (tenantId, prescriptionId) => {
  const prescription = await Prescription.findOne({ _id: prescriptionId, tenantId }).lean();

  if (!prescription) {
    throw new ApiError(404, "Prescription not found", [{ code: "PRESCRIPTION_NOT_FOUND" }]);
  }

  if (!prescription.pdfKey) {
    throw new ApiError(409, "Prescription PDF is not generated yet", [{ code: "PRESCRIPTION_PDF_NOT_READY" }]);
  }

  return {
    key: prescription.pdfKey,
    expiresIn: 900,
    url: await storage.getPresignedUrl(prescription.pdfKey, 900, {
      responseContentType: "application/pdf",
      responseContentDisposition: `inline; filename="${String(prescriptionId)}.pdf"`
    })
  };
};

export const __private__ = {
  getCached,
  normalizeDiagnosis,
  normalizeMedicines,
  normalizeLabTests,
  normalizeString,
  searchCache,
  setCached,
  validatePrescriptionDraft
};
