import { jest } from "@jest/globals";
import { Sequence } from "../models/index.js";
import {
  buildBillComputation,
  calculateGST,
  generateBillNumber,
  generateGSTInvoiceNumber,
  recordPayment
} from "./billing.service.js";

describe("billing service", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("calculates CGST and SGST for intra-state bills", () => {
    const [item] = calculateGST(
      [{ description: "ECG", quantity: 1, rate: 30000, gstRate: 12 }],
      "10AABCS1429B1Z5",
      "bihar"
    );

    expect(item.baseAmount).toBe(30000);
    expect(item.gstAmount).toBe(3600);
    expect(item.cgst).toBe(1800);
    expect(item.sgst).toBe(1800);
    expect(item.igst).toBe(0);
  });

  it("calculates IGST for inter-state bills", () => {
    const [item] = calculateGST(
      [{ description: "OT", quantity: 1, rate: 50000, gstRate: 18 }],
      "10AABCS1429B1Z5",
      "27"
    );

    expect(item.cgst).toBe(0);
    expect(item.sgst).toBe(0);
    expect(item.igst).toBe(9000);
    expect(item.totalAmount).toBe(59000);
  });

  it("requires a discount reason when discount exceeds 20% of the gross total", () => {
    expect(() =>
      buildBillComputation({
        normalizedLineItems: [{ description: "Procedure", quantity: 1, rate: 10000, gstRate: 0 }],
        discount: 2500,
        discountReason: "",
        tenantGstin: "10AABCS1429B1Z5",
        patientState: "bihar"
      })
    ).toThrow("Discount reason is required");
  });

  it("creates unique bill numbers for concurrent requests in the same month", async () => {
    const sequenceSpy = jest
      .spyOn(Sequence, "findOneAndUpdate")
      .mockResolvedValueOnce({ value: 41 })
      .mockResolvedValueOnce({ value: 42 });

    const [left, right] = await Promise.all([
      generateBillNumber("tenant-1", null, new Date("2026-04-24T08:00:00.000Z")),
      generateBillNumber("tenant-1", null, new Date("2026-04-24T08:00:00.000Z"))
    ]);

    expect(left).toBe("202604-0041");
    expect(right).toBe("202604-0042");
    expect(sequenceSpy).toHaveBeenCalledTimes(2);
  });

  it("builds GST invoice numbers with Indian financial year formatting", () => {
    expect(
      generateGSTInvoiceNumber("10AABCS1429B1Z5", "202604-0042", new Date("2026-01-10T00:00:00.000Z"))
    ).toBe("10AABCS1429B1Z5/2526/202604-0042");
  });

  it("supports partial payments and queues a receipt only on full payment", async () => {
    const bill = {
      _id: "bill-1",
      status: "unpaid",
      total: 10000,
      amountPaid: 0,
      balance: 10000,
      payments: [],
      save: jest.fn().mockResolvedValue(undefined)
    };
    const BillModel = {
      findOne: jest.fn().mockResolvedValue(bill)
    };
    const queueAdapter = {
      send: jest.fn().mockResolvedValue(undefined)
    };
    const getBill = jest.fn().mockImplementation(async () => ({
      status: bill.status,
      amountPaid: bill.amountPaid,
      balance: bill.balance
    }));

    await recordPayment(
      "bill-1",
      { mode: "upi", amount: 40, reference: "UPI-1" },
      "user-1",
      "tenant-1",
      { BillModel, queueAdapter, getBill }
    );

    expect(bill.status).toBe("partial");
    expect(bill.amountPaid).toBe(4000);
    expect(bill.balance).toBe(6000);
    expect(queueAdapter.send).not.toHaveBeenCalled();

    await recordPayment(
      "bill-1",
      { mode: "cash", amount: 60 },
      "user-1",
      "tenant-1",
      { BillModel, queueAdapter, getBill }
    );

    expect(bill.status).toBe("paid");
    expect(bill.amountPaid).toBe(10000);
    expect(bill.balance).toBe(0);
    expect(queueAdapter.send).toHaveBeenCalledWith("whatsapp", {
      type: "bill-receipt",
      billId: "bill-1",
      tenantId: "tenant-1"
    });
  });

  it("blocks payments that exceed the outstanding balance", async () => {
    const BillModel = {
      findOne: jest.fn().mockResolvedValue({
        _id: "bill-1",
        status: "partial",
        total: 10000,
        amountPaid: 7000,
        balance: 3000,
        payments: [],
        save: jest.fn()
      })
    };

    await expect(
      recordPayment(
        "bill-1",
        { mode: "cash", amount: 31 },
        "user-1",
        "tenant-1",
        { BillModel, queueAdapter: { send: jest.fn() } }
      )
    ).rejects.toThrow("Payment exceeds balance of ₹30.00");
  });
});
