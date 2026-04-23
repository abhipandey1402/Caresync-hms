import * as opdService from "../services/opd.service.js";
import { sendCreated, sendOk } from "../utils/index.js";

/**
 * POST /opd/visits
 * Creates a visit with token assignment.
 */
export const createVisit = async (req, res, next) => {
  try {
    const result = await opdService.createVisit(req.user.tenantId, req.user.id, req.body);
    return sendCreated(res, result, "Visit created successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /opd/queue
 * Returns a static queue snapshot (non-SSE clients, date filtering).
 */
export const getQueue = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;
    const queue = await opdService.getQueue(req.user.tenantId, { doctorId, date });
    return sendOk(res, queue, "Queue retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /opd/queue/live
 * SSE endpoint — streams real-time queue updates.
 */
export const getLiveQueue = async (req, res) => {
  const tenantId = req.user.tenantId;
  const userId = req.user.id;
  const doctorId = req.query.doctorId;

  // SSE headers — disable Nginx buffering
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Register client
  opdService.registerSseClient(userId, res, tenantId, doctorId);

  // Send initial queue state
  await opdService.sendInitialQueueState(tenantId, doctorId, res);

  // Heartbeat every 30s to prevent load balancer timeouts
  const heartbeat = setInterval(() => {
    try {
      res.write(":heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 30000);

  // Clean up on connection close
  req.on("close", () => {
    opdService.removeSseClient(userId);
    clearInterval(heartbeat);
  });
};

/**
 * PATCH /opd/visits/:id/status
 * Updates a visit's status and triggers SSE broadcast.
 */
export const updateVisitStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const visit = await opdService.updateVisitStatus(req.user.tenantId, id, status, req.user.id);
    return sendOk(res, visit, "Visit status updated");
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /opd/visits/:id/vitals
 * Records vitals with computed BMI, bpStatus, spo2Status.
 */
export const recordVitals = async (req, res, next) => {
  try {
    const { id } = req.params;
    const visit = await opdService.recordVitals(req.user.tenantId, id, req.body, req.user.id);
    return sendOk(res, visit, "Vitals recorded successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /opd/visits/:id
 * Returns a single visit with populated patient and doctor.
 */
export const getVisit = async (req, res, next) => {
  try {
    const visit = await opdService.getVisit(req.user.tenantId, req.params.id);
    return sendOk(res, visit, "Visit retrieved successfully");
  } catch (error) {
    next(error);
  }
};
