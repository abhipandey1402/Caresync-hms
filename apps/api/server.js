import mongoose from "mongoose";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { initializeEnv } from "./src/config/env.js";
import { initIndexes } from "./src/config/initIndexes.js";
import { logger } from "./src/config/logger.js";
import { startExpiryAlertCron } from "./src/crons/expiryAlerts.js";

const startServer = async () => {
  const runtimeEnv = await initializeEnv();
  const port = runtimeEnv.PORT;
  const host = runtimeEnv.API_HOST;

  await connectDB();
  await initIndexes();
  startExpiryAlertCron();

  const server = app.listen(port, host, () => {
    logger.info(`Server running on port ${port} [${runtimeEnv.NODE_ENV}]`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received - graceful shutdown`);

    server.close(async () => {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed");
      }

      process.exit(0);
    });

    setTimeout(() => process.exit(1), 15000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer().catch((error) => {
  logger.error("Failed to start server", { error: error.message, stack: error.stack });
  process.exit(1);
});
