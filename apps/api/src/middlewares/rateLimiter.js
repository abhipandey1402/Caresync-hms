import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/apiError.js";

const buildLimiter = (code, message, limit) =>
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new ApiError(429, message, [{ code }]));
    }
  });

export const rateLimiter = buildLimiter(
  "RATE_LIMITED",
  "Too many requests, please try again later",
  Number(process.env.RATE_LIMIT_MAX || 100)
);

export const authRateLimiter = buildLimiter(
  "AUTH_RATE_LIMITED",
  "Too many login attempts, please try again later",
  Number(process.env.AUTH_RATE_LIMIT_MAX || 10)
);
