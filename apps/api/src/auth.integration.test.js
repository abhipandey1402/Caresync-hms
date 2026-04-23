import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import app from "./app.js";
import { Service, Tenant, User } from "./models/index.js";
import { queue } from "./shared/adapters/queue.adapter.js";

const buildQuery = (resolver) => {
  const state = {
    includePasswordHash: false
  };

  const query = {
    setOptions: jest.fn().mockReturnThis(),
    select: jest.fn().mockImplementation((selection) => {
      state.includePasswordHash = selection === "+passwordHash";
      return query;
    }),
    session: jest.fn().mockReturnThis(),
    exec: jest.fn().mockImplementation(() => resolver(state))
  };

  return query;
};

const buildSession = () => ({
  withTransaction: jest.fn().mockImplementation(async (callback) => callback()),
  endSession: jest.fn().mockResolvedValue(undefined)
});

describe("auth integration", () => {
  beforeEach(() => {
    process.env.JWT_PRIVATE_KEY = "test-private-key";
    process.env.JWT_PUBLIC_KEY = "test-public-key";
    process.env.JWT_ACCESS_EXPIRES = "15m";
    process.env.JWT_REFRESH_EXPIRES = "7d";
    process.env.AUTH_RATE_LIMIT_WINDOW_MS = "60000";
    process.env.AUTH_RATE_LIMIT_MAX = "10";

    jest.spyOn(jwt, "sign").mockImplementation((payload, _key, options) => {
      return `access:${payload.sub}:${payload.tid}:${payload.role}:${options.expiresIn}`;
    });
    jest.spyOn(jwt, "verify").mockImplementation((token) => {
      const [, sub, tid, role] = String(token).split(":");
      return { sub, tid, role };
    });
    jest.spyOn(crypto, "randomBytes").mockImplementation((size) => Buffer.alloc(size, 1));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("registers then logs in with tenant slug, sets a strict httpOnly cookie, and rotates on refresh", async () => {
    const session = buildSession();
    const state = {
      tenants: [],
      users: []
    };
    const originalNodeEnv = process.env.NODE_ENV;

    jest.spyOn(mongoose, "startSession").mockResolvedValue(session);
    jest.spyOn(Tenant, "findOne").mockImplementation((filter) =>
      buildQuery(async () => {
        if (filter.slug) {
          return state.tenants.find((tenant) => tenant.slug === filter.slug) || null;
        }

        return null;
      })
    );
    jest.spyOn(Tenant, "create").mockImplementation(async ([payload]) => {
      const tenant = {
        _id: new mongoose.Types.ObjectId(),
        ...payload
      };
      state.tenants.push(tenant);
      return [tenant];
    });
    jest.spyOn(Tenant, "findById").mockImplementation(async (tenantId) => {
      return state.tenants.find((tenant) => String(tenant._id) === String(tenantId)) || null;
    });
    jest.spyOn(User, "findOne").mockImplementation((filter) =>
      buildQuery(async ({ includePasswordHash }) => {
        if (filter.phone && filter.tenantId) {
          const user = state.users.find(
            (entry) =>
              entry.phone === filter.phone && String(entry.tenantId) === String(filter.tenantId)
          );
          if (!user) {
            return null;
          }

          return includePasswordHash ? user : user;
        }

        if (filter.phone) {
          return state.users.find((entry) => entry.phone === filter.phone) || null;
        }

        if (filter["refreshTokens.tokenId"]) {
          return (
            state.users.find((entry) =>
              entry.refreshTokens.some((token) => token.tokenId === filter["refreshTokens.tokenId"])
            ) || null
          );
        }

        return null;
      })
    );
    jest.spyOn(User, "findById").mockImplementation(() =>
      buildQuery(async () => state.users[0] || null)
    );
    jest.spyOn(User, "create").mockImplementation(async ([payload]) => {
      const user = {
        _id: new mongoose.Types.ObjectId(),
        ...payload,
        save: jest.fn().mockImplementation(async function save() {
          const index = state.users.findIndex((entry) => String(entry._id) === String(this._id));
          state.users[index] = this;
          return this;
        })
      };
      state.users.push(user);
      return [user];
    });
    jest.spyOn(Service, "bulkWrite").mockResolvedValue({
      upsertedCount: 10
    });
    jest.spyOn(queue, "send").mockResolvedValue({ MessageId: "msg-1" });

    const registerResponse = await request(app).post("/api/v1/tenants/register").send({
      clinicName: "Sharma Nursing Home",
      city: "Patna",
      phone: "9876543210",
      email: "dr.sharma@gmail.com",
      password: "SecurePass123",
      gstin: "10AABCS1429B1Z5",
      ownerName: "Dr. Rajesh Sharma"
    });

    expect(registerResponse.statusCode).toBe(201);
    expect(registerResponse.body.data.slug).toBe("sharma-nursing-home-patna");
    expect(registerResponse.body.data.refreshToken).toMatch(/^[^.]+\.[a-f0-9]+$/);
    expect(registerResponse.headers["set-cookie"][0]).toContain("HttpOnly");

    process.env.NODE_ENV = "production";

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      tenantSlug: "sharma-nursing-home-patna",
      phone: "9876543210",
      password: "SecurePass123"
    });

    process.env.NODE_ENV = originalNodeEnv;

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.data.tenantId).toBe(registerResponse.body.data.tenantId);
    expect(loginResponse.body.data.accessToken).toMatch(/^access:/);
    expect(loginResponse.body.data.refreshToken).toBeUndefined();
    expect(loginResponse.headers["set-cookie"][0]).toContain("HttpOnly");
    expect(loginResponse.headers["set-cookie"][0]).toContain("SameSite=Strict");
    expect(loginResponse.headers["set-cookie"][0]).toContain("Path=/api/v1/auth");
    expect(loginResponse.headers["set-cookie"][0]).toContain("Secure");

    const firstRefreshCookie = loginResponse.headers["set-cookie"][0].split(";")[0];

    const refreshResponse = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", firstRefreshCookie)
      .send({});

    expect(refreshResponse.statusCode).toBe(200);
    expect(refreshResponse.body.data.accessToken).toMatch(/^access:/);
    expect(refreshResponse.body.data.refreshToken).toBeUndefined();
    expect(refreshResponse.headers["set-cookie"][0].split(";")[0]).not.toBe(firstRefreshCookie);

    const staleRefreshResponse = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", firstRefreshCookie)
      .send({});

    expect(staleRefreshResponse.statusCode).toBe(401);
    expect(staleRefreshResponse.body.message).toBe("Invalid refresh token");
  });

  it("clears all refresh tokens on logout all", async () => {
    const tenantId = new mongoose.Types.ObjectId();
    const tenant = {
      _id: tenantId,
      slug: "sharma-nursing-home-patna"
    };
    const passwordHash = await bcrypt.hash("SecurePass123", 12);
    const user = {
      _id: new mongoose.Types.ObjectId(),
      tenantId,
      role: "admin",
      phone: "9876543210",
      passwordHash,
      isActive: true,
      loginAttempts: 0,
      lockUntil: null,
      refreshTokens: [
        {
          tokenId: "existing-token",
          tokenHash: "$2b$12$abcdefghijklmnopqrstuvabcdefghijklmnopqrstuvabcdefghijk",
          deviceInfo: "Chrome",
          createdAt: new Date("2026-04-20T00:00:00.000Z"),
          expiresAt: new Date("2026-04-29T00:00:00.000Z")
        }
      ],
      save: jest.fn().mockImplementation(async function save() {
        return this;
      })
    };

    jest.spyOn(User, "findById").mockImplementation(() => buildQuery(async () => user));

    const response = await request(app)
      .post("/api/v1/auth/logout/all")
      .set("Authorization", `Bearer access:${user._id}:${tenant._id}:admin:15m`)
      .send({});

    expect(response.statusCode).toBe(200);
    expect(user.refreshTokens).toEqual([]);
    expect(response.headers["set-cookie"][0]).toContain("refreshToken=;");
  });
});
