import mongoose from "mongoose";
import { jest } from "@jest/globals";
import { buildDefaultServicesForTenant } from "./defaultServices.js";
import { ensureDefaultServicesForTenant } from "./serviceProvisioning.js";
import { Service } from "../models/service.model.js";

describe("service provisioning", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("builds the default service catalog for a tenant", () => {
    const tenantId = new mongoose.Types.ObjectId();
    const services = buildDefaultServicesForTenant(tenantId);

    expect(services).toHaveLength(12);
    expect(services[0]).toEqual(
      expect.objectContaining({
        tenantId,
        code: "OPD_CONSULTATION",
        sacCode: "999312",
        defaultRate: 200
      })
    );
  });

  it("upserts the full default catalog for a tenant", async () => {
    const tenantId = new mongoose.Types.ObjectId();
    const bulkWriteSpy = jest.spyOn(Service, "bulkWrite").mockResolvedValue({
      upsertedCount: 12
    });

    const inserted = await ensureDefaultServicesForTenant(tenantId);

    expect(inserted).toBe(12);
    expect(bulkWriteSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          updateOne: expect.objectContaining({
            filter: { tenantId, code: "OPD_CONSULTATION" },
            upsert: true
          })
        })
      ]),
      expect.objectContaining({ ordered: false })
    );
  });
});
