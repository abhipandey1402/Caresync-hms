import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;
const objectId = z.string().regex(objectIdRegex, "Invalid ObjectId");

const diagnosisSchema = z.object({
  icdCode: z.string().trim().min(3).max(10),
  name: z.string().trim().min(2).max(200),
  type: z.enum(["primary", "secondary"]).default("primary")
});

const medicineSchema = z.object({
  medicineCode: z.string().trim().max(50).optional(),
  name: z.string().trim().min(2).max(200),
  genericName: z.string().trim().max(200).optional(),
  dose: z.string().trim().min(1).max(100),
  frequency: z.string().trim().min(1).max(20),
  duration: z.string().trim().min(1).max(60),
  route: z.string().trim().min(1).max(50),
  instructions: z.string().trim().max(200).optional(),
  isSubstitutable: z.boolean().default(true)
});

const labTestSchema = z.object({
  name: z.string().trim().min(2).max(200),
  instructions: z.string().trim().max(200).optional()
});

export const medicineSearchSchema = z.object({
  query: z.object({
    q: z.string().trim().min(2),
    limit: z.coerce.number().int().positive().max(20).optional()
  })
});

export const diagnosisSearchSchema = z.object({
  query: z.object({
    q: z.string().trim().min(2),
    limit: z.coerce.number().int().positive().max(20).optional()
  })
});

export const templateQuerySchema = z.object({
  query: z.object({
    speciality: z.string().trim().max(120).optional()
  })
});

export const createTemplateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    speciality: z.string().trim().max(120).optional(),
    diagnosis: z.array(diagnosisSchema).min(1),
    medicines: z.array(medicineSchema).min(1),
    labTests: z.array(labTestSchema).optional().default([]),
    advice: z.string().trim().max(1000).optional()
  })
});

export const savePrescriptionSchema = z.object({
  body: z.object({
    visitId: objectId,
    diagnosis: z.array(diagnosisSchema).min(1),
    medicines: z.array(medicineSchema).min(1),
    labTests: z.array(labTestSchema).optional().default([]),
    advice: z.string().trim().max(1000).optional(),
    notes: z.string().trim().max(1000).optional(),
    followUpDate: z.string().datetime().optional().or(z.string().date().optional())
  })
});

export const prescriptionQuerySchema = z.object({
  query: z.object({
    status: z.enum(["draft", "finalized"]).optional(),
    visitId: objectId.optional(),
    patientId: objectId.optional()
  })
});

export const prescriptionParamsSchema = z.object({
  params: z.object({
    id: objectId
  })
});
