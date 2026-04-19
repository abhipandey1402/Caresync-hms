import { jest } from "@jest/globals";
import { createPoller, pollQueueOnce } from "./worker.js";

describe("queue worker", () => {
  it("keeps polling after connection errors", async () => {
    const queueAdapter = {
      receive: jest
        .fn()
        .mockRejectedValueOnce(new Error("temporary sqs outage"))
        .mockResolvedValueOnce([]),
      delete: jest.fn()
    };
    const processor = jest.fn();
    const jobLogger = { info: jest.fn(), error: jest.fn() };
    const wait = jest.fn().mockResolvedValue(undefined);
    let iteration = 0;

    const poller = createPoller({
      queueName: "sms",
      processor,
      queueAdapter,
      jobLogger,
      pollErrorDelayMs: 2500,
      wait,
      keepRunning: () => {
        iteration += 1;
        return iteration <= 2;
      }
    });

    await poller();

    expect(queueAdapter.receive).toHaveBeenCalledTimes(2);
    expect(wait).toHaveBeenCalledWith(2500);
    expect(jobLogger.error).toHaveBeenCalledWith(
      "[sms] Poll error",
      expect.objectContaining({ error: "temporary sqs outage" })
    );
  });

  it("leaves failed messages undeleted so SQS can redrive them to the DLQ after 3 receives", async () => {
    const dlq = [];
    const sourceMessage = {
      body: { type: "report.export", tenantId: "tenant-1" },
      receiveCount: 0
    };
    const queueAdapter = {
      receive: jest.fn().mockImplementation(async () => {
        if (!sourceMessage) {
          return [];
        }

        sourceMessage.receiveCount += 1;

        if (sourceMessage.receiveCount > 3) {
          dlq.push(sourceMessage.body);
          return [];
        }

        return [
          {
            Body: JSON.stringify(sourceMessage.body),
            ReceiptHandle: `rh-${sourceMessage.receiveCount}`,
            Attributes: {
              ApproximateReceiveCount: String(sourceMessage.receiveCount)
            }
          }
        ];
      }),
      delete: jest.fn()
    };
    const processor = jest.fn().mockRejectedValue(new Error("processing failed"));
    const jobLogger = { info: jest.fn(), error: jest.fn() };

    await pollQueueOnce({
      queueName: "report",
      processor,
      queueAdapter,
      jobLogger
    });
    await pollQueueOnce({
      queueName: "report",
      processor,
      queueAdapter,
      jobLogger
    });
    await pollQueueOnce({
      queueName: "report",
      processor,
      queueAdapter,
      jobLogger
    });
    await pollQueueOnce({
      queueName: "report",
      processor,
      queueAdapter,
      jobLogger
    });

    expect(processor).toHaveBeenCalledTimes(3);
    expect(queueAdapter.delete).not.toHaveBeenCalled();
    expect(dlq).toEqual([{ type: "report.export", tenantId: "tenant-1" }]);
    expect(jobLogger.error).toHaveBeenCalledWith(
      "[report] Job failed",
      expect.objectContaining({ receiveCount: "3" })
    );
  });
});
