import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { can } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import {
  billParamsSchema,
  cancelBillSchema,
  createBillSchema,
  listBillsSchema,
  paymentSchema,
  updateBillSchema
} from "../schemas/billing.schema.js";
import {
  cancelBill,
  createBill,
  finalizeBill,
  getBill,
  getInvoice,
  listBills,
  recordPayment,
  updateBill
} from "../controllers/billing.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/bills", can("billing", "write"), validate(createBillSchema), createBill);
router.get("/bills", can("billing", "read"), validate(listBillsSchema), listBills);
router.get("/bills/:id", can("billing", "read"), validate(billParamsSchema), getBill);
router.put("/bills/:id", can("billing", "write"), validate(updateBillSchema), updateBill);
router.post("/bills/:id/finalize", can("billing", "write"), validate(billParamsSchema), finalizeBill);
router.post("/bills/:id/payments", can("billing", "write"), validate(paymentSchema), recordPayment);
router.post("/bills/:id/cancel", can("billing", "write"), validate(cancelBillSchema), cancelBill);
router.get("/bills/:id/invoice", can("billing", "read"), validate(billParamsSchema), getInvoice);

export default router;
