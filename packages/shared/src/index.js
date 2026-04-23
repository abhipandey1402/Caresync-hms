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

export const registerTenantSchema = z.object({
  clinicName: z.string().min(3).max(100),
  city: z.string().min(2).max(50),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
  email: z.string().email().optional(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must have uppercase, lowercase, and number"
    ),
  confirmPassword: z.string().min(8),
  gstin: z
    .string()
    .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/, "Invalid GSTIN format")
    .optional()
    .or(z.literal('')),
  ownerName: z.string().min(2).max(100)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const loginSchema = z.object({
  tenantSlug: z
    .string()
    .min(3)
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid tenant slug")
    .optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
  password: z.string().min(8)
});

export const schemas = {
  patientSchema,
  appointmentSchema,
  registerTenantSchema,
  loginSchema
};
