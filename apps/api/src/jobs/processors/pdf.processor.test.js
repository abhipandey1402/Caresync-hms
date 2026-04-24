import { jest } from "@jest/globals";
import { processPdf } from "./pdf.processor.js";

const createPopulateChain = (result) => {
  const chain = {
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result)
  };

  return chain;
};

describe("pdf processor", () => {
  it("renders, uploads, and queues invoice delivery jobs", async () => {
    const bill = {
      _id: "bill-1",
      billNumber: "202604-0001",
      patientId: { name: "Ramesh", uhid: "P-001" },
      lineItems: []
    };
    const tenant = { _id: "tenant-1", name: "Sharma Nursing Home", gstin: "10AABCS1429B1Z5" };
    const BillModel = {
      findOne: jest.fn().mockReturnValue(createPopulateChain(bill)),
      findOneAndUpdate: jest.fn().mockResolvedValue(undefined)
    };
    const TenantModel = {
      findById: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(tenant) })
    };
    const storageAdapter = {
      buildKey: jest.fn().mockReturnValue("invoices/tenant-1/2026/04/bill-1.pdf"),
      upload: jest.fn().mockResolvedValue("invoices/tenant-1/2026/04/bill-1.pdf")
    };
    const queueAdapter = {
      send: jest.fn().mockResolvedValue(undefined)
    };
    const renderInvoice = jest.fn().mockResolvedValue(Buffer.from("pdf"));

    await processPdf(
      { type: "invoice", resourceId: "bill-1", tenantId: "tenant-1" },
      null,
      { BillModel, TenantModel, storageAdapter, queueAdapter, renderInvoice, now: () => new Date("2026-04-24T10:00:00.000Z") }
    );

    expect(renderInvoice).toHaveBeenCalledWith({ bill, tenant });
    expect(storageAdapter.upload).toHaveBeenCalled();
    expect(BillModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "bill-1", tenantId: "tenant-1" },
      expect.objectContaining({
        $set: expect.objectContaining({
          invoicePdfKey: "invoices/tenant-1/2026/04/bill-1.pdf",
          invoiceDeliveryStatus: "queued"
        })
      })
    );
    expect(queueAdapter.send).toHaveBeenCalledWith("whatsapp", {
      type: "send-invoice",
      billId: "bill-1",
      tenantId: "tenant-1",
      pdfKey: "invoices/tenant-1/2026/04/bill-1.pdf"
    });
  });

  it("renders, uploads, and queues prescription delivery jobs", async () => {
    const prescription = {
      _id: "rx-1",
      patientId: { name: "Ramesh", uhid: "P-001" },
      doctorId: { name: "Dr. Sharma" },
      medicines: []
    };
    const tenant = { _id: "tenant-1", name: "Sharma Nursing Home" };
    const PrescriptionModel = {
      findOne: jest.fn().mockReturnValue(createPopulateChain(prescription)),
      findOneAndUpdate: jest.fn().mockResolvedValue(undefined)
    };
    const TenantModel = {
      findById: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(tenant) })
    };
    const storageAdapter = {
      buildKey: jest.fn().mockReturnValue("prescriptions/tenant-1/2026/04/rx-1.pdf"),
      upload: jest.fn().mockResolvedValue("prescriptions/tenant-1/2026/04/rx-1.pdf")
    };
    const queueAdapter = {
      send: jest.fn().mockResolvedValue(undefined)
    };
    const renderPrescription = jest.fn().mockResolvedValue(Buffer.from("pdf"));

    await processPdf(
      { type: "prescription-pdf", prescriptionId: "rx-1", tenantId: "tenant-1" },
      null,
      { PrescriptionModel, TenantModel, storageAdapter, queueAdapter, renderPrescription }
    );

    expect(renderPrescription).toHaveBeenCalledWith({ prescription, tenant });
    expect(PrescriptionModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "rx-1", tenantId: "tenant-1" },
      expect.objectContaining({
        $set: expect.objectContaining({
          pdfKey: "prescriptions/tenant-1/2026/04/rx-1.pdf",
          deliveryStatus: "queued"
        })
      })
    );
    expect(queueAdapter.send).toHaveBeenCalledWith("whatsapp", {
      type: "send-prescription",
      prescriptionId: "rx-1",
      tenantId: "tenant-1",
      pdfKey: "prescriptions/tenant-1/2026/04/rx-1.pdf"
    });
  });
});
