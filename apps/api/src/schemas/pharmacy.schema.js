import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;
const objectId = z.string().regex(objectIdRegex, "Invalid ObjectId");
const paise = z.number().finite().min(0); // monetary values sent in rupees, converted server-side

// ── Inventory ─────────────────────────────────────────────────────────────

export const addInventoryItemSchema = z.object({
  body: z.object({
    medicineName: z.string().trim().min(1).max(200),
    genericName: z.string().trim().max(200).optional(),
    manufacturer: z.string().trim().max(200).optional(),
    medicineCode: z.string().trim().max(50).optional(),
    medicineId: objectId.optional(),
    hsnCode: z.string().trim().max(20).optional(),
    gstRate: z.number().min(0).max(28).default(12),
    unit: z.string().trim().max(30).default("Tab"),
    reorderLevel: z.number().int().min(0).default(0)
  })
});

export const inventoryParamsSchema = z.object({
  params: z.object({ id: objectId })
});

export const listInventorySchema = z.object({
  query: z.object({
    q: z.string().trim().max(200).optional(),
    lowStock: z
      .string()
      .optional()
      .transform((v) => v === "true"),
    expiring: z.coerce.number().int().min(1).max(180).optional(), // days until expiry
    limit: z.coerce.number().int().min(1).max(200).default(50),
    skip: z.coerce.number().int().min(0).default(0)
  })
});

// ── Batch ─────────────────────────────────────────────────────────────────

export const addBatchSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    batchNumber: z.string().trim().min(1).max(100),
    mfgDate: z.coerce.date().optional().nullable(),
    expiryDate: z.coerce.date(),
    quantity: z.number().int().positive(),
    mrp: paise,          // caller sends in rupees
    purchasePrice: paise, // caller sends in rupees
    supplierId: objectId.optional().nullable()
  })
});

// ── Pharmacy POS / Sale ───────────────────────────────────────────────────

const saleItemSchema = z.object({
  medicineId: objectId,
  qty: z.number().int().positive(),
  mrp: paise // override MRP at point-of-sale (defaults to batch MRP)
});

export const createSaleSchema = z.object({
  body: z.object({
    patientId: objectId,
    prescriptionId: objectId.optional().nullable(),
    items: z.array(saleItemSchema).min(1),
    discount: z.number().finite().min(0).default(0),
    payment: z.object({
      mode: z.enum(["cash", "upi", "card", "cheque", "insurance", "online"]),
      amount: z.number().finite().positive(),
      reference: z.string().trim().max(120).optional()
    })
  })
});

export const listSalesSchema = z.object({
  query: z.object({
    patientId: objectId.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    limit: z.coerce.number().int().min(1).max(200).default(50),
    skip: z.coerce.number().int().min(0).default(0)
  })
});
