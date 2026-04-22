import { verifyRegisteredIndexes } from "./initIndexes.js";
import { COLLECTION_NAMES } from "../database/constants.js";

describe("index initialization verification", () => {
  it("marks registered indexes as present when collection metadata matches", async () => {
    const connection = {
      collection: (name) => ({
        indexes: async () => {
          if (name === COLLECTION_NAMES.auditLogs) {
            return [
              { key: { _id: 1 }, name: "_id_" },
              {
                key: { timestamp: 1 },
                name: "timestamp_1",
                expireAfterSeconds: 63072000
              },
              {
                key: { tenantId: 1, timestamp: -1 },
                name: "tenantId_1_timestamp_-1"
              }
            ];
          }

          return [{ key: { _id: 1 }, name: "_id_" }];
        }
      })
    };

    const verification = await verifyRegisteredIndexes(connection);
    const auditTtl = verification.find(
      ({ collection, index }) =>
        collection === COLLECTION_NAMES.auditLogs && JSON.stringify(index) === JSON.stringify({ timestamp: 1 })
    );

    expect(auditTtl.exists).toBe(true);
  });
});
