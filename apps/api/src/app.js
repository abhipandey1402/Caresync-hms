import "./config/loadEnv.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import compression from "compression";
import cookieParser from "cookie-parser";
import { authRateLimiter, rateLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger } from "./config/logger.js";
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

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

app.use("/api/", rateLimiter);
app.use("/api/v1/auth/login", authRateLimiter);

app.get("/health", getHealth);

app.use("/api/v1", routes);

app.use((req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`, [{ code: "NOT_FOUND" }]));
});

app.use(errorHandler);

export default app;
