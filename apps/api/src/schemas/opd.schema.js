import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;
const objectId = z.string().regex(objectIdRegex, "Invalid ObjectId");

// POST /opd/visits
export const createVisitSchema = z.object({
  body: z.object({
    patientId: objectId,
    doctorId: objectId,
    type: z.enum(["opd", "follow_up", "emergency"]).default("opd"),
    chiefComplaint: z.string().trim().min(1).max(500).optional(),
    isFollowUp: z.boolean().default(false),
    followUpOf: objectId.optional().nullable()
  })
});

// PATCH /opd/visits/:id/status
export const updateVisitStatusSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    status: z.enum(["queued", "checked_in", "in_consultation", "completed", "no_show", "cancelled"])
  })
});

// PUT /opd/visits/:id/vitals
export const vitalsSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    systolicBp: z.number().int().min(50).max(300).optional(),
    diastolicBp: z.number().int().min(30).max(200).optional(),
    pulse: z.number().int().min(20).max(300).optional(),
    temperatureF: z.number().min(90).max(115).optional(),
    spo2: z.number().min(50).max(100).optional(),
    weight: z.number().min(0.5).max(500).optional(), // kg
    height: z.number().min(20).max(300).optional(),  // cm
    rbs: z.number().min(20).max(1000).optional()     // mg/dL
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one vital field is required"
  })
});

// GET /opd/queue
export const getQueueSchema = z.object({
  query: z.object({
    doctorId: objectId.optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional()
  })
});

// GET /opd/visits/:id
export const visitParamsSchema = z.object({
  params: z.object({ id: objectId })
});
