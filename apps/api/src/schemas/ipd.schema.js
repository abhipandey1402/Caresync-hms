import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;
const objectId = z.string().regex(objectIdRegex, "Invalid ObjectId");
const paise = z.coerce.number().int().min(0);
const positiveInt = z.coerce.number().int().min(1);

export const createWardSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(100),
    floor: z.string().trim().max(50).optional(),
    capacity: positiveInt,
    description: z.string().trim().max(500).optional()
  })
});

export const addBedsSchema = z.object({
  body: z.object({
    wardId: objectId,
    beds: z.array(z.object({
      bedNumber: z.string().trim().min(1).max(20),
      type: z.enum(["general", "semi_private", "private", "icu", "emergency"]).default("general"),
      dailyRate: paise
    })).min(1)
  })
});

export const admitPatientSchema = z.object({
  body: z.object({
    patientId: objectId,
    doctorId: objectId,
    bedId: objectId,
    admissionType: z.enum(["routine", "emergency", "transfer"]).default("routine"),
    diagnosis: z.string().trim().min(1),
    attendant: z.object({
      name: z.string().trim().min(1),
      phone: z.string().trim().min(10),
      relation: z.string().trim().min(1)
    }),
    depositAmount: paise.optional().default(0),
    depositReceipt: z.string().trim().optional(),
    notes: z.string().trim().optional()
  })
});

export const addChargesSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    date: z.coerce.date().optional().default(new Date()),
    services: z.array(z.object({
      name: z.string().min(1),
      serviceId: objectId.optional(),
      qty: positiveInt.default(1),
      rate: paise
    })).optional(),
    medicines: z.array(z.object({
      name: z.string().min(1),
      medicineId: objectId.optional(),
      qty: positiveInt.default(1),
      rate: paise
    })).optional(),
    notes: z.string().trim().optional()
  })
});

export const listBedsSchema = z.object({
  query: z.object({
    wardId: objectId.optional(),
    status: z.enum(["available", "occupied", "maintenance"]).optional()
  })
});
