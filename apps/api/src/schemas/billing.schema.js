import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;
const objectId = z.string().regex(objectIdRegex, "Invalid ObjectId");

const amountSchema = z.number().finite().min(0);
const optionalString = () => z.string().trim().min(1).max(500).optional();

const lineItemSchema = z.object({
  serviceId: objectId.optional(),
  name: z.string().trim().min(1).max(200).optional(),
  qty: z.number().int().positive(),
  rate: amountSchema.optional(),
  gstRate: z.number().min(0).max(28).optional(),
  hsnCode: z.string().trim().min(3).max(12).optional()
}).superRefine((value, ctx) => {
  if (!value.serviceId && !value.name) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Either serviceId or name is required",
      path: ["name"]
    });
  }

  if (!value.serviceId && value.rate === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Custom line item rate is required",
      path: ["rate"]
    });
  }
});

export const createBillSchema = z.object({
  body: z.object({
    patientId: objectId,
    visitId: objectId.optional().nullable(),
    type: z.enum(["opd", "ipd", "pharmacy", "procedure", "other"]).default("opd"),
    lineItems: z.array(lineItemSchema).min(1),
    discount: amountSchema.default(0),
    discountReason: optionalString(),
    isDraft: z.boolean().default(false)
  })
});

export const updateBillSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    patientId: objectId.optional(),
    visitId: objectId.optional().nullable(),
    type: z.enum(["opd", "ipd", "pharmacy", "procedure", "other"]).optional(),
    lineItems: z.array(lineItemSchema).min(1).optional(),
    discount: amountSchema.optional(),
    discountReason: optionalString()
  }).refine((body) => Object.keys(body).length > 0, {
    message: "At least one bill field is required"
  })
});

export const billParamsSchema = z.object({
  params: z.object({ id: objectId })
});

export const listBillsSchema = z.object({
  query: z.object({
    status: z.enum(["draft", "unpaid", "partial", "paid", "cancelled"]).optional(),
    patientId: objectId.optional()
  })
});

export const paymentSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    mode: z.enum(["cash", "upi", "card", "cheque", "insurance", "online"]),
    amount: z.number().finite().positive(),
    reference: z.string().trim().max(120).optional(),
    note: z.string().trim().max(500).optional()
  })
});

export const cancelBillSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    cancelledReason: z.string().trim().min(1).max(500).optional()
  }).default({})
});
