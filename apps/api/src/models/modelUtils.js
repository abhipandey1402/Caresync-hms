import mongoose from "mongoose";
import { applyBasePlugin, baseSchemaFields } from "../shared/baseModel.js";

export const createTenantScopedSchema = (fields, options = {}) => {
  const schema = new mongoose.Schema(
    {
      ...baseSchemaFields,
      ...fields
    },
    {
      collection: options.collection,
      minimize: false,
      versionKey: false
    }
  );

  applyBasePlugin(schema);

  return schema;
};

export const registerModel = (name, schema) =>
  mongoose.models[name] || mongoose.model(name, schema);
