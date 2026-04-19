import mongoose from "mongoose";
import { logger } from "./logger.js";

export const initIndexes = async () => {
  const modelNames = mongoose.modelNames();

  if (modelNames.length === 0) {
    logger.info("No mongoose models registered - skipping index initialization");
    return;
  }

  await Promise.all(
    modelNames.map(async (modelName) => {
      const model = mongoose.model(modelName);
      await model.syncIndexes();
      logger.info(`Indexes initialized for model ${modelName}`);
    })
  );
};
