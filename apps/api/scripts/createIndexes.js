import { connectDB } from "../src/config/db.js";
import { initializeEnv } from "../src/config/env.js";
import { initIndexes } from "../src/config/initIndexes.js";
import { logger } from "../src/config/logger.js";
import "../src/models/index.js";

const run = async () => {
  await initializeEnv();
  await connectDB();
  await initIndexes();
};

run().catch((error) => {
  logger.error("Index initialization script failed", {
    errorName: error.name,
    message: error.message,
    stack: error.stack
  });
  process.exit(1);
});
