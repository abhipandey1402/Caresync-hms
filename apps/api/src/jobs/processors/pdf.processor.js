import { logger } from "../../config/logger.js";
import { Bill, Prescription, Tenant } from "../../models/index.js";
import { queue } from "../../shared/adapters/queue.adapter.js";
import { storage } from "../../shared/adapters/storage.adapter.js";
import { renderInvoicePdf } from "./invoicePdf.template.js";
import { renderPrescriptionPdf } from "./prescriptionPdf.template.js";

export const processPdf = async (
  payload,
  _message,
  {
    BillModel = Bill,
    TenantModel = Tenant,
    PrescriptionModel = Prescription,
    storageAdapter = storage,
    queueAdapter = queue,
    renderInvoice = renderInvoicePdf,
    renderPrescription = renderPrescriptionPdf,
    now = () => new Date()
  } = {}
) => {
  const { type, resourceId, tenantId, prescriptionId } = payload;

  if (!["invoice", "prescription-pdf"].includes(type)) {
    logger.info("[pdf] Unsupported job skipped", {
      jobType: type || "default"
    });
    return;
  }

  if (type === "prescription-pdf") {
    const resolvedId = prescriptionId || resourceId;
    const [prescription, tenant] = await Promise.all([
      PrescriptionModel.findOne({ _id: resolvedId, tenantId })
        .populate("patientId", "name uhid phone gender dateOfBirth")
        .populate("doctorId", "name profile")
        .populate({
          path: "visitId",
          populate: [
            { path: "patientId", select: "name uhid phone gender dateOfBirth" },
            { path: "doctorId", select: "name profile" }
          ]
        })
        .lean(),
      TenantModel.findById(tenantId).lean()
    ]);

    if (!prescription) {
      throw new Error("Prescription not found for PDF generation");
    }

    if (!tenant) {
      throw new Error("Tenant not found for prescription generation");
    }

    const pdfBuffer = await renderPrescription({ prescription, tenant });
    const key = storageAdapter.buildKey("prescription", { tenantId, resourceId: resolvedId });
    const generatedAt = now();

    await storageAdapter.upload(
      key,
      pdfBuffer,
      "application/pdf",
      {
        tenantId: String(tenantId),
        prescriptionId: String(resolvedId)
      },
      {
        contentDisposition: `inline; filename="prescription-${resolvedId}.pdf"`
      }
    );

    await PrescriptionModel.findOneAndUpdate(
      { _id: resolvedId, tenantId },
      {
        $set: {
          pdfKey: key,
          pdfGeneratedAt: generatedAt,
          deliveryStatus: "queued"
        }
      }
    );

    await queueAdapter.send("whatsapp", {
      type: "send-prescription",
      prescriptionId: String(resolvedId),
      tenantId: String(tenantId),
      pdfKey: key
    });
    return;
  }

  const [bill, tenant] = await Promise.all([
    BillModel.findOne({ _id: resourceId, tenantId })
      .populate("patientId", "name uhid abhaId phone address")
      .populate("lineItems.serviceId", "code name")
      .lean(),
    TenantModel.findById(tenantId).lean()
  ]);

  if (!bill) {
    throw new Error("Bill not found for invoice generation");
  }

  if (!tenant) {
    throw new Error("Tenant not found for invoice generation");
  }

  const pdfBuffer = await renderInvoice({ bill, tenant });
  const key = storageAdapter.buildKey("invoice", { tenantId, resourceId });
  const generatedAt = now();

  await storageAdapter.upload(
    key,
    pdfBuffer,
    "application/pdf",
    {
      tenantId: String(tenantId),
      billId: String(resourceId)
    },
    {
      contentDisposition: `inline; filename="${bill.billNumber}.pdf"`
    }
  );

  await BillModel.findOneAndUpdate(
    { _id: resourceId, tenantId },
    {
      $set: {
        invoicePdfKey: key,
        pdfGeneratedAt: generatedAt,
        invoiceDeliveryStatus: "queued"
      }
    }
  );

  await queueAdapter.send("whatsapp", {
    type: "send-invoice",
    billId: String(resourceId),
    tenantId: String(tenantId),
    pdfKey: key
  });
};
