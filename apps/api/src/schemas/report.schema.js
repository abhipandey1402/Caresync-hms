import { z } from "zod";

export const getDashboardSchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    date: z.string().optional() // legacy
  })
});

export const requestExportSchema = z.object({
  body: z.object({
    type: z.enum(["revenue", "doctor-collection", "outstanding-dues", "inventory", "patients"]),
    from: z.string().optional(),
    to: z.string().optional()
  })
});

export const getExportJobSchema = z.object({
  params: z.object({
    jobId: z.string().min(1)
  })
});
