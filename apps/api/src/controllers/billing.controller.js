import * as billingService from "../services/billing.service.js";
import { sendCreated, sendOk } from "../utils/index.js";

export const createBill = async (req, res, next) => {
  try {
    const bill = await billingService.createBill(req.user.tenantId, req.user.id, req.body);
    return sendCreated(res, bill, "Bill created successfully");
  } catch (error) {
    next(error);
  }
};

export const listBills = async (req, res, next) => {
  try {
    const bills = await billingService.listBills(req.user.tenantId, req.query);
    return sendOk(res, bills, "Bills retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getBill = async (req, res, next) => {
  try {
    const bill = await billingService.getBillById(req.user.tenantId, req.params.id);
    return sendOk(res, bill, "Bill retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateBill = async (req, res, next) => {
  try {
    const bill = await billingService.updateBill(req.user.tenantId, req.user.id, req.params.id, req.body);
    return sendOk(res, bill, "Bill updated successfully");
  } catch (error) {
    next(error);
  }
};

export const finalizeBill = async (req, res, next) => {
  try {
    const bill = await billingService.finalizeBill(req.user.tenantId, req.user.id, req.params.id);
    return sendOk(res, bill, "Bill finalized successfully");
  } catch (error) {
    next(error);
  }
};

export const cancelBill = async (req, res, next) => {
  try {
    const bill = await billingService.cancelBill(
      req.user.tenantId,
      req.user.id,
      req.params.id,
      req.body.cancelledReason
    );
    return sendOk(res, bill, "Bill cancelled successfully");
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    const bill = await billingService.recordPayment(req.params.id, req.body, req.user.id, req.user.tenantId);
    return sendOk(res, bill, "Payment recorded successfully");
  } catch (error) {
    next(error);
  }
};

export const getInvoice = async (req, res, next) => {
  try {
    const invoice = await billingService.getInvoiceUrl(req.user.tenantId, req.params.id);
    return sendOk(res, invoice, "Invoice URL generated successfully");
  } catch (error) {
    next(error);
  }
};
