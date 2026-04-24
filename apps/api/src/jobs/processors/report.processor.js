import { storage } from "../../shared/adapters/storage.adapter.js";
import { queue } from "../../shared/adapters/queue.adapter.js";
import { ReportJob } from "../../models/reportJob.model.js";
import * as reportService from "../../services/report.service.js";
import { logger } from "../../config/logger.js";

const convertToCSV = (data) => {
  if (!data || data.length === 0) return "";
  const BOM = "\uFEFF";
  
  const header = Object.keys(data[0]).join(",");
  const rows = data.map(obj => 
    Object.values(obj).map(v => {
      let val = v;
      if (typeof val === "object" && val !== null) {
        val = JSON.stringify(val);
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(",")
  );
  
  return BOM + [header, ...rows].join("\n");
};

export const processReport = async (payload, messageReceiptHandle) => {
  const { reportType, tenantId, userId, jobId, filters } = payload;
  logger.info(`Processing report job ${jobId} of type ${reportType}`);

  try {
    let data = [];
    if (reportType === "revenue") {
      data = await reportService.getRevenueReport(tenantId, filters || {});
      data = data.map(b => ({
        Bill_Number: b.billNumber,
        Type: b.type,
        Date: b.finalizedAt,
        Total: b.total,
        Paid: b.amountPaid,
        Balance: b.balance,
        Status: b.status
      }));
    } else if (reportType === "outstanding-dues") {
      data = await reportService.getOutstandingDues(tenantId);
      data = data.map(b => ({
        Bill_Number: b.billNumber,
        Patient_Name: b.patientId?.name,
        Patient_Phone: b.patientId?.phone,
        Date: b.finalizedAt,
        Total: b.total,
        Paid: b.amountPaid,
        Balance: b.balance
      }));
    } else if (reportType === "doctor-collection") {
      // Just map revenue to it for now
      data = await reportService.getRevenueReport(tenantId, filters || {});
      data = data.map(b => ({
        Bill_Number: b.billNumber,
        Date: b.finalizedAt,
        Total: b.total,
        Paid: b.amountPaid
      }));
    }

    const csv = convertToCSV(data);
    const buffer = Buffer.from(csv, "utf-8");

    const key = storage.buildKey("report", { tenantId, jobId, reportType, ext: "csv" });
    try {
      await storage.upload(key, buffer, "text/csv");
      await ReportJob.findOneAndUpdate({ tenantId, jobId }, { status: "done", pdfKey: key });
      const url = await storage.getPresignedUrl(key, 3600); 
      try {
        await queue.send("whatsapp", {
          type: "report-ready",
          userId,
          tenantId,
          url,
          reportType
        });
      } catch (err) {
        logger.warn(`Failed to send WhatsApp message for report ${jobId}: ${err.message}`);
      }
    } catch (storageErr) {
      logger.warn(`S3 upload failed, saving report locally to /tmp/${jobId}.csv: ${storageErr.message}`);
      // Fallback for local development
      const fs = await import("fs");
      fs.writeFileSync(`/tmp/${jobId}.csv`, buffer);
      await ReportJob.findOneAndUpdate({ tenantId, jobId }, { status: "done", pdfKey: `/tmp/${jobId}.csv` });
    }

  } catch (err) {
    logger.error(`Error processing report job ${jobId}: ${err.message}`);
    await ReportJob.findOneAndUpdate({ tenantId, jobId }, { status: "failed", errorMessage: err.message });
  }
};
