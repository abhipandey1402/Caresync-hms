import { INDEXES_TO_CREATE } from "./indexRegistry.js";
import { COLLECTION_NAMES } from "./constants.js";

describe("index registry", () => {
  it("tracks all required collection indexes", () => {
    expect(INDEXES_TO_CREATE.length).toBeGreaterThanOrEqual(25);

    expect(INDEXES_TO_CREATE).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          collection: COLLECTION_NAMES.patients,
          index: { tenantId: 1, uhid: 1 },
          options: { unique: true }
        }),
        expect.objectContaining({
          collection: COLLECTION_NAMES.auditLogs,
          index: { timestamp: 1 },
          options: { expireAfterSeconds: 63072000 }
        }),
        expect.objectContaining({
          collection: COLLECTION_NAMES.otps,
          index: { createdAt: 1 },
          options: { expireAfterSeconds: 600 }
        })
      ])
    );
  });
});
