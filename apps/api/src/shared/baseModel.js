import mongoose from "mongoose";

export const baseSchemaFields = {
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true
  },
  createdAt: { type: Date, default: Date.now, immutable: true },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
};

export const applyTenantAndSoftDeleteScope = (query) => {
  if (query.options._skipTenantFilter) {
    return;
  }

  if (!query.getFilter().tenantId) {
    if (query.options._tenantId) {
      query.where({ tenantId: query.options._tenantId });
    } else {
      query.where({ tenantId: { $exists: false } });
    }
  }

  if (!("isDeleted" in query.getFilter())) {
    query.where({ isDeleted: false });
  }
};

export const applyUpdatedAtOnMutation = (query) => {
  query.set({ updatedAt: new Date() });
};

export const validateTenantOnSave = (document) => {
  if (document.isNew && !document.tenantId) {
    throw new Error("tenantId is required");
  }

  document.updatedAt = new Date();
};

export function applyBasePlugin(schema) {
  schema.pre(/^find/, function preFind(next) {
    applyTenantAndSoftDeleteScope(this);
    next();
  });

  schema.pre(/^findOneAndUpdate|^updateMany|^updateOne/, function preUpdate(next) {
    applyUpdatedAtOnMutation(this);
    next();
  });

  schema.pre("save", function preSave(next) {
    try {
      validateTenantOnSave(this);
      next();
    } catch (error) {
      next(error);
    }
  });
}
