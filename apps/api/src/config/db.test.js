import { EventEmitter } from "node:events";
import { jest } from "@jest/globals";
import { MAX_RETRIES, MONGODB_OPTIONS, createConnectDB, getRetryDelay } from "./db.js";

const buildLogger = () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
});

describe("db config", () => {
  it("uses the configured connection pool sizing", () => {
    expect(MONGODB_OPTIONS.minPoolSize).toBe(5);
    expect(MONGODB_OPTIONS.maxPoolSize).toBe(20);
  });

  it("retries failed connections with exponential backoff before succeeding", async () => {
    process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/test";

    const logger = buildLogger();
    const wait = jest.fn().mockResolvedValue(undefined);
    const connection = new EventEmitter();
    const mongooseInstance = {
      connection,
      connect: jest
        .fn()
        .mockRejectedValueOnce(new Error("first failure"))
        .mockRejectedValueOnce(new Error("second failure"))
        .mockResolvedValue(connection)
    };

    const connectDB = createConnectDB({
      mongooseInstance,
      loggerInstance: logger,
      wait,
      onMaxRetries: jest.fn()
    });

    await connectDB();

    expect(mongooseInstance.connect).toHaveBeenCalledTimes(3);
    expect(wait).toHaveBeenNthCalledWith(1, getRetryDelay(0));
    expect(wait).toHaveBeenNthCalledWith(2, getRetryDelay(1));
    expect(logger.info).toHaveBeenCalledWith("MongoDB connected");
  });

  it("fails after the max retry budget is exhausted", async () => {
    process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/test";

    const logger = buildLogger();
    const wait = jest.fn().mockResolvedValue(undefined);
    const onMaxRetries = jest.fn();
    const mongooseInstance = {
      connection: new EventEmitter(),
      connect: jest.fn().mockRejectedValue(new Error("db unavailable"))
    };

    const connectDB = createConnectDB({
      mongooseInstance,
      loggerInstance: logger,
      wait,
      onMaxRetries
    });

    await connectDB();

    expect(mongooseInstance.connect).toHaveBeenCalledTimes(MAX_RETRIES + 1);
    expect(wait).toHaveBeenCalledTimes(MAX_RETRIES);
    expect(onMaxRetries).toHaveBeenCalledTimes(1);
  });

  it("attempts reconnect after a disconnect event", async () => {
    process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/test";

    jest.useFakeTimers();

    const logger = buildLogger();
    const connection = new EventEmitter();
    const mongooseInstance = {
      connection,
      connect: jest.fn().mockResolvedValue(connection)
    };

    const connectDB = createConnectDB({
      mongooseInstance,
      loggerInstance: logger,
      onMaxRetries: jest.fn()
    });

    await connectDB();
    connection.emit("disconnected");
    jest.advanceTimersByTime(getRetryDelay(0));
    await Promise.resolve();

    expect(mongooseInstance.connect).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });
});
