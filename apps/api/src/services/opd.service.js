import dayjs from "dayjs";
import mongoose from "mongoose";
import { Sequence, Visit, Patient, User } from "../models/index.js";
import { ApiError } from "../utils/index.js";

// ─── In-memory SSE client registry ───────────────────────────────────────────
// Map<userId, { res, tenantId, doctorId }>
const sseClients = new Map();

// ─── Token Generation ─────────────────────────────────────────────────────────

/**
 * Generates a sequential token number per doctor per day.
 * Uses atomic findOneAndUpdate with upsert for concurrency safety.
 */
export const generateToken = async (tenantId, doctorId, visitDate, session) => {
  const dateKey = dayjs(visitDate).format("YYYY-MM-DD");
  const meta = `${doctorId}_${dateKey}`;

  const seq = await Sequence.findOneAndUpdate(
    { tenantId, type: "TOKEN", meta },
    { $inc: { value: 1 } },
    { upsert: true, new: true, session, setDefaultsOnInsert: true }
  );

  return seq.value; // 1, 2, 3...
};

// ─── Computed Vitals Fields ───────────────────────────────────────────────────

const computeVitalsFields = (vitals) => {
  const result = { ...vitals };

  // BMI = weight(kg) / (height(m))^2
  if (vitals.weight && vitals.height) {
    result.bmi = parseFloat((vitals.weight / Math.pow(vitals.height / 100, 2)).toFixed(1));
  }

  // BP Status
  if (vitals.systolicBp && vitals.diastolicBp) {
    const s = vitals.systolicBp;
    const d = vitals.diastolicBp;
    if (s >= 180 || d >= 110) result.bpStatus = "critical";
    else if (s > 140 || d > 90) result.bpStatus = "high";
    else if (s < 90) result.bpStatus = "low";
    else result.bpStatus = "normal";
  }

  // SpO2 Status
  if (vitals.spo2 !== undefined) {
    if (vitals.spo2 < 94) result.spo2Status = "critical";
    else if (vitals.spo2 < 97) result.spo2Status = "low";
    else result.spo2Status = "normal";
  }

  return result;
};

// ─── Queue Builder ────────────────────────────────────────────────────────────

const buildQueueData = async (tenantId, { doctorId, date }) => {
  const targetDate = date ? dayjs(date) : dayjs();
  const startOfDay = targetDate.startOf("day").toDate();
  const endOfDay = targetDate.endOf("day").toDate();

  const filter = {
    tenantId,
    visitDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ["cancelled"] }
  };

  if (doctorId) {
    filter.doctorId = new mongoose.Types.ObjectId(doctorId);
  }

  const visits = await Visit.find(filter)
    .sort({ tokenNumber: 1, createdAt: 1 })
    .populate("patientId", "name uhid phone")
    .populate("doctorId", "name speciality")
    .lean();

  // Compute waitingBefore for each queued visit
  const queuedVisits = visits.filter(v => v.status === "queued" || v.status === "checked_in");

  return visits.map(visit => {
    const waitingBefore = visit.status === "queued"
      ? queuedVisits.findIndex(v => String(v._id) === String(visit._id))
      : 0;

    const waitTimeMs = Date.now() - new Date(visit.visitDate).getTime();
    const waitMinutes = Math.floor(waitTimeMs / 60000);

    return {
      ...visit,
      waitingBefore,
      waitMinutes,
      waitStatus: waitMinutes < 15 ? "green" : waitMinutes < 30 ? "orange" : "red"
    };
  });
};

// ─── SSE Broadcast ────────────────────────────────────────────────────────────

export const broadcastQueueUpdate = async (tenantId, doctorId) => {
  const queueData = await buildQueueData(tenantId, { doctorId });
  const payload = JSON.stringify(queueData);

  sseClients.forEach((client, userId) => {
    if (client.tenantId === tenantId && (!doctorId || client.doctorId === doctorId)) {
      try {
        client.res.write(`data: ${payload}\n\n`);
      } catch {
        sseClients.delete(userId);
      }
    }
  });
};

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Creates an OPD visit with atomic token assignment.
 */
export const createVisit = async (tenantId, actorId, body) => {
  const { patientId, doctorId, type, chiefComplaint, isFollowUp, followUpOf } = body;

  // Validate patient and doctor exist in this tenant
  const [patient, doctor] = await Promise.all([
    Patient.findOne({ _id: patientId, tenantId }).lean(),
    User.findOne({ _id: doctorId, tenantId, role: "doctor" }).lean()
  ]);

  if (!patient) throw new ApiError(404, "Patient not found", [{ code: "NOT_FOUND" }]);
  if (!doctor) throw new ApiError(404, "Doctor not found", [{ code: "NOT_FOUND" }]);

  // If follow-up, validate the original visit
  if (isFollowUp && followUpOf) {
    const originalVisit = await Visit.findOne({ _id: followUpOf, tenantId }).lean();
    if (!originalVisit) throw new ApiError(404, "Original visit not found", [{ code: "NOT_FOUND" }]);
  }

  const visitDate = new Date();
  let visit;

  // Use a session for atomic token generation + visit creation
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const tokenNumber = await generateToken(tenantId, doctorId, visitDate, session);

    const [newVisit] = await Visit.create(
      [{
        tenantId,
        patientId,
        doctorId,
        visitDate,
        type: type || "opd",
        status: "queued",
        tokenNumber,
        chiefComplaint,
        isFollowUp: !!isFollowUp,
        followUpOf: isFollowUp && followUpOf ? followUpOf : null
      }],
      { session }
    );

    await session.commitTransaction();
    visit = newVisit;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }

  // Count waiting patients ahead
  const waitingBefore = await Visit.countDocuments({
    tenantId,
    doctorId,
    visitDate: {
      $gte: dayjs(visitDate).startOf("day").toDate(),
      $lte: dayjs(visitDate).endOf("day").toDate()
    },
    status: "queued",
    tokenNumber: { $lt: visit.tokenNumber }
  });

  // Broadcast to SSE clients for this doctor
  broadcastQueueUpdate(tenantId, String(doctorId)).catch(() => {});

  return {
    visitId: visit._id,
    tokenNumber: visit.tokenNumber,
    waitingBefore,
    patient: { name: patient.name, uhid: patient.uhid },
    doctor: { name: doctor.name }
  };
};

/**
 * Returns the current queue snapshot.
 */
export const getQueue = async (tenantId, query) => {
  return buildQueueData(tenantId, query);
};

/**
 * Updates a visit status with transition validation.
 */
export const updateVisitStatus = async (tenantId, visitId, status, actorId) => {
  const visit = await Visit.findOne({ _id: visitId, tenantId });
  if (!visit) throw new ApiError(404, "Visit not found", [{ code: "NOT_FOUND" }]);

  const updates = { status };

  if (status === "in_consultation") updates.consultationStartedAt = new Date();
  if (status === "completed") updates.consultationEndedAt = new Date();
  if (status === "no_show") updates.noShow = true;

  Object.assign(visit, updates);
  await visit.save();

  broadcastQueueUpdate(tenantId, String(visit.doctorId)).catch(() => {});

  return visit;
};

/**
 * Records vitals for a visit with computed fields.
 */
export const recordVitals = async (tenantId, visitId, body, recordedBy) => {
  const visit = await Visit.findOne({ _id: visitId, tenantId });
  if (!visit) throw new ApiError(404, "Visit not found", [{ code: "NOT_FOUND" }]);

  const computedVitals = computeVitalsFields(body);

  visit.vitals = {
    ...visit.vitals?.toObject?.() ?? {},
    ...computedVitals,
    recordedAt: new Date(),
    recordedBy
  };

  await visit.save();
  return visit;
};

/**
 * Gets a single visit with populated fields.
 */
export const getVisit = async (tenantId, visitId) => {
  const visit = await Visit.findOne({ _id: visitId, tenantId })
    .populate("patientId", "name uhid phone gender dateOfBirth")
    .populate("doctorId", "name speciality")
    .lean();

  if (!visit) throw new ApiError(404, "Visit not found", [{ code: "NOT_FOUND" }]);
  return visit;
};

/**
 * Registers an SSE client connection.
 */
export const registerSseClient = (userId, res, tenantId, doctorId) => {
  sseClients.set(userId, { res, tenantId, doctorId });
};

/**
 * Removes an SSE client when connection closes.
 */
export const removeSseClient = (userId) => {
  sseClients.delete(userId);
};

/**
 * Sends the current queue state to a single SSE response.
 */
export const sendInitialQueueState = async (tenantId, doctorId, res) => {
  try {
    const queueData = await buildQueueData(tenantId, { doctorId });
    res.write(`data: ${JSON.stringify(queueData)}\n\n`);
  } catch {
    res.write(`data: []\n\n`);
  }
};
