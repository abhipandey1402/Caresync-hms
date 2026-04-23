import { AuditLog } from "./auditLog.model.js";
import { Bill } from "./bill.model.js";
import { Inventory } from "./inventory.model.js";
import { Otp } from "./otp.model.js";
import { Patient } from "./patient.model.js";
import { Prescription } from "./prescription.model.js";
import { Sequence } from "./sequence.model.js";
import { Tenant } from "./tenant.model.js";
import { User } from "./user.model.js";
import { Visit } from "./visit.model.js";

describe("mongoose model definitions", () => {
  it("defines the required unique and query indexes", () => {
    expect(Tenant.schema.indexes()).toEqual(
      expect.arrayContaining([[{ slug: 1 }, expect.objectContaining({ unique: true })]])
    );
    expect(User.schema.indexes()).toEqual(
      expect.arrayContaining([
        [{ tenantId: 1, phone: 1 }, expect.objectContaining({ unique: true })],
        [{ phone: 1 }, expect.objectContaining({ unique: true })],
        [{ "refreshTokens.tokenId": 1 }, expect.objectContaining({ sparse: true })]
      ])
    );
    expect(Patient.schema.indexes()).toEqual(
      expect.arrayContaining([
        [{ tenantId: 1, uhid: 1 }, expect.objectContaining({ unique: true })],
        [{ tenantId: 1, name: "text", phone: "text" }, expect.any(Object)]
      ])
    );
    expect(Visit.schema.indexes()).toEqual(
      expect.arrayContaining([[{ tenantId: 1, status: 1, visitDate: -1 }, expect.any(Object)]])
    );
    expect(Prescription.schema.indexes()).toEqual(
      expect.arrayContaining([[{ tenantId: 1, visitId: 1 }, expect.objectContaining({ unique: true })]])
    );
    expect(Bill.schema.indexes()).toEqual(
      expect.arrayContaining([[{ tenantId: 1, billNumber: 1 }, expect.objectContaining({ unique: true })]])
    );
    expect(Inventory.schema.indexes()).toEqual(
      expect.arrayContaining([[{ tenantId: 1, "batches.expiryDate": 1 }, expect.any(Object)]])
    );
    expect(AuditLog.schema.indexes()).toEqual(
      expect.arrayContaining([
        [{ tenantId: 1, resource: 1, timestamp: -1 }, expect.any(Object)],
        [{ timestamp: 1 }, expect.objectContaining({ expireAfterSeconds: 63072000 })]
      ])
    );
    expect(Sequence.schema.indexes()).toEqual(
      expect.arrayContaining([[{ tenantId: 1, type: 1 }, expect.objectContaining({ unique: true })]])
    );
    expect(Otp.schema.indexes()).toEqual(
      expect.arrayContaining([[{ createdAt: 1 }, expect.objectContaining({ expireAfterSeconds: 600 })]])
    );
  });
});
