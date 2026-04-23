import { asyncHandler, sendCreated, sendOk } from "../utils/index.js";
import { authService } from "../services/auth.service.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const buildRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: REFRESH_COOKIE_MAX_AGE,
  path: "/api/v1/auth"
});

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, buildRefreshCookieOptions());
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/v1/auth"
  });
};

const resolveTenantSlugFromHostname = (hostname = "") => {
  const normalizedHost = String(hostname).split(":")[0].toLowerCase();

  if (!normalizedHost || normalizedHost === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(normalizedHost)) {
    return undefined;
  }

  if (normalizedHost.endsWith(".localhost")) {
    const parts = normalizedHost.split(".");
    return parts.length > 1 ? parts[0] : undefined;
  }

  const parts = normalizedHost.split(".");
  return parts.length >= 3 ? parts[0] : undefined;
};

export const registerTenant = asyncHandler(async (req, res) => {
  const registration = await authService.registerTenant(req.body, {
    deviceInfo: req.get("user-agent")
  });

  setRefreshTokenCookie(res, registration.refreshToken);

  return sendCreated(res, registration, "Tenant registered successfully");
});

export const login = asyncHandler(async (req, res) => {
  const tenantSlug = req.body.tenantSlug || resolveTenantSlugFromHostname(req.hostname);
  const session = await authService.login(
    {
      ...req.body,
      tenantSlug
    },
    {
      deviceInfo: req.get("user-agent")
    }
  );

  setRefreshTokenCookie(res, session.refreshToken);

  return sendOk(
    res,
    {
      tenantId: session.tenantId,
      slug: session.slug,
      trialEndsAt: session.trialEndsAt,
      accessToken: session.accessToken
    },
    "Login successful"
  );
});

export const refresh = asyncHandler(async (req, res) => {
  const session = await authService.refreshSession(req.cookies?.refreshToken, {
    deviceInfo: req.get("user-agent")
  });

  setRefreshTokenCookie(res, session.refreshToken);

  return sendOk(
    res,
    {
      tenantId: session.tenantId,
      slug: session.slug,
      accessToken: session.accessToken
    },
    "Session refreshed successfully"
  );
});

export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.id);
  clearRefreshTokenCookie(res);

  return sendOk(res, null, "Logged out from all devices successfully");
});
