import { z } from "zod";

export const patientSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string(),
  gender: z.enum(["male", "female", "other"]),
  contactNumber: z.string().min(7)
});

export const appointmentSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  scheduledAt: z.string(),
  status: z.enum(["scheduled", "checked-in", "completed", "cancelled"])
});

export const schemas = {
  patientSchema,
  appointmentSchema
};
