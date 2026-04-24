import * as reportService from "../services/report.service.js";
import { sendOk } from "../utils/index.js";
import { ApiError } from "../utils/apiError.js";

export const getDashboard = async (req, res, next) => {
  try {
    const { from, to, date } = req.query;
    const data = await reportService.getDashboard(req.user.tenantId, { from, to, date }, req.user.role, req.user._id);
    return sendOk(res, data, "Dashboard data retrieved successfully");
  } catch (err) {
    next(err);
  }
};

export const requestExport = async (req, res, next) => {
  try {
    const data = await reportService.requestExport(req.user.tenantId, req.user._id, req.body);
    return sendOk(res, data, "Export requested successfully");
  } catch (err) {
    next(err);
  }
};

export const getExportJobStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const status = await reportService.getExportJobStatus(req.user.tenantId, jobId);
    
    if (!status) {
      throw new ApiError(404, "Export job not found");
    }

    return sendOk(res, status, "Export job status retrieved successfully");
  } catch (err) {
    next(err);
  }
};

export const getRevenueReport = async (req, res, next) => {
  try {
    const data = await reportService.getRevenueReport(req.user.tenantId, req.query);
    return sendOk(res, data, "Revenue report retrieved successfully");
  } catch (err) {
    next(err);
  }
};

export const getOutstandingDues = async (req, res, next) => {
  try {
    const data = await reportService.getOutstandingDues(req.user.tenantId);
    return sendOk(res, data, "Outstanding dues retrieved successfully");
  } catch (err) {
    next(err);
  }
};

export const getRecentExportJobs = async (req, res, next) => {
  try {
    const data = await reportService.getRecentExportJobs(req.user.tenantId, req.user._id);
    return sendOk(res, data, "Recent export jobs retrieved successfully");
  } catch (err) {
    next(err);
  }
};

export const getPatientInsights = async (req, res, next) => {
  try {
    const data = await reportService.getPatientInsights(req.user.tenantId, req.query);
    return sendOk(res, data, "Patient insights retrieved successfully");
  } catch (err) {
    next(err);
  }
};

export const getInventoryReports = async (req, res, next) => {
  try {
    const data = await reportService.getInventoryReports(req.user.tenantId);
    return sendOk(res, data, "Inventory reports retrieved successfully");
  } catch (err) {
    next(err);
  }
};
