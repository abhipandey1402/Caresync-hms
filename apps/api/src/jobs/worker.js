import { fileURLToPath } from "node:url";
import { initializeEnv } from "../config/env.js";
import { logger } from "../config/logger.js";
import { queue } from "../shared/adapters/queue.adapter.js";
import { processPdf } from "./processors/pdf.processor.js";
import { processReport } from "./processors/report.processor.js";
import { processSms } from "./processors/sms.processor.js";
import { processWhatsApp } from "./processors/whatsapp.processor.js";

export const PROCESSORS = Object.freeze({
  whatsapp: processWhatsApp,
  sms: processSms,
  pdf: processPdf,
  report: processReport
});

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const processQueueMessage = async ({
  queueName,
  message,
  processor,
  queueAdapter = queue,
  jobLogger = logger
}) => {
  const payload = JSON.parse(message.Body);

  try {
    await processor(payload, message);
    await queueAdapter.delete(queueName, message.ReceiptHandle);
    jobLogger.info(`[${queueName}] Job processed`, {
      jobType: payload?.type || "default"
    });
  } catch (error) {
    jobLogger.error(`[${queueName}] Job failed`, {
      error: error.message,
      payload,
      receiveCount: message.Attributes?.ApproximateReceiveCount
    });
  }
};

export const pollQueueOnce = async ({
  queueName,
  processor,
  queueAdapter = queue,
  jobLogger = logger,
  maxMessages = 10
}) => {
  const messages = await queueAdapter.receive(queueName, maxMessages);

  for (const message of messages) {
    await processQueueMessage({
      queueName,
      message,
      processor,
      queueAdapter,
      jobLogger
    });
  }

  return messages.length;
};

export const createPoller = ({
  queueName,
  processor,
  queueAdapter = queue,
  jobLogger = logger,
  pollErrorDelayMs = 5000,
  keepRunning = () => true,
  wait = sleep,
  maxMessages = 10
}) => {
  return async () => {
    while (keepRunning()) {
      try {
        await pollQueueOnce({
          queueName,
          processor,
          queueAdapter,
          jobLogger,
          maxMessages
        });
      } catch (error) {
        jobLogger.error(`[${queueName}] Poll error`, {
          error: error.message
        });
        await wait(pollErrorDelayMs);
      }
    }
  };
};

export const startWorker = async ({
  processors = PROCESSORS,
  queueAdapter = queue,
  jobLogger = logger,
  pollErrorDelayMs = 5000,
  keepRunning = () => true
} = {}) => {
  const pollers = Object.entries(processors).map(([queueName, processor]) => {
    jobLogger.info(`Worker started for queue: ${queueName}`);
    return createPoller({
      queueName,
      processor,
      queueAdapter,
      jobLogger,
      pollErrorDelayMs,
      keepRunning
    })();
  });

  return Promise.all(pollers);
};

const isDirectExecution = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  initializeEnv()
    .then(() => startWorker())
    .catch((error) => {
      logger.error("Failed to start worker", {
        error: error.message,
        stack: error.stack
      });
      process.exit(1);
    });
}
