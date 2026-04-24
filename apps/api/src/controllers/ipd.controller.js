import * as ipdService from "../services/ipd.service.js";
import { sendCreated, sendOk } from "../utils/index.js";

export const createWard = async (req, res, next) => {
  try {
    const ward = await ipdService.createWard(req.user.tenantId, req.body);
    return sendCreated(res, ward, "Ward created successfully");
  } catch (err) {
    next(err);
  }
};

export const addBeds = async (req, res, next) => {
  try {
    const beds = await ipdService.addBeds(req.user.tenantId, req.body.wardId, req.body.beds);
    return sendCreated(res, beds, "Beds added successfully");
  } catch (err) {
    next(err);
  }
};

export const getBedMap = async (req, res, next) => {
  try {
    const bedMap = await ipdService.getBedMap(req.user.tenantId);
    return sendOk(res, bedMap, "Bed map retrieved successfully");
  } catch (err) {
    next(err);
  }
};

export const listBeds = async (req, res, next) => {
  try {
    const beds = await ipdService.listBeds(req.user.tenantId, req.query);
    return sendOk(res, beds, "Beds retrieved successfully");
  } catch (err) {
    next(err);
  }
};

export const admitPatient = async (req, res, next) => {
  try {
    const admission = await ipdService.admitPatient(req.user.tenantId, req.user.id, req.body);
    return sendCreated(res, admission, "Patient admitted successfully");
  } catch (err) {
    next(err);
  }
};

export const addDailyCharges = async (req, res, next) => {
  try {
    const admission = await ipdService.addDailyCharges(req.user.tenantId, req.params.id, req.body);
    return sendOk(res, admission, "Daily charges added successfully");
  } catch (err) {
    next(err);
  }
};

export const listAdmissions = async (req, res, next) => {
  try {
    const admissions = await ipdService.listAdmissions(req.user.tenantId, req.query);
    return sendOk(res, admissions, "Admissions retrieved successfully");
  } catch (err) {
    next(err);
  }
};

export const dischargePatient = async (req, res, next) => {
  try {
    const result = await ipdService.dischargePatient(req.user.tenantId, req.user.id, req.params.id);
    return sendOk(res, result, "Patient discharged successfully");
  } catch (err) {
    next(err);
  }
};
