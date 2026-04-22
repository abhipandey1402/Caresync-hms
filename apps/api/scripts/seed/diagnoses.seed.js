import { DiagnosisMaster } from "../../src/models/diagnosisMaster.model.js";
import { generateDiagnosisRecords } from "../../src/database/seedGenerators.js";
import { executeChunkedBulkWrite } from "../../src/database/seedUtils.js";
import { logger } from "../../src/config/logger.js";

export const MIN_DIAGNOSIS_COUNT = 3500;

export const seedDiagnoses = async () => {
  const records = generateDiagnosisRecords(MIN_DIAGNOSIS_COUNT);
  const operations = records.map((record) => ({
    updateOne: {
      filter: { code: record.code },
      update: {
        $set: record
      },
      upsert: true
    }
  }));

  const processed = await executeChunkedBulkWrite(DiagnosisMaster, operations, {
    chunkSize: 500
  });
  const total = await DiagnosisMaster.countDocuments();

  logger.info("Diagnosis master seed completed", {
    processed,
    total
  });

  return {
    processed,
    total
  };
};
