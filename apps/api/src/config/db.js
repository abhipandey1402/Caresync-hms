import mongoose from "mongoose";
import "./loadEnv.js";
import { logger } from "./logger.js";

mongoose.set("strictQuery", true);

export const MONGODB_OPTIONS = {
  maxPoolSize: 20,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  w: "majority"
};

export const MAX_RETRIES = 10;

export const getRetryDelay = (retryCount) => Math.min(1000 * 2 ** retryCount, 30000);

export const createConnectDB = ({
  mongooseInstance = mongoose,
  loggerInstance = logger,
  maxRetries = MAX_RETRIES,
  onMaxRetries = () => process.exit(1),
  wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
} = {}) => {
  let retries = 0;
  let listenersAttached = false;
  let reconnectTimer = null;

  const scheduleReconnect = () => {
    if (retries >= maxRetries || reconnectTimer) {
      return;
    }

    const delay = getRetryDelay(retries);
    loggerInstance.warn(`MongoDB disconnected - attempting reconnect in ${delay}ms`);
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      void connectDB();
    }, delay);
    retries += 1;
  };

  const attachConnectionListeners = () => {
    if (listenersAttached) {
      return;
    }

    mongooseInstance.connection.on("disconnected", scheduleReconnect);
    mongooseInstance.connection.on("error", (error) => {
      loggerInstance.error("MongoDB error", {
        error: error.message,
        stack: error.stack
      });
    });

    listenersAttached = true;
  };

  const connectDB = async () => {
    try {
      await mongooseInstance.connect(process.env.MONGODB_URI, MONGODB_OPTIONS);
      loggerInstance.info("MongoDB connected");
      retries = 0;
      attachConnectionListeners();
    } catch (error) {
      if (retries < maxRetries) {
        const delay = getRetryDelay(retries);
        loggerInstance.warn(
          `MongoDB connection failed, retry ${retries + 1}/${maxRetries} in ${delay}ms`,
          { error: error.message }
        );
        retries += 1;
        await wait(delay);
        return connectDB();
      }

      loggerInstance.error("MongoDB connection failed after max retries", {
        error: error.message,
        stack: error.stack
      });
      onMaxRetries(error);
      return undefined;
    }

    return mongooseInstance.connection;
  };

  return connectDB;
};

export const connectDB = createConnectDB();
