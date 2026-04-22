import { MedicineMaster } from "../../src/models/medicineMaster.model.js";
import { generateMedicineMasterRecords } from "../../src/database/seedGenerators.js";
import { executeChunkedBulkWrite } from "../../src/database/seedUtils.js";
import { logger } from "../../src/config/logger.js";

export const MIN_MEDICINE_COUNT = 6000;

export const seedMedicines = async () => {
  const records = generateMedicineMasterRecords(MIN_MEDICINE_COUNT);
  const operations = records.map((record) => ({
    updateOne: {
      filter: { code: record.code },
      update: {
        $set: record
      },
      upsert: true
    }
  }));

  const processed = await executeChunkedBulkWrite(MedicineMaster, operations, {
    chunkSize: 500
  });
  const total = await MedicineMaster.countDocuments();

  logger.info("Medicine master seed completed", {
    processed,
    total
  });

  return {
    processed,
    total
  };
};
