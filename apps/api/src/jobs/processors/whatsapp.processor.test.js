import { jest } from "@jest/globals";
import { processWhatsApp } from "./whatsapp.processor.js";

const createBillQuery = (bill) => ({
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(bill)
});

describe("whatsapp processor", () => {
  it("sends invoice WhatsApp messages and records delivery state", async () => {
    const bill = {
      _id: "bill-1",
      billNumber: "202604-0042",
      total: 48600,
      patientId: {
        name: "Ramesh Kumar",
        phone: "9876543210"
      }
    };
    const tenant = { _id: "tenant-1", name: "Sharma Nursing Home" };
    const BillModel = {
      findOne: jest.fn().mockReturnValue(createBillQuery(bill)),
      findOneAndUpdate: jest.fn().mockResolvedValue(undefined)
    };
    const TenantModel = {
      findById: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(tenant) })
    };
    const NotificationModel = {
      create: jest.fn().mockResolvedValue(undefined)
    };
    const storageAdapter = {
      getPresignedUrl: jest.fn().mockResolvedValue("https://signed.example/invoice")
    };
    const whatsappAdapter = {
      sendTemplateMessage: jest.fn().mockResolvedValue(undefined)
    };

    await processWhatsApp(
      { type: "send-invoice", billId: "bill-1", tenantId: "tenant-1", pdfKey: "invoices/key.pdf" },
      null,
      { BillModel, TenantModel, NotificationModel, storageAdapter, whatsappAdapter, now: () => new Date("2026-04-24T10:00:00.000Z") }
    );

    expect(storageAdapter.getPresignedUrl).toHaveBeenCalledWith("invoices/key.pdf", 900, expect.any(Object));
    expect(whatsappAdapter.sendTemplateMessage).toHaveBeenCalled();
    expect(BillModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "bill-1", tenantId: "tenant-1" },
      {
        $set: {
          invoiceDeliveryStatus: "sent",
          invoiceDeliveredAt: new Date("2026-04-24T10:00:00.000Z")
        }
      }
    );
    expect(NotificationModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "tenant-1",
        channel: "whatsapp",
        template: "bill_invoice",
        status: "sent"
      })
    );
  });

  it("marks invoice delivery failed so the bill can show a failed badge", async () => {
    const bill = {
      _id: "bill-1",
      billNumber: "202604-0042",
      total: 48600,
      patientId: {
        name: "Ramesh Kumar",
        phone: "9876543210"
      }
    };
    const BillModel = {
      findOne: jest.fn().mockReturnValue(createBillQuery(bill)),
      findOneAndUpdate: jest.fn().mockResolvedValue(undefined)
    };
    const TenantModel = {
      findById: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: "tenant-1", name: "Clinic" }) })
    };
    const NotificationModel = {
      create: jest.fn().mockResolvedValue(undefined)
    };

    await expect(
      processWhatsApp(
        { type: "send-invoice", billId: "bill-1", tenantId: "tenant-1", pdfKey: "invoices/key.pdf" },
        null,
        {
          BillModel,
          TenantModel,
          NotificationModel,
          storageAdapter: { getPresignedUrl: jest.fn().mockResolvedValue("https://signed.example/invoice") },
          whatsappAdapter: { sendTemplateMessage: jest.fn().mockRejectedValue(new Error("Meta outage")) }
        }
      )
    ).rejects.toThrow("Meta outage");

    expect(BillModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "bill-1", tenantId: "tenant-1" },
      {
        $set: {
          invoiceDeliveryStatus: "failed"
        }
      }
    );
    expect(NotificationModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
        template: "bill_invoice"
      })
    );
  });

  it("sends prescription WhatsApp messages and updates prescription delivery state", async () => {
    const prescription = {
      _id: "rx-1",
      patientId: { name: "Ramesh Kumar", phone: "9876543210" },
      doctorId: { name: "Dr. Sharma" },
      followUpDate: "2026-04-30T00:00:00.000Z"
    };
    const PrescriptionModel = {
      findOne: jest.fn().mockReturnValue(createBillQuery(prescription)),
      findOneAndUpdate: jest.fn().mockResolvedValue(undefined)
    };
    const TenantModel = {
      findById: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: "tenant-1", name: "Clinic" }) })
    };
    const NotificationModel = {
      create: jest.fn().mockResolvedValue(undefined)
    };

    await processWhatsApp(
      { type: "send-prescription", prescriptionId: "rx-1", tenantId: "tenant-1", pdfKey: "prescriptions/key.pdf" },
      null,
      {
        PrescriptionModel,
        TenantModel,
        NotificationModel,
        storageAdapter: { getPresignedUrl: jest.fn().mockResolvedValue("https://signed.example/prescription") },
        whatsappAdapter: { sendTemplateMessage: jest.fn().mockResolvedValue(undefined) },
        now: () => new Date("2026-04-24T10:00:00.000Z")
      }
    );

    expect(PrescriptionModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "rx-1", tenantId: "tenant-1" },
      {
        $set: {
          deliveryStatus: "sent",
          deliveredAt: new Date("2026-04-24T10:00:00.000Z")
        }
      }
    );
    expect(NotificationModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        template: "prescription_pdf",
        status: "sent"
      })
    );
  });
});
