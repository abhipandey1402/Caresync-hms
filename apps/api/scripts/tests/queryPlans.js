import mongoose from "mongoose";
import { connectDB } from "../../src/config/db.js";
import { initializeEnv } from "../../src/config/env.js";
import { logger } from "../../src/config/logger.js";
import "../../src/models/index.js";
import { Patient } from "../../src/models/patient.model.js";
import { Visit } from "../../src/models/visit.model.js";

const planContainsIndexScan = (plan = {}) => {
  const serialized = JSON.stringify(plan);
  return serialized.includes("IXSCAN");
};

const run = async () => {
  await initializeEnv();
  await connectDB();

  const tenantId = new mongoose.Types.ObjectId();
  const patientPlan = await Patient.find({
    tenantId,
    $text: { $search: "Para Tablet 500mg" }
  })
    .lean()
    .explain("executionStats");
  const visitPlan = await Visit.find({
    tenantId,
    status: "queued"
  })
    .sort({ visitDate: -1 })
    .lean()
    .explain("executionStats");

  if (!planContainsIndexScan(patientPlan.queryPlanner?.winningPlan)) {
    throw new Error("Patient search query did not use IXSCAN");
  }

  if (!planContainsIndexScan(visitPlan.queryPlanner?.winningPlan)) {
    throw new Error("Visit queue query did not use IXSCAN");
  }

  logger.info("Query plan verification completed", {
    patientWinningPlan: patientPlan.queryPlanner?.winningPlan,
    visitWinningPlan: visitPlan.queryPlanner?.winningPlan
  });
};

run().catch((error) => {
  logger.error("Query plan verification failed", {
    errorName: error.name,
    message: error.message,
    stack: error.stack
  });
  process.exit(1);
});
