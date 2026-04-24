import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { can } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import {
  addBatchSchema,
  addInventoryItemSchema,
  createSaleSchema,
  inventoryParamsSchema,
  listInventorySchema,
  listSalesSchema
} from "../schemas/pharmacy.schema.js";
import {
  addBatch,
  addInventoryItem,
  createSale,
  getExpiryAlerts,
  getInventoryItem,
  getLowStockItems,
  listInventory,
  listSales
} from "../controllers/pharmacy.controller.js";

const router = Router();

router.use(requireAuth);

// ── Inventory ─────────────────────────────────────────────────────────────
router.post(
  "/pharmacy/inventory",
  can("pharmacy", "write"),
  validate(addInventoryItemSchema),
  addInventoryItem
);

router.get(
  "/pharmacy/inventory",
  can("pharmacy", "read"),
  validate(listInventorySchema),
  listInventory
);

router.get(
  "/pharmacy/inventory/:id",
  can("pharmacy", "read"),
  validate(inventoryParamsSchema),
  getInventoryItem
);

router.post(
  "/pharmacy/inventory/:id/batch",
  can("pharmacy", "write"),
  validate(addBatchSchema),
  addBatch
);

// ── POS / Sales ───────────────────────────────────────────────────────────
router.post(
  "/pharmacy/sales",
  can("pharmacy", "write"),
  validate(createSaleSchema),
  createSale
);

router.get(
  "/pharmacy/sales",
  can("pharmacy", "read"),
  validate(listSalesSchema),
  listSales
);

// ── Alerts ────────────────────────────────────────────────────────────────
router.get(
  "/pharmacy/expiry-alerts",
  can("pharmacy", "read"),
  getExpiryAlerts
);

router.get(
  "/pharmacy/low-stock",
  can("pharmacy", "read"),
  getLowStockItems
);

export default router;
