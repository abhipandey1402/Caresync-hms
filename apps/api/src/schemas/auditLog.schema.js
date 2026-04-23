import { z } from "zod";

export const listAuditLogsSchema = z.object({
  query: z.object({
    resource: z.string().min(1).max(100).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional()
  })
});
