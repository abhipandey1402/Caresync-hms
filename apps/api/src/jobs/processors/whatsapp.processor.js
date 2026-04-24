import { logger } from "../../config/logger.js";
import { Bill, Notification, Prescription, Tenant } from "../../models/index.js";
import { formatPaise } from "../../services/billing.service.js";
import { storage } from "../../shared/adapters/storage.adapter.js";
import { whatsapp } from "../../shared/adapters/whatsapp.adapter.js";

const normalizeIndianPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
};

const buildNotificationPayload = ({ template, billId, pdfKey }) => ({
  template,
  billId,
  ...(pdfKey ? { pdfKey } : {})
});

export const processWhatsApp = async (
  payload,
  _message,
  {
    BillModel = Bill,
    PrescriptionModel = Prescription,
    TenantModel = Tenant,
    NotificationModel = Notification,
    storageAdapter = storage,
    whatsappAdapter = whatsapp,
    now = () => new Date()
  } = {}
) => {
  const { type, billId, tenantId, pdfKey, prescriptionId } = payload;

  if (!["send-invoice", "bill-receipt", "tenant.welcome", "send-prescription", "expiry-alert", "low-stock-alert"].includes(type)) {
    logger.info("[whatsapp] Unsupported job skipped", {
      jobType: type || "default"
    });
    return;
  }

  if (type === "expiry-alert" || type === "low-stock-alert") {
    const tenant = await TenantModel.findById(tenantId).lean();

    if (!tenant) {
      throw new Error("Tenant not found for pharmacy alert delivery");
    }

    const recipient = normalizeIndianPhone(tenant.contactPhone || tenant.phone);

    if (!recipient) {
      logger.warn("[whatsapp] No recipient phone for pharmacy alert", { tenantId, type });
      return;
    }

    if (type === "expiry-alert") {
      const { medicines, daysUntilExpiry } = payload;
      const medicineList = (medicines || [])
        .map((m) => `• ${m.name} (Batch ${m.batch}) — Exp ${m.expiry}, Qty: ${m.qty}`)
        .join("\n");

      await whatsappAdapter.sendTemplateMessage({
        to: recipient,
        template: "pharmacy_expiry_alert",
        language: "en",
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: String(daysUntilExpiry) },
              { type: "text", text: String((medicines || []).length) },
              { type: "text", text: medicineList }
            ]
          }
        ]
      });
    } else {
      const { medicines } = payload;
      const medicineList = (medicines || [])
        .map((m) => `• ${m.name} — Stock: ${m.totalQty} (Reorder at: ${m.reorderLevel})`)
        .join("\n");

      await whatsappAdapter.sendTemplateMessage({
        to: recipient,
        template: "pharmacy_low_stock_alert",
        language: "en",
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: String((medicines || []).length) },
              { type: "text", text: medicineList }
            ]
          }
        ]
      });
    }

    logger.info(`[whatsapp] Pharmacy alert sent`, { type, tenantId, recipient });
    return;
  }

  if (type === "tenant.welcome") {
    await whatsappAdapter.sendTemplateMessage({
      to: normalizeIndianPhone(payload.phone),
      template: payload.template || "tenant_welcome",
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: payload.variables?.ownerName || "User" },
            { type: "text", text: payload.variables?.clinicName || "CareSync" },
            { type: "text", text: payload.variables?.tenantSlug || "" }
          ]
        }
      ]
    });
    return;
  }

  if (type === "send-prescription") {
    const [prescription, tenant] = await Promise.all([
      PrescriptionModel.findOne({ _id: prescriptionId, tenantId })
        .populate("patientId", "name phone")
        .populate("doctorId", "name")
        .lean(),
      TenantModel.findById(tenantId).lean()
    ]);

    if (!prescription) {
      throw new Error("Prescription not found for WhatsApp delivery");
    }

    if (!tenant) {
      throw new Error("Tenant not found for WhatsApp delivery");
    }

    const recipient = normalizeIndianPhone(prescription.patientId?.phone);

    try {
      const prescriptionUrl = await storageAdapter.getPresignedUrl(pdfKey, 900, {
        responseContentType: "application/pdf",
        responseContentDisposition: `inline; filename="prescription-${prescriptionId}.pdf"`
      });

      await whatsappAdapter.sendTemplateMessage({
        to: recipient,
        template: "prescription_pdf",
        language: "hi",
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: prescription.patientId?.name || "Patient" },
              { type: "text", text: prescription.doctorId?.name || "Doctor" },
              {
                type: "text",
                text: prescription.followUpDate
                  ? new Date(prescription.followUpDate).toLocaleDateString("en-IN")
                  : "NA"
              }
            ]
          },
          {
            type: "button",
            sub_type: "url",
            index: 0,
            parameters: [{ type: "text", text: prescriptionUrl }]
          }
        ]
      });

      await PrescriptionModel.findOneAndUpdate(
        { _id: prescriptionId, tenantId },
        {
          $set: {
            deliveryStatus: "sent",
            deliveredAt: now()
          }
        }
      );

      await NotificationModel.create({
        tenantId,
        channel: "whatsapp",
        recipient,
        template: "prescription_pdf",
        status: "sent",
        resourceId: prescription._id,
        payload: { template: "prescription_pdf", prescriptionId, pdfKey },
        sentAt: now()
      });
      return;
    } catch (error) {
      await NotificationModel.create({
        tenantId,
        channel: "whatsapp",
        recipient,
        template: "prescription_pdf",
        status: "failed",
        resourceId: prescription?._id || null,
        payload: { template: "prescription_pdf", prescriptionId, pdfKey, error: error.message }
      });

      await PrescriptionModel.findOneAndUpdate(
        { _id: prescriptionId, tenantId },
        {
          $set: {
            deliveryStatus: "failed"
          }
        }
      );

      throw error;
    }
  }

  const [bill, tenant] = await Promise.all([
    BillModel.findOne({ _id: billId, tenantId }).populate("patientId", "name phone").lean(),
    TenantModel.findById(tenantId).lean()
  ]);

  if (!bill) {
    throw new Error("Bill not found for WhatsApp delivery");
  }

  if (!tenant) {
    throw new Error("Tenant not found for WhatsApp delivery");
  }

  const recipient = normalizeIndianPhone(bill.patientId?.phone);
  const sentAt = now();

  try {
    if (type === "send-invoice") {
      const invoiceUrl = await storageAdapter.getPresignedUrl(pdfKey, 900, {
        responseContentType: "application/pdf",
        responseContentDisposition: `inline; filename="${bill.billNumber}.pdf"`
      });

      await whatsappAdapter.sendTemplateMessage({
        to: recipient,
        template: "bill_invoice",
        language: "hi",
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: bill.patientId?.name || "Patient" },
              { type: "text", text: formatPaise(bill.total) },
              { type: "text", text: tenant.name }
            ]
          },
          {
            type: "button",
            sub_type: "url",
            index: 0,
            parameters: [{ type: "text", text: invoiceUrl }]
          }
        ]
      });

      await BillModel.findOneAndUpdate(
        { _id: billId, tenantId },
        {
          $set: {
            invoiceDeliveryStatus: "sent",
            invoiceDeliveredAt: sentAt
          }
        }
      );

      await NotificationModel.create({
        tenantId,
        channel: "whatsapp",
        recipient,
        template: "bill_invoice",
        status: "sent",
        resourceId: bill._id,
        payload: buildNotificationPayload({ template: "bill_invoice", billId, pdfKey }),
        sentAt
      });
      return;
    }

    await whatsappAdapter.sendTemplateMessage({
      to: recipient,
      template: "bill_receipt",
      language: "hi",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: bill.patientId?.name || "Patient" },
            { type: "text", text: formatPaise(bill.total) },
            { type: "text", text: tenant.name }
          ]
        }
      ]
    });

    await NotificationModel.create({
      tenantId,
      channel: "whatsapp",
      recipient,
      template: "bill_receipt",
      status: "sent",
      resourceId: bill._id,
      payload: buildNotificationPayload({ template: "bill_receipt", billId }),
      sentAt
    });
  } catch (error) {
    await NotificationModel.create({
      tenantId,
      channel: "whatsapp",
      recipient,
      template: type === "send-invoice" ? "bill_invoice" : "bill_receipt",
      status: "failed",
      resourceId: bill?._id || null,
      payload: {
        ...buildNotificationPayload({
          template: type === "send-invoice" ? "bill_invoice" : "bill_receipt",
          billId,
          pdfKey
        }),
        error: error.message
      }
    });

    if (type === "send-invoice") {
      await BillModel.findOneAndUpdate(
        { _id: billId, tenantId },
        {
          $set: {
            invoiceDeliveryStatus: "failed"
          }
        }
      );
    }

    throw error;
  }
};
