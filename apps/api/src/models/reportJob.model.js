import { COLLECTION_NAMES } from "../database/constants.js";
import { createTenantScopedSchema, registerModel } from "./modelUtils.js";

const reportJobSchema = createTenantScopedSchema(
  {
    jobId: { type: String, required: true, trim: true },
    userId: { type: String, required: true, trim: true }, // The user who requested it
    reportType: { type: String, required: true, trim: true }, // e.g. "revenue"
    status: {
      type: String,
      enum: ["processing", "done", "failed"],
      default: "processing"
    },
    filters: { type: Object, default: {} }, // Store the from/to dates etc.
    pdfKey: { type: String, trim: true }, // Note: we're using CSVs but keeping pdfKey for generic storage references
    errorMessage: { type: String, trim: true }
  },
  { collection: COLLECTION_NAMES.reportJobs }
);

reportJobSchema.index({ tenantId: 1, jobId: 1 }, { unique: true });
reportJobSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });

export const ReportJob = registerModel("ReportJob", reportJobSchema);
