import { jest } from "@jest/globals";
import {
  QUEUE_VISIBILITY_TIMEOUTS,
  createQueueAdapter
} from "./queue.adapter.js";

describe("SQS queue adapter", () => {
  it("sends JSON payloads with queue metadata attributes", async () => {
    const client = { send: jest.fn().mockResolvedValue({ MessageId: "msg-1" }) };
    const adapter = createQueueAdapter({
      client,
      queues: {
        whatsapp: "https://example.com/whatsapp"
      }
    });

    await adapter.send("whatsapp", { type: "appointment.reminder", tenantId: "tenant-1" });

    expect(client.send).toHaveBeenCalledTimes(1);
    const command = client.send.mock.calls[0][0];

    expect(command.input).toMatchObject({
      QueueUrl: "https://example.com/whatsapp",
      DelaySeconds: 0,
      MessageBody: JSON.stringify({
        type: "appointment.reminder",
        tenantId: "tenant-1"
      }),
      MessageAttributes: {
        jobType: { DataType: "String", StringValue: "appointment.reminder" },
        tenantId: { DataType: "String", StringValue: "tenant-1" }
      }
    });
  });

  it("uses long polling and queue-specific visibility timeouts when receiving", async () => {
    const client = {
      send: jest.fn().mockResolvedValue({
        Messages: [{ Body: "{\"ok\":true}", ReceiptHandle: "rh-1" }]
      })
    };
    const adapter = createQueueAdapter({
      client,
      queues: {
        pdf: "https://example.com/pdf"
      }
    });

    await adapter.receive("pdf", 5);

    const command = client.send.mock.calls[0][0];
    expect(command.input).toMatchObject({
      QueueUrl: "https://example.com/pdf",
      MaxNumberOfMessages: 5,
      WaitTimeSeconds: 20,
      VisibilityTimeout: QUEUE_VISIBILITY_TIMEOUTS.pdf
    });
  });

  it("deletes and extends visibility on the configured queue", async () => {
    const client = { send: jest.fn().mockResolvedValue({}) };
    const adapter = createQueueAdapter({
      client,
      queues: {
        report: "https://example.com/report"
      }
    });

    await adapter.delete("report", "rh-delete");
    await adapter.extendVisibility("report", "rh-extend", 900);

    expect(client.send.mock.calls[0][0].input).toMatchObject({
      QueueUrl: "https://example.com/report",
      ReceiptHandle: "rh-delete"
    });
    expect(client.send.mock.calls[1][0].input).toMatchObject({
      QueueUrl: "https://example.com/report",
      ReceiptHandle: "rh-extend",
      VisibilityTimeout: 900
    });
  });
});
