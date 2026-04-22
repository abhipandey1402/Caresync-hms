import { connectDB } from "../../src/config/db.js";
import { initializeEnv } from "../../src/config/env.js";
import { logger } from "../../src/config/logger.js";
import "../../src/models/index.js";
import { seedDiagnoses } from "./diagnoses.seed.js";
import { seedMedicines } from "./medicines.seed.js";
import { seedServices } from "./services.seed.js";

const runSeeds = async () => {
  await initializeEnv();
  await connectDB();

  const results = {
    medicines: await seedMedicines(),
    diagnoses: await seedDiagnoses(),
    services: await seedServices()
  };

  logger.info("All seed scripts completed", results);
};

runSeeds().catch((error) => {
  logger.error("Seed pipeline failed", {
    errorName: error.name,
    message: error.message,
    stack: error.stack
  });
  process.exit(1);
});
