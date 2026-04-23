import { z } from "zod";

export const registerTenantSchema = z.object({
  body: z.object({
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
    gstin: z
      .string()
      .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/)
      .optional(),
    ownerName: z.string().min(2).max(100)
  })
});

export const loginSchema = z.object({
  body: z.object({
    tenantSlug: z
      .string()
      .min(3)
      .max(150)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid tenant slug")
      .optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
    password: z.string().min(8)
  })
});

export const refreshSchema = z.object({
  body: z.object({}).optional().default({})
});

export const logoutAllSchema = z.object({
  body: z.object({}).optional().default({})
});
