import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ensureDefaultServicesForTenant } from "../database/serviceProvisioning.js";
import { logger } from "../config/logger.js";
import { Tenant, User } from "../models/index.js";
import { queue } from "../shared/adapters/queue.adapter.js";
import { ApiError } from "../utils/apiError.js";

const PASSWORD_HASH_ROUNDS = 12;
const REFRESH_TOKEN_HASH_ROUNDS = 12;
const TRIAL_PERIOD_DAYS = 90;
const REFRESH_TOKEN_DAYS = 7;
const MAX_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCK_MS = 30 * 60 * 1000;
const MAX_REFRESH_TOKENS = 5;
const REFRESH_TOKEN_BYTES = 32;
const WELCOME_WHATSAPP_JOB_TYPE = "tenant.welcome";

const normalizeOptionalString = (value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const normalizeJwtKey = (value = "") => value.replace(/\\n/g, "\n");

const addDays = (date, days) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

const addMilliseconds = (date, milliseconds) => new Date(date.getTime() + milliseconds);

const slugify = (value) =>
  value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildBaseTenantSlug = ({ clinicName, city }) => slugify(`${clinicName} ${city}`);

const createAccessTokenPayload = (user) => ({
  sub: String(user._id),
  tid: String(user.tenantId),
  role: user.role
});

const generateAccessToken = (user) =>
  jwt.sign(createAccessTokenPayload(user), normalizeJwtKey(process.env.JWT_PRIVATE_KEY), {
    algorithm: "RS256",
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m"
  });

const truncateDeviceInfo = (value) => String(value || "unknown").slice(0, 200);

const buildRefreshTokenSecret = () => crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex");

const buildRefreshTokenValue = () => {
  const tokenId = new mongoose.Types.ObjectId().toString();
  const secret = buildRefreshTokenSecret();

  return {
    tokenId,
    secret,
    rawToken: `${tokenId}.${secret}`
  };
};

const parseRefreshToken = (rawToken) => {
  if (typeof rawToken !== "string") {
    return null;
  }

  const trimmed = rawToken.trim();
  const separatorIndex = trimmed.indexOf(".");

  if (separatorIndex <= 0 || separatorIndex === trimmed.length - 1) {
    return null;
  }

  return {
    tokenId: trimmed.slice(0, separatorIndex),
    secret: trimmed.slice(separatorIndex + 1)
  };
};

const buildRefreshTokenRecord = async ({ secret, tokenId, deviceInfo, now }) => ({
  tokenId,
  tokenHash: await bcrypt.hash(secret, REFRESH_TOKEN_HASH_ROUNDS),
  deviceInfo: truncateDeviceInfo(deviceInfo),
  createdAt: now,
  expiresAt: addDays(now, REFRESH_TOKEN_DAYS)
});

const normalizeRefreshTokens = (tokens = [], now = new Date()) =>
  [...tokens]
    .filter((token) => token?.tokenId && token?.tokenHash && token.expiresAt && token.expiresAt > now)
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());

const trimRefreshTokens = (tokens = []) => tokens.slice(-MAX_REFRESH_TOKENS);

const buildLockedAccountMessage = (lockUntil) => {
  const until = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata"
  }).format(lockUntil);

  return `Account locked until ${until}`;
};

const issueSessionTokens = async (user, { deviceInfo, now = new Date(), session } = {}) => {
  const { tokenId, secret, rawToken } = buildRefreshTokenValue();
  const refreshTokenRecord = await buildRefreshTokenRecord({
    tokenId,
    secret,
    deviceInfo,
    now
  });

  user.refreshTokens = trimRefreshTokens([
    ...normalizeRefreshTokens(user.refreshTokens, now),
    refreshTokenRecord
  ]);

  await user.save({ session, validateBeforeSave: false });

  return {
    accessToken: generateAccessToken(user),
    refreshToken: rawToken
  };
};

const revokeRefreshToken = (user, tokenId) => {
  user.refreshTokens = (user.refreshTokens || []).filter((token) => token.tokenId !== tokenId);
};

const findExistingUserByPhone = async (phone) =>
  User.findOne({ phone }).setOptions({ _skipTenantFilter: true }).exec();

const resolveAvailableSlug = async (baseSlug, session) => {
  let attempt = 1;
  let candidate = baseSlug;

  while (true) {
    const existingTenant = await Tenant.findOne({ slug: candidate }).session(session).exec();

    if (!existingTenant) {
      return candidate;
    }

    attempt += 1;
    candidate = `${baseSlug}-${attempt}`;
  }
};

const buildWelcomeMessagePayload = ({ tenant, user }) => ({
  type: WELCOME_WHATSAPP_JOB_TYPE,
  tenantId: String(tenant._id),
  phone: user.phone,
  template: "tenant_welcome",
  variables: {
    clinicName: tenant.name,
    ownerName: user.name,
    tenantSlug: tenant.slug
  }
});

const resolveTenantBySlug = async (tenantSlug) => {
  const normalizedSlug = normalizeOptionalString(tenantSlug);

  if (!normalizedSlug) {
    throw new ApiError(400, "Tenant slug is required", [{ code: "TENANT_SLUG_REQUIRED" }]);
  }

  const tenant = await Tenant.findOne({ slug: normalizedSlug }).exec();

  if (!tenant) {
    throw new ApiError(401, "Invalid phone or password", [{ code: "INVALID_CREDENTIALS" }]);
  }

  return tenant;
};

const registerTenant = async (payload, options = {}) => {
  const existingUser = await findExistingUserByPhone(payload.phone);

  if (existingUser) {
    throw new ApiError(409, "Phone already registered", [{ code: "PHONE_ALREADY_REGISTERED" }]);
  }

  const session = await mongoose.startSession();
  let tenant;
  let adminUser;
  let tokens;

  try {
    await session.withTransaction(async () => {
      const now = options.now || new Date();
      const trialEndsAt = addDays(now, TRIAL_PERIOD_DAYS);
      const slug = await resolveAvailableSlug(buildBaseTenantSlug(payload), session);
      const passwordHash = await bcrypt.hash(payload.password, PASSWORD_HASH_ROUNDS);
      const refreshTokenValue = buildRefreshTokenValue();
      const refreshTokenRecord = await buildRefreshTokenRecord({
        tokenId: refreshTokenValue.tokenId,
        secret: refreshTokenValue.secret,
        deviceInfo: options.deviceInfo,
        now
      });

      [tenant] = await Tenant.create(
        [
          {
            name: payload.clinicName,
            legalName: payload.clinicName,
            ownerName: payload.ownerName,
            slug,
            gstin: normalizeOptionalString(payload.gstin),
            plan: "trial",
            planExpiresAt: trialEndsAt,
            trialEndsAt,
            status: "active",
            timezone: "Asia/Kolkata",
            contact: {
              phone: payload.phone,
              email: normalizeOptionalString(payload.email)
            },
            address: {
              city: payload.city
            }
          }
        ],
        { session }
      );

      [adminUser] = await User.create(
        [
          {
            tenantId: tenant._id,
            name: payload.ownerName,
            phone: payload.phone,
            email: normalizeOptionalString(payload.email),
            role: "admin",
            passwordHash,
            loginAttempts: 0,
            lockUntil: null,
            isActive: true,
            refreshTokens: [refreshTokenRecord]
          }
        ],
        { session }
      );

      await ensureDefaultServicesForTenant(tenant._id, { session, now });
      tokens = {
        accessToken: generateAccessToken(adminUser),
        refreshToken: refreshTokenValue.rawToken
      };
    });
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.phone) {
      throw new ApiError(409, "Phone already registered", [{ code: "PHONE_ALREADY_REGISTERED" }]);
    }

    if (error?.code === 11000 && error?.keyPattern?.slug) {
      throw new ApiError(409, "Tenant slug already exists", [{ code: "TENANT_SLUG_CONFLICT" }]);
    }

    throw error;
  } finally {
    await session.endSession();
  }

  try {
    await queue.send("whatsapp", buildWelcomeMessagePayload({ tenant, user: adminUser }));
  } catch (error) {
    logger.warn("Tenant registered but welcome WhatsApp queueing failed", {
      tenantId: String(tenant._id),
      userId: String(adminUser._id),
      errorMessage: error?.message
    });
  }

  return {
    tenantId: tenant._id,
    slug: tenant.slug,
    trialEndsAt: tenant.trialEndsAt,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      _id: adminUser._id,
      name: adminUser.name,
      role: adminUser.role,
      phone: adminUser.phone
    }
  };
};

const login = async ({ phone, password, tenantSlug }, options = {}) => {
  const now = options.now || new Date();
  const tenant = await resolveTenantBySlug(tenantSlug);
  const user = await User.findOne({ tenantId: tenant._id, phone })
    .setOptions({ _skipTenantFilter: true })
    .select("+passwordHash")
    .exec();

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid phone or password", [{ code: "INVALID_CREDENTIALS" }]);
  }

  if (user.lockUntil && user.lockUntil > now) {
    throw new ApiError(401, buildLockedAccountMessage(user.lockUntil), [{ code: "ACCOUNT_LOCKED" }]);
  }

  if (user.lockUntil && user.lockUntil <= now) {
    user.lockUntil = null;
    user.loginAttempts = 0;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;

    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = addMilliseconds(now, ACCOUNT_LOCK_MS);
    }

    await user.save({ validateBeforeSave: false });

    if (user.lockUntil && user.lockUntil > now) {
      throw new ApiError(401, buildLockedAccountMessage(user.lockUntil), [{ code: "ACCOUNT_LOCKED" }]);
    }

    throw new ApiError(401, "Invalid phone or password", [{ code: "INVALID_CREDENTIALS" }]);
  }

  user.loginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = now;
  user.refreshTokens = normalizeRefreshTokens(user.refreshTokens, now);

  const tokens = await issueSessionTokens(user, {
    deviceInfo: options.deviceInfo,
    now
  });

  return {
    tenantId: tenant._id,
    slug: tenant.slug,
    trialEndsAt: tenant.trialEndsAt,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      role: user.role,
      phone: user.phone,
      speciality: user.speciality
    }
  };
};

const refreshSession = async (rawRefreshToken, options = {}) => {
  const parsedToken = parseRefreshToken(rawRefreshToken);

  if (!parsedToken) {
    throw new ApiError(401, "Invalid refresh token", [{ code: "INVALID_REFRESH_TOKEN" }]);
  }

  const now = options.now || new Date();
  const user = await User.findOne({ "refreshTokens.tokenId": parsedToken.tokenId })
    .setOptions({ _skipTenantFilter: true })
    .exec();

  if (!user) {
    throw new ApiError(401, "Invalid refresh token", [{ code: "INVALID_REFRESH_TOKEN" }]);
  }

  const tokenRecord = (user.refreshTokens || []).find((token) => token.tokenId === parsedToken.tokenId);

  if (!tokenRecord || tokenRecord.expiresAt <= now) {
    revokeRefreshToken(user, parsedToken.tokenId);
    await user.save({ validateBeforeSave: false });
    throw new ApiError(401, "Invalid refresh token", [{ code: "INVALID_REFRESH_TOKEN" }]);
  }

  const matches = await bcrypt.compare(parsedToken.secret, tokenRecord.tokenHash);

  if (!matches) {
    revokeRefreshToken(user, parsedToken.tokenId);
    await user.save({ validateBeforeSave: false });
    throw new ApiError(401, "Invalid refresh token", [{ code: "INVALID_REFRESH_TOKEN" }]);
  }

  const tenant = await Tenant.findById(user.tenantId);

  if (!tenant) {
    throw new ApiError(404, "Tenant not found", [{ code: "TENANT_NOT_FOUND" }]);
  }

  revokeRefreshToken(user, parsedToken.tokenId);
  user.refreshTokens = normalizeRefreshTokens(user.refreshTokens, now);

  const tokens = await issueSessionTokens(user, {
    deviceInfo: options.deviceInfo,
    now
  });

  return {
    tenantId: tenant._id,
    slug: tenant.slug,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      role: user.role,
      phone: user.phone,
      speciality: user.speciality
    }
  };
};

const logoutAll = async (userId) => {
  const user = await User.findById(userId).setOptions({ _skipTenantFilter: true }).exec();

  if (!user) {
    throw new ApiError(401, "Unauthorized", [{ code: "UNAUTHORIZED" }]);
  }

  user.refreshTokens = [];
  await user.save({ validateBeforeSave: false });
};

export const authService = {
  registerTenant,
  login,
  refreshSession,
  logoutAll
};
