import { jest } from "@jest/globals";
import { DiagnosisMaster, MedicineMaster, Notification, Prescription } from "../models/index.js";
import {
  finalizePrescription,
  searchDiagnoses,
  searchMedicines,
  translateInstructionToHindi,
  __private__
} from "./prescription.service.js";

describe("prescription service", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    __private__.searchCache.clear();
  });

  it("returns cached medicine autocomplete results on repeat searches", async () => {
    const query = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([
        {
          code: "MED-00001",
          medicineName: "Amox 500mg Tablet",
          genericName: "Amox",
          form: "Tablet",
          strength: "500mg"
        }
      ])
    };
    const findSpy = jest.spyOn(MedicineMaster, "find").mockReturnValue(query);

    const first = await searchMedicines("tenant-1", "amox", 10);
    const second = await searchMedicines("tenant-1", "amox", 10);

    expect(first).toEqual(second);
    expect(findSpy).toHaveBeenCalledTimes(1);
  });

  it("supports ICD text search and returns normalized diagnosis results", async () => {
    const query = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([
        {
          code: "J06.9",
          category: "J06",
          description: "Acute upper respiratory infection",
          chapter: "Respiratory disorder"
        }
      ])
    };
    jest.spyOn(DiagnosisMaster, "find").mockReturnValue(query);

    await expect(searchDiagnoses("fever", 10)).resolves.toEqual([
      {
        icdCode: "J06.9",
        name: "Acute upper respiratory infection",
        category: "J06",
        chapter: "Respiratory disorder"
      }
    ]);
  });

  it("translates known English instructions to Hindi", () => {
    expect(translateInstructionToHindi("After food")).toBe("खाने के बाद");
    expect(translateInstructionToHindi("Unknown")).toBe(null);
  });

  it("finalizes a draft prescription, queues PDF generation, and creates a follow-up reminder", async () => {
    const prescription = {
      _id: "rx-1",
      patientId: "patient-1",
      doctorId: "doctor-1",
      status: "draft",
      followUpDate: new Date("2026-04-30T00:00:00.000Z"),
      updatedBy: null,
      save: jest.fn().mockResolvedValue(undefined)
    };
    jest.spyOn(Prescription, "findOne").mockResolvedValue(prescription);
    const queueAdapter = { send: jest.fn().mockResolvedValue(undefined) };
    const notificationSpy = jest.spyOn(Notification, "create").mockResolvedValue(undefined);

    const result = await finalizePrescription("tenant-1", "rx-1", "doctor-1", "doctor", {
      queueAdapter,
      getPrescription: jest.fn().mockResolvedValue({ _id: "rx-1", status: "finalized" })
    });

    expect(prescription.status).toBe("finalized");
    expect(queueAdapter.send).toHaveBeenCalledWith("pdf", {
      type: "prescription-pdf",
      tenantId: "tenant-1",
      prescriptionId: "rx-1"
    });
    expect(notificationSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "tenant-1",
        template: "follow_up_reminder",
        status: "queued"
      })
    );
    expect(result).toEqual({ _id: "rx-1", status: "finalized" });
  });
});
