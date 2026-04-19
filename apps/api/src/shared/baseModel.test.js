import mongoose from "mongoose";
import { jest } from "@jest/globals";
import {
  applyBasePlugin,
  applyTenantAndSoftDeleteScope,
  applyUpdatedAtOnMutation,
  validateTenantOnSave
} from "./baseModel.js";

const getPreHook = (schema, hookName) => schema.s.hooks._pres.get(hookName)[0].fn;

describe("base model plugin", () => {
  it("injects tenant scope and soft delete filter for scoped finds", () => {
    const schema = new mongoose.Schema({});
    applyBasePlugin(schema);

    const query = {
      options: { _tenantId: "tenant-123" },
      _conditions: {},
      getFilter() {
        return this._conditions;
      },
      where(condition) {
        Object.assign(this._conditions, condition);
        return this;
      }
    };

    const preFind = getPreHook(schema, "find");
    preFind.call(query, jest.fn());

    expect(query.getFilter()).toEqual({
      tenantId: "tenant-123",
      isDeleted: false
    });
  });

  it("returns an empty scope when tenantId is missing", () => {
    const query = {
      options: {},
      _conditions: {},
      getFilter() {
        return this._conditions;
      },
      where(condition) {
        Object.assign(this._conditions, condition);
        return this;
      }
    };

    applyTenantAndSoftDeleteScope(query);

    expect(query.getFilter()).toEqual({
      tenantId: { $exists: false },
      isDeleted: false
    });
  });

  it("injects isDeleted false into all find queries by default", () => {
    const query = {
      options: { _tenantId: "tenant-123" },
      _conditions: {},
      getFilter() {
        return this._conditions;
      },
      where(condition) {
        Object.assign(this._conditions, condition);
        return this;
      }
    };

    applyTenantAndSoftDeleteScope(query);

    expect(query.getFilter().isDeleted).toBe(false);
  });

  it("sets updatedAt on update queries", () => {
    const query = {
      update: {},
      set(values) {
        Object.assign(this.update, values);
      }
    };

    applyUpdatedAtOnMutation(query);

    expect(query.update.updatedAt).toBeInstanceOf(Date);
  });

  it("requires tenantId on save", () => {
    expect(() => validateTenantOnSave({ isNew: true })).toThrow(/tenantId is required/);
  });
});
