import "./config/loadEnv.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import compression from "compression";
import cookieParser from "cookie-parser";
import { authRateLimiter, rateLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { getRequestLogContext, logger } from "./config/logger.js";
import routes from "./routes/index.js";
import { getHealth } from "./controllers/health.controller.js";
import { ApiError } from "./utils/index.js";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"]
      }
    },
    hsts: {
      maxAge: 63072000,
      includeSubDomains: true
    }
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());

app.use((req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    logger.info("HTTP request completed", {
      ...getRequestLogContext(req),
      statusCode: res.statusCode,
      contentLength: res.getHeader("content-length"),
      userAgent: req.get("user-agent"),
      ip: req.ip,
      durationMs: Number(process.hrtime.bigint() - start) / 1_000_000
    });
  });

  next();
});

app.use("/api/", rateLimiter);
app.use("/api/v1/auth/login", authRateLimiter);

app.get("/health", getHealth);

app.use("/api/v1", routes);

app.use((req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`, [{ code: "NOT_FOUND" }]));
});

app.use(errorHandler);

export default app;
