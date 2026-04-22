import mongoose from "mongoose";
import "../models/index.js";
import {
  INDEXES_TO_CREATE,
  serializeIndexShape
} from "../database/indexRegistry.js";
import { logger } from "./logger.js";

const normalizeExistingIndex = (index) => ({
  key: serializeIndexShape(index.key),
  options: {
    unique: index.unique,
    expireAfterSeconds: index.expireAfterSeconds
  }
});

const matchesExpectedOptions = (existingOptions = {}, expectedOptions = {}) =>
  Object.entries(expectedOptions).every(([key, value]) => existingOptions[key] === value);

export const verifyRegisteredIndexes = async (connection = mongoose.connection) => {
  const verification = [];

  for (const definition of INDEXES_TO_CREATE) {
    const existingIndexes = await connection.collection(definition.collection).indexes();
    const normalizedIndexes = existingIndexes.map(normalizeExistingIndex);
    const expectedShape = serializeIndexShape(definition.index);
    const exists = normalizedIndexes.some(
      (index) =>
        index.key === expectedShape &&
        matchesExpectedOptions(index.options, definition.options || {})
    );

    verification.push({
      ...definition,
      exists
    });
  }

  return verification;
};

export const initIndexes = async ({ connection = mongoose.connection, verify = true } = {}) => {
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

  await Promise.all(
    INDEXES_TO_CREATE.map(({ collection, index, options = {} }) =>
      connection.collection(collection).createIndex(index, options)
    )
  );

  if (!verify) {
    return;
  }

  const verification = await verifyRegisteredIndexes(connection);
  const missingIndexes = verification.filter(({ exists }) => !exists);

  if (missingIndexes.length > 0) {
    throw new Error(
      `Missing indexes after initialization: ${missingIndexes
        .map(({ collection, index }) => `${collection}:${serializeIndexShape(index)}`)
        .join(", ")}`
    );
  }

  logger.info("All registered indexes verified successfully", {
    totalIndexes: verification.length
  });
};
