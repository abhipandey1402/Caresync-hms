import dayjs from "dayjs";
import mongoose from "mongoose";
import { Bill, Patient, Sequence, Service, Tenant, Visit } from "../models/index.js";
import { queue } from "../shared/adapters/queue.adapter.js";
import { storage } from "../shared/adapters/storage.adapter.js";
import { ApiError } from "../utils/apiError.js";

const PAYMENT_MODES = Object.freeze(["cash", "upi", "card", "cheque", "insurance", "online"]);
const CUSTOM_GST_RATES = Object.freeze({
  consultation: 0,
  procedure: 12,
  ot: 18
});

const INDIAN_STATE_CODE_BY_NAME = Object.freeze({
  "andaman and nicobar islands": "35",
  "andhra pradesh": "37",
  "arunachal pradesh": "12",
  assam: "18",
  bihar: "10",
  chandigarh: "04",
  chhattisgarh: "22",
  "dadra and nagar haveli and daman and diu": "26",
  delhi: "07",
  goa: "30",
  gujarat: "24",
  haryana: "06",
  "himachal pradesh": "02",
  "jammu and kashmir": "01",
  jharkhand: "20",
  karnataka: "29",
  kerala: "32",
  ladakh: "38",
  lakshadweep: "31",
  "madhya pradesh": "23",
  maharashtra: "27",
  manipur: "14",
  meghalaya: "17",
  mizoram: "15",
  nagaland: "13",
  odisha: "21",
  puducherry: "34",
  punjab: "03",
  rajasthan: "08",
  sikkim: "11",
  "tamil nadu": "33",
  telangana: "36",
  tripura: "16",
  "uttar pradesh": "09",
  uttarakhand: "05",
  "west bengal": "19"
});

const normalizeTrimmedString = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

export const toPaise = (amount) => {
  if (amount === null || amount === undefined || amount === "") {
    return 0;
  }

  const numericValue = Number(amount);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    throw new ApiError(400, "Invalid monetary amount", [{ code: "INVALID_AMOUNT" }]);
  }

  return Math.round(numericValue * 100);
};

export const formatPaise = (amount) => `₹${(Number(amount || 0) / 100).toFixed(2)}`;

export const getCurrentFY = (date = new Date()) => {
  const current = dayjs(date);
  const fyStartYear = current.month() >= 3 ? current.year() : current.year() - 1;
  const fyEndYear = fyStartYear + 1;

  return `${String(fyStartYear).slice(-2)}${String(fyEndYear).slice(-2)}`;
};

export const extractStateCode = (value) => {
  const normalized = normalizeTrimmedString(value);

  if (!normalized) {
    return null;
  }

  if (/^\d{2}/.test(normalized)) {
    return normalized.slice(0, 2);
  }

  return INDIAN_STATE_CODE_BY_NAME[normalized.toLowerCase()] || null;
};

export const inferHealthcareGstRate = ({ category, description } = {}) => {
  const normalizedCategory = String(category || description || "").trim().toLowerCase();

  if (normalizedCategory.includes("consult")) {
    return CUSTOM_GST_RATES.consultation;
  }

  if (normalizedCategory.includes("procedure")) {
    return CUSTOM_GST_RATES.procedure;
  }

  if (normalizedCategory.includes("ot") || normalizedCategory.includes("operation")) {
    return CUSTOM_GST_RATES.ot;
  }

  return 0;
};

export const calculateGST = (lineItems, tenantGstin, patientState) => {
  const tenantStateCode = extractStateCode(tenantGstin);
  const patientStateCode = extractStateCode(patientState) || tenantStateCode;
  const isInterState = Boolean(tenantStateCode && patientStateCode && tenantStateCode !== patientStateCode);

  return lineItems.map((item) => {
    const baseAmount = item.quantity * item.rate;
    const gstAmount = Math.round(baseAmount * (item.gstRate / 100));
    const splitTax = Math.round(gstAmount / 2);

    return {
      ...item,
      baseAmount,
      gstAmount,
      cgst: isInterState ? 0 : splitTax,
      sgst: isInterState ? 0 : gstAmount - splitTax,
      igst: isInterState ? gstAmount : 0,
      totalAmount: baseAmount + gstAmount
    };
  });
};

export const generateBillNumber = async (tenantId, session, now = new Date()) => {
  const ym = dayjs(now).format("YYYYMM");
  const seq = await Sequence.findOneAndUpdate(
    { tenantId, type: "BILL", meta: ym },
    { $inc: { value: 1 } },
    { upsert: true, new: true, session, setDefaultsOnInsert: true }
  );

  return `${ym}-${String(seq.value).padStart(4, "0")}`;
};

export const generateGSTInvoiceNumber = (gstin, billNumber, date = new Date()) => {
  const normalizedGstin = normalizeTrimmedString(gstin);

  if (!normalizedGstin) {
    return null;
  }

  return `${normalizedGstin.toUpperCase()}/${getCurrentFY(date)}/${billNumber}`;
};

const getPatientState = (patient = {}) =>
  patient.address?.state || patient.address?.district || null;

const computeDiscountPercent = (subtotalWithTax, discount) =>
  subtotalWithTax > 0 ? (discount / subtotalWithTax) * 100 : 0;

export const buildBillComputation = ({ normalizedLineItems, discount = 0, discountReason = null, tenantGstin, patientState }) => {
  const lineItems = calculateGST(normalizedLineItems, tenantGstin, patientState);
  const subtotal = lineItems.reduce((sum, item) => sum + item.baseAmount, 0);
  const totalTax = lineItems.reduce((sum, item) => sum + item.gstAmount, 0);
  const grossTotal = lineItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const discountPercent = computeDiscountPercent(grossTotal, discount);

  if (discount > grossTotal) {
    throw new ApiError(400, "Discount cannot exceed bill total", [{ code: "DISCOUNT_EXCEEDS_TOTAL" }]);
  }

  if (discountPercent > 20 && !normalizeTrimmedString(discountReason)) {
    throw new ApiError(400, "Discount reason is required when discount exceeds 20% of the bill total", [
      { code: "DISCOUNT_REASON_REQUIRED" }
    ]);
  }

  return {
    lineItems,
    subtotal,
    totalTax,
    taxBreakup: {
      cgst: lineItems.reduce((sum, item) => sum + item.cgst, 0),
      sgst: lineItems.reduce((sum, item) => sum + item.sgst, 0),
      igst: lineItems.reduce((sum, item) => sum + item.igst, 0)
    },
    discount,
    discountReason: normalizeTrimmedString(discountReason),
    total: grossTotal - discount,
    balance: grossTotal - discount
  };
};

const fetchServicesMap = async (tenantId, lineItems = [], session) => {
  const serviceIds = [...new Set(lineItems.map((item) => item.serviceId).filter(Boolean))];

  if (serviceIds.length === 0) {
    return new Map();
  }

  const services = await Service.find({
    _id: { $in: serviceIds },
    tenantId,
    isActive: true
  })
    .session(session || null)
    .lean();

  return new Map(services.map((service) => [String(service._id), service]));
};

const normalizeLineItems = async (tenantId, lineItems = [], session) => {
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    throw new ApiError(400, "At least one bill line item is required", [{ code: "LINE_ITEMS_REQUIRED" }]);
  }

  const serviceMap = await fetchServicesMap(tenantId, lineItems, session);

  return lineItems.map((item) => {
    const quantity = Number(item.qty || item.quantity || 0);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ApiError(400, "Line item quantity must be a positive integer", [
        { code: "INVALID_LINE_ITEM_QUANTITY" }
      ]);
    }

    const service = item.serviceId ? serviceMap.get(String(item.serviceId)) : null;

    if (item.serviceId && !service) {
      throw new ApiError(404, "Service not found", [{ code: "SERVICE_NOT_FOUND" }]);
    }

    const rateInRupees = item.rate ?? service?.defaultRate;

    if (rateInRupees === undefined || rateInRupees === null) {
      throw new ApiError(400, "Line item rate is required", [{ code: "LINE_ITEM_RATE_REQUIRED" }]);
    }

    const gstRate = item.gstRate ?? service?.gstRate ?? inferHealthcareGstRate({
      category: service?.category,
      description: item.name
    });

    const description = normalizeTrimmedString(item.name) || service?.name;

    if (!description) {
      throw new ApiError(400, "Line item description is required", [
        { code: "LINE_ITEM_DESCRIPTION_REQUIRED" }
      ]);
    }

    return {
      serviceId: service?._id || null,
      serviceCode: normalizeTrimmedString(service?.code),
      description,
      hsnCode: normalizeTrimmedString(item.hsnCode) || normalizeTrimmedString(service?.sacCode),
      quantity,
      rate: toPaise(rateInRupees),
      gstRate: Number(gstRate)
    };
  });
};

const fetchBillDependencies = async (tenantId, payload, session) => {
  const patientPromise = Patient.findOne({ _id: payload.patientId, tenantId }).session(session || null).lean();
  const visitPromise = payload.visitId
    ? Visit.findOne({ _id: payload.visitId, tenantId }).session(session || null).lean()
    : Promise.resolve(null);
  const tenantPromise = Tenant.findById(tenantId).lean();

  const [patient, visit, tenant] = await Promise.all([patientPromise, visitPromise, tenantPromise]);

  if (!patient) {
    throw new ApiError(404, "Patient not found", [{ code: "PATIENT_NOT_FOUND" }]);
  }

  if (payload.visitId && !visit) {
    throw new ApiError(404, "Visit not found", [{ code: "VISIT_NOT_FOUND" }]);
  }

  if (!tenant) {
    throw new ApiError(404, "Tenant not found", [{ code: "TENANT_NOT_FOUND" }]);
  }

  return { patient, visit, tenant };
};

const resolveBillPayload = async (tenantId, payload, session) => {
  const { patient, visit, tenant } = await fetchBillDependencies(tenantId, payload, session);
  const normalizedLineItems = await normalizeLineItems(tenantId, payload.lineItems, session);
  const discount = toPaise(payload.discount || 0);
  const computation = buildBillComputation({
    normalizedLineItems,
    discount,
    discountReason: payload.discountReason,
    tenantGstin: tenant.gstin,
    patientState: getPatientState(patient)
  });

  return {
    patient,
    visit,
    tenant,
    computation,
    normalizedType: payload.type || "opd"
  };
};

const queueInvoiceGeneration = async (bill) => {
  if (bill.status === "draft") {
    return;
  }

  await queue.send("pdf", {
    type: "invoice",
    tenantId: String(bill.tenantId),
    resourceId: String(bill._id)
  });
};

export const createBill = async (tenantId, actorId, payload) => {
  const session = await mongoose.startSession();
  let bill;

  try {
    await session.withTransaction(async () => {
      const { tenant, computation, normalizedType } = await resolveBillPayload(tenantId, payload, session);
      const now = new Date();
      const billNumber = await generateBillNumber(tenantId, session, now);
      const isDraft = Boolean(payload.isDraft);

      [bill] = await Bill.create(
        [
          {
            tenantId,
            patientId: payload.patientId,
            visitId: payload.visitId || null,
            type: normalizedType,
            billNumber,
            gstInvoiceNumber: isDraft ? null : generateGSTInvoiceNumber(tenant.gstin, billNumber, now),
            status: isDraft ? "draft" : "unpaid",
            ...computation,
            amountPaid: 0,
            payments: [],
            finalizedAt: isDraft ? null : now,
            createdBy: actorId,
            updatedBy: actorId,
            invoiceDeliveryStatus: isDraft ? "pending" : "queued"
          }
        ],
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  await queueInvoiceGeneration(bill);
  return getBillById(tenantId, bill._id);
};

const getEditableBill = async (tenantId, billId) => {
  const bill = await Bill.findOne({ _id: billId, tenantId });

  if (!bill) {
    throw new ApiError(404, "Bill not found", [{ code: "BILL_NOT_FOUND" }]);
  }

  if (bill.status !== "draft") {
    throw new ApiError(403, "Finalized bills cannot be edited", [{ code: "BILL_FINALIZED" }]);
  }

  return bill;
};

export const updateBill = async (tenantId, actorId, billId, payload) => {
  const existingBill = await getEditableBill(tenantId, billId);
  const existingLineItems = existingBill.lineItems.map((item) => ({
    serviceId: item.serviceId || undefined,
    name: item.description,
    qty: item.quantity,
    rate: item.rate / 100,
    gstRate: item.gstRate,
    hsnCode: item.hsnCode
  }));
  const { computation, normalizedType } = await resolveBillPayload(
    tenantId,
    {
      patientId: payload.patientId || existingBill.patientId,
      visitId: payload.visitId === undefined ? existingBill.visitId : payload.visitId,
      type: payload.type || existingBill.type,
      lineItems: payload.lineItems || existingLineItems,
      discount: payload.discount ?? existingBill.discount / 100,
      discountReason: payload.discountReason ?? existingBill.discountReason
    }
  );

  Object.assign(existingBill, {
    patientId: payload.patientId || existingBill.patientId,
    visitId: payload.visitId === undefined ? existingBill.visitId : payload.visitId,
    type: normalizedType,
    gstInvoiceNumber: null,
    ...computation,
    updatedBy: actorId
  });

  await existingBill.save();
  return getBillById(tenantId, existingBill._id);
};

export const finalizeBill = async (tenantId, actorId, billId) => {
  const bill = await getEditableBill(tenantId, billId);
  const tenant = await Tenant.findById(tenantId).lean();
  const now = new Date();

  bill.status = bill.total === 0 ? "paid" : "unpaid";
  bill.gstInvoiceNumber = generateGSTInvoiceNumber(tenant?.gstin, bill.billNumber, now);
  bill.finalizedAt = now;
  bill.invoiceDeliveryStatus = "queued";
  bill.updatedBy = actorId;

  await bill.save();
  await queueInvoiceGeneration(bill);

  return getBillById(tenantId, bill._id);
};

export const cancelBill = async (tenantId, actorId, billId, cancelledReason = null) => {
  const bill = await Bill.findOne({ _id: billId, tenantId });

  if (!bill) {
    throw new ApiError(404, "Bill not found", [{ code: "BILL_NOT_FOUND" }]);
  }

  bill.status = "cancelled";
  bill.cancelledAt = new Date();
  bill.cancelledReason = normalizeTrimmedString(cancelledReason);
  bill.updatedBy = actorId;
  await bill.save();

  return getBillById(tenantId, bill._id);
};

export const recordPayment = async (
  billId,
  paymentData,
  userId,
  tenantId,
  { BillModel = Bill, queueAdapter = queue, getBill = getBillById } = {}
) => {
  if (!PAYMENT_MODES.includes(paymentData.mode)) {
    throw new ApiError(400, "Unsupported payment mode", [{ code: "INVALID_PAYMENT_MODE" }]);
  }

  const bill = await BillModel.findOne({ _id: billId, tenantId });

  if (!bill || bill.status === "cancelled") {
    throw new ApiError(404, "Bill not found", [{ code: "BILL_NOT_FOUND" }]);
  }

  if (bill.status === "draft") {
    throw new ApiError(400, "Draft bills cannot take payments", [{ code: "DRAFT_BILL_PAYMENT_FORBIDDEN" }]);
  }

  const paymentAmount = toPaise(paymentData.amount);

  if (paymentAmount > bill.balance) {
    throw new ApiError(400, `Payment exceeds balance of ${formatPaise(bill.balance)}`, [
      { code: "PAYMENT_EXCEEDS_BALANCE" }
    ]);
  }

  const timestamp = new Date();

  bill.payments.push({
    mode: paymentData.mode,
    amount: paymentAmount,
    reference: normalizeTrimmedString(paymentData.reference),
    note: normalizeTrimmedString(paymentData.note),
    receivedBy: userId,
    timestamp
  });
  bill.amountPaid += paymentAmount;
  bill.balance = bill.total - bill.amountPaid;
  bill.status = bill.balance === 0 ? "paid" : "partial";
  bill.updatedBy = userId;

  await bill.save();

  if (bill.status === "paid") {
    await queueAdapter.send("whatsapp", {
      type: "bill-receipt",
      billId: String(bill._id),
      tenantId: String(tenantId)
    });
  }

  return getBill(tenantId, bill._id);
};

export const listBills = async (tenantId, query = {}) => {
  const filter = { tenantId };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.patientId) {
    filter.patientId = query.patientId;
  }

  return Bill.find(filter)
    .sort({ createdAt: -1 })
    .populate("patientId", "name uhid phone")
    .lean();
};

export const getBillById = async (tenantId, billId) => {
  const bill = await Bill.findOne({ _id: billId, tenantId })
    .populate("patientId", "name uhid phone abhaId address")
    .populate("visitId", "type visitDate tokenNumber")
    .populate("lineItems.serviceId", "code name category sacCode gstRate defaultRate")
    .populate("payments.receivedBy", "name role")
    .lean();

  if (!bill) {
    throw new ApiError(404, "Bill not found", [{ code: "BILL_NOT_FOUND" }]);
  }

  return bill;
};

export const getInvoiceUrl = async (tenantId, billId) => {
  const bill = await Bill.findOne({ _id: billId, tenantId }).lean();

  if (!bill) {
    throw new ApiError(404, "Bill not found", [{ code: "BILL_NOT_FOUND" }]);
  }

  if (!bill.invoicePdfKey) {
    throw new ApiError(409, "Invoice PDF is not generated yet", [{ code: "INVOICE_NOT_READY" }]);
  }

  const url = await storage.getPresignedUrl(bill.invoicePdfKey, 900, {
    responseContentType: "application/pdf",
    responseContentDisposition: `inline; filename="${bill.billNumber}.pdf"`
  });

  return {
    key: bill.invoicePdfKey,
    expiresIn: 900,
    url
  };
};

export const __private__ = {
  computeDiscountPercent,
  fetchServicesMap,
  getPatientState,
  normalizeLineItems,
  normalizeTrimmedString,
  queueInvoiceGeneration,
  resolveBillPayload
};
