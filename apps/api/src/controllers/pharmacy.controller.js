import * as pharmacyService from "../services/pharmacy.service.js";
import { sendCreated, sendOk } from "../utils/index.js";

// ── Inventory ─────────────────────────────────────────────────────────────

export const addInventoryItem = async (req, res, next) => {
  try {
    const item = await pharmacyService.addInventoryItem(
      req.user.tenantId,
      req.user.id,
      req.body
    );
    return sendCreated(res, item, "Inventory item created successfully");
  } catch (error) {
    next(error);
  }
};

export const listInventory = async (req, res, next) => {
  try {
    const items = await pharmacyService.listInventory(req.user.tenantId, req.query);
    return sendOk(res, items, "Inventory retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getInventoryItem = async (req, res, next) => {
  try {
    const item = await pharmacyService.getInventoryItem(req.user.tenantId, req.params.id);
    return sendOk(res, item, "Inventory item retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const addBatch = async (req, res, next) => {
  try {
    const item = await pharmacyService.addBatch(
      req.user.tenantId,
      req.params.id,
      req.body,
      req.user.id
    );
    return sendCreated(res, item, "Purchase batch added successfully");
  } catch (error) {
    next(error);
  }
};

// ── POS / Sales ───────────────────────────────────────────────────────────

export const createSale = async (req, res, next) => {
  try {
    const bill = await pharmacyService.createSale(
      req.user.tenantId,
      req.user.id,
      req.body
    );
    return sendCreated(res, bill, "Pharmacy sale created successfully");
  } catch (error) {
    next(error);
  }
};

export const listSales = async (req, res, next) => {
  try {
    const sales = await pharmacyService.listSales(req.user.tenantId, req.query);
    return sendOk(res, sales, "Pharmacy sales retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// ── Alerts ────────────────────────────────────────────────────────────────

export const getExpiryAlerts = async (req, res, next) => {
  try {
    const alerts = await pharmacyService.getExpiryAlerts(req.user.tenantId);
    return sendOk(res, alerts, "Expiry alerts retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getLowStockItems = async (req, res, next) => {
  try {
    const items = await pharmacyService.getLowStockItems(req.user.tenantId);
    return sendOk(res, items, "Low-stock items retrieved successfully");
  } catch (error) {
    next(error);
  }
};
