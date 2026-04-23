import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import { authService } from "./auth.service.js";
import { Service, Tenant, User } from "../models/index.js";
import { queue } from "../shared/adapters/queue.adapter.js";

const buildQuery = (resolver) => {
  const state = {
    includePasswordHash: false
  };

  const query = {
    setOptions: jest.fn().mockReturnThis(),
    select: jest.fn().mockImplementation(function select(selection) {
      state.includePasswordHash = selection === "+passwordHash";
      return this;
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

const buildSavedUser = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  tenantId: new mongoose.Types.ObjectId(),
  role: "admin",
  phone: "9876543210",
  passwordHash: "$2a$12$hashed-password-value",
  isActive: true,
  loginAttempts: 0,
  lockUntil: null,
  refreshTokens: [],
  lastLoginAt: null,
  save: jest.fn().mockImplementation(async function save() {
    return this;
  }),
  ...overrides
});

describe("auth service", () => {
  beforeEach(() => {
    process.env.JWT_PRIVATE_KEY = "test-private-key";
    process.env.JWT_PUBLIC_KEY = "test-public-key";
    process.env.JWT_ACCESS_EXPIRES = "15m";
    process.env.JWT_REFRESH_EXPIRES = "7d";

    jest.spyOn(jwt, "sign").mockImplementation((payload, _key, options) => {
      return `access:${payload.sub}:${payload.tid}:${payload.role}:${options.expiresIn}`;
    });
    jest.spyOn(crypto, "randomBytes").mockImplementation((size) => Buffer.alloc(size, 1));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("registers a tenant atomically and stores only a hashed refresh token", async () => {
    const session = buildSession();
    const tenantId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    jest.spyOn(mongoose, "startSession").mockResolvedValue(session);
    jest.spyOn(User, "findOne").mockImplementation(() => buildQuery(async () => null));
    jest.spyOn(Tenant, "findOne").mockImplementation(() => buildQuery(async () => null));
    jest.spyOn(Tenant, "create").mockResolvedValue([
      {
        _id: tenantId,
        name: "Sharma Nursing Home",
        slug: "sharma-nursing-home-patna",
        trialEndsAt: new Date("2026-07-21T00:00:00.000Z")
      }
    ]);
    jest.spyOn(User, "create").mockResolvedValue([
      {
        _id: userId,
        tenantId,
        name: "Dr. Rajesh Sharma",
        phone: "9876543210",
        role: "admin"
      }
    ]);
    const bulkWriteSpy = jest.spyOn(Service, "bulkWrite").mockResolvedValue({
      upsertedCount: 10
    });
    const queueSpy = jest.spyOn(queue, "send").mockResolvedValue({ MessageId: "msg-1" });

    const result = await authService.registerTenant(
      {
        clinicName: "Sharma Nursing Home",
        city: "Patna",
        phone: "9876543210",
        email: "dr.sharma@gmail.com",
        password: "SecurePass123",
        gstin: "10AABCS1429B1Z5",
        ownerName: "Dr. Rajesh Sharma"
      },
      {
        deviceInfo: "Mozilla/5.0"
      }
    );

    expect(session.withTransaction).toHaveBeenCalledTimes(1);
    expect(User.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          tenantId,
          role: "admin",
          loginAttempts: 0,
          isActive: true,
          refreshTokens: [
            expect.objectContaining({
              tokenId: expect.any(String),
              tokenHash: expect.stringMatching(/^\$2/),
              deviceInfo: "Mozilla/5.0"
            })
          ]
        })
      ],
      { session }
    );
    expect(User.create.mock.calls[0][0][0].refreshTokens[0].tokenHash).not.toContain(result.refreshToken);
    expect(bulkWriteSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          updateOne: expect.objectContaining({
            filter: { tenantId, code: "OPD_CONSULTATION" },
            upsert: true
          })
        })
      ]),
      expect.objectContaining({ ordered: false, session })
    );
    expect(queueSpy).toHaveBeenCalledWith(
      "whatsapp",
      expect.objectContaining({
        type: "tenant.welcome",
        tenantId: String(tenantId)
      })
    );
    expect(result).toEqual({
      tenantId,
      slug: "sharma-nursing-home-patna",
      trialEndsAt: new Date("2026-07-21T00:00:00.000Z"),
      accessToken: `access:${userId}:${tenantId}:admin:15m`,
      refreshToken: expect.stringMatching(/^[^.]+\.[a-f0-9]+$/)
    });
  });

  it("locks the account for exactly 30 minutes after the fifth failed login", async () => {
    const now = new Date("2026-04-22T10:00:00.000Z");
    const tenantId = new mongoose.Types.ObjectId();
    const user = buildSavedUser({
      tenantId,
      loginAttempts: 4,
      passwordHash: "stored-hash"
    });

    jest.spyOn(bcrypt, "compare").mockResolvedValue(false);
    jest.spyOn(Tenant, "findOne").mockImplementation(() => buildQuery(async () => ({ _id: tenantId })));
    jest.spyOn(User, "findOne").mockImplementation(() => buildQuery(async () => user));

    await expect(
      authService.login(
        {
          tenantSlug: "sharma-nursing-home-patna",
          phone: "9876543210",
          password: "WrongPass123"
        },
        { now, deviceInfo: "Mozilla/5.0" }
      )
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Account locked until 16:00"
    });

    expect(user.loginAttempts).toBe(5);
    expect(user.lockUntil.toISOString()).toBe("2026-04-22T10:30:00.000Z");
    expect(user.save).toHaveBeenCalled();
  });

  it("issues a new login session and evicts the oldest refresh token beyond the max of five", async () => {
    const now = new Date("2026-04-22T10:00:00.000Z");
    const tenantId = new mongoose.Types.ObjectId();
    const tenant = {
      _id: tenantId,
      slug: "sharma-nursing-home-patna",
      trialEndsAt: new Date("2026-07-21T00:00:00.000Z")
    };
    const user = buildSavedUser({
      tenantId,
      passwordHash: "stored-hash",
      loginAttempts: 2,
      refreshTokens: [
        { tokenId: "old-1", tokenHash: "hash-1", deviceInfo: "a", createdAt: new Date("2026-04-01T00:00:00.000Z"), expiresAt: new Date("2026-05-01T00:00:00.000Z") },
        { tokenId: "old-2", tokenHash: "hash-2", deviceInfo: "b", createdAt: new Date("2026-04-02T00:00:00.000Z"), expiresAt: new Date("2026-05-02T00:00:00.000Z") },
        { tokenId: "old-3", tokenHash: "hash-3", deviceInfo: "c", createdAt: new Date("2026-04-03T00:00:00.000Z"), expiresAt: new Date("2026-05-03T00:00:00.000Z") },
        { tokenId: "old-4", tokenHash: "hash-4", deviceInfo: "d", createdAt: new Date("2026-04-04T00:00:00.000Z"), expiresAt: new Date("2026-05-04T00:00:00.000Z") },
        { tokenId: "old-5", tokenHash: "hash-5", deviceInfo: "e", createdAt: new Date("2026-04-05T00:00:00.000Z"), expiresAt: new Date("2026-05-05T00:00:00.000Z") }
      ]
    });

    jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
    jest.spyOn(Tenant, "findOne").mockImplementation(() => buildQuery(async () => tenant));
    jest.spyOn(User, "findOne").mockImplementation(() => buildQuery(async () => user));

    const result = await authService.login(
      {
        tenantSlug: tenant.slug,
        phone: "9876543210",
        password: "SecurePass123"
      },
      {
        now,
        deviceInfo: "Mozilla/5.0"
      }
    );

    expect(result).toEqual({
      tenantId,
      slug: tenant.slug,
      trialEndsAt: tenant.trialEndsAt,
      accessToken: `access:${user._id}:${tenantId}:admin:15m`,
      refreshToken: expect.stringMatching(/^[^.]+\.[a-f0-9]+$/)
    });
    expect(user.loginAttempts).toBe(0);
    expect(user.lockUntil).toBeNull();
    expect(user.lastLoginAt).toBe(now);
    expect(user.refreshTokens).toHaveLength(5);
    expect(user.refreshTokens.map((token) => token.tokenId)).not.toContain("old-1");
    expect(user.refreshTokens.at(-1).tokenHash).toMatch(/^\$2/);
    expect(user.save).toHaveBeenCalled();
  });

  it("rotates refresh tokens and invalidates the old one", async () => {
    const now = new Date("2026-04-22T10:00:00.000Z");
    const tenantId = new mongoose.Types.ObjectId();
    const user = buildSavedUser({
      tenantId,
      refreshTokens: [
        {
          tokenId: "507f191e810c19729de860ea",
          tokenHash: await bcrypt.hash("old-secret", 12),
          deviceInfo: "Mozilla/5.0",
          createdAt: new Date("2026-04-20T00:00:00.000Z"),
          expiresAt: new Date("2026-04-29T00:00:00.000Z")
        }
      ]
    });
    const tenant = {
      _id: tenantId,
      slug: "sharma-nursing-home-patna"
    };

    jest.spyOn(User, "findOne").mockImplementation(({ "refreshTokens.tokenId": tokenId }) =>
      buildQuery(async () =>
        user.refreshTokens.some((token) => token.tokenId === tokenId) ? user : null
      )
    );
    jest.spyOn(Tenant, "findById").mockResolvedValue(tenant);

    const result = await authService.refreshSession("507f191e810c19729de860ea.old-secret", {
      now,
      deviceInfo: "Mozilla/5.0 (refreshed)"
    });

    expect(result).toEqual({
      tenantId,
      slug: tenant.slug,
      accessToken: `access:${user._id}:${tenantId}:admin:15m`,
      refreshToken: expect.stringMatching(/^[^.]+\.[a-f0-9]+$/)
    });
    expect(user.refreshTokens).toHaveLength(1);
    expect(user.refreshTokens[0].tokenId).not.toBe("507f191e810c19729de860ea");
    expect(user.save).toHaveBeenCalled();
  });

  it("clears every stored refresh token on logout all", async () => {
    const user = buildSavedUser({
      refreshTokens: [
        {
          tokenId: "one",
          tokenHash: "hash-one",
          deviceInfo: "Chrome",
          createdAt: new Date("2026-04-20T00:00:00.000Z"),
          expiresAt: new Date("2026-04-29T00:00:00.000Z")
        }
      ]
    });

    jest.spyOn(User, "findById").mockImplementation(() => buildQuery(async () => user));

    await authService.logoutAll(user._id);

    expect(user.refreshTokens).toEqual([]);
    expect(user.save).toHaveBeenCalled();
  });
});
