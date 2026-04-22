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

/** Returns true when the index definition contains at least one "text" field value */
const isTextIndex = (indexDef) => Object.values(indexDef).some((v) => v === "text");

/**
 * MongoDB stores text indexes with internal _fts/_ftsx keys and a `weights` map
 * instead of the original field names, so we cannot do a plain key comparison.
 * Instead we check that an existing text index on the collection covers exactly
 * the same set of text fields (via its weights map) and the same non-text prefix
 * fields (via its key).
 */
const textIndexMatches = (existingIndexes, definition) => {
  const expectedTextFields = new Set(
    Object.entries(definition.index)
      .filter(([, v]) => v === "text")
      .map(([k]) => k)
  );

  const expectedPrefixFields = Object.entries(definition.index)
    .filter(([, v]) => v !== "text")
    .map(([k, v]) => [k, v]);

  return existingIndexes.some((existing) => {
    // Must be a text index (has _fts key internally)
    if (!existing.key || existing.key._fts !== "text") return false;

    // Weights contains every field that was indexed as text
    const weightedFields = new Set(Object.keys(existing.weights || {}));
    if (weightedFields.size !== expectedTextFields.size) return false;
    for (const field of expectedTextFields) {
      if (!weightedFields.has(field)) return false;
    }

    // Verify non-text prefix fields match
    for (const [field, order] of expectedPrefixFields) {
      if (existing.key[field] !== order) return false;
    }

    return true;
  });
};

export const verifyRegisteredIndexes = async (connection = mongoose.connection) => {
  const verification = [];

  for (const definition of INDEXES_TO_CREATE) {
    const existingIndexes = await connection.collection(definition.collection).indexes();

    let exists;
    if (isTextIndex(definition.index)) {
      // Text indexes are stored differently in MongoDB — use field-set comparison
      exists = textIndexMatches(existingIndexes, definition);
    } else {
      const normalizedIndexes = existingIndexes.map(normalizeExistingIndex);
      const expectedShape = serializeIndexShape(definition.index);
      exists = normalizedIndexes.some(
        (index) =>
          index.key === expectedShape &&
          matchesExpectedOptions(index.options, definition.options || {})
      );
    }

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
