import {
  ChangeMessageVisibilityCommand,
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient
} from "@aws-sdk/client-sqs";

export const QUEUE_VISIBILITY_TIMEOUTS = Object.freeze({
  whatsapp: 120,
  sms: 60,
  pdf: 300,
  report: 600
});

const DEFAULT_WAIT_TIME_SECONDS = 20;

const buildSqsClientConfig = (env = process.env) => ({
  region: env.AWS_REGION || "ap-south-1",
  ...(env.NODE_ENV !== "production" &&
    env.AWS_ACCESS_KEY_ID &&
    env.AWS_SECRET_ACCESS_KEY && {
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
      }
    })
});

const buildQueueMap = (env = process.env) => ({
  whatsapp: env.SQS_WHATSAPP_QUEUE_URL,
  sms: env.SQS_SMS_QUEUE_URL,
  pdf: env.SQS_PDF_QUEUE_URL,
  report: env.SQS_REPORT_QUEUE_URL
});

const resolveMessageBody = (payload) =>
  typeof payload === "string" ? payload : JSON.stringify(payload);

const createBaseAttributes = (payload) => ({
  jobType: {
    DataType: "String",
    StringValue: String(payload?.type || "default")
  },
  tenantId: {
    DataType: "String",
    StringValue: String(payload?.tenantId || "")
  }
});

class QueueAdapter {
  async send() {
    throw new Error("Queue adapter send() not implemented");
  }

  async receive() {
    throw new Error("Queue adapter receive() not implemented");
  }

  async delete() {
    throw new Error("Queue adapter delete() not implemented");
  }

  async extendVisibility() {
    throw new Error("Queue adapter extendVisibility() not implemented");
  }
}

export class SQSQueueAdapter extends QueueAdapter {
  constructor({
    client = new SQSClient(buildSqsClientConfig()),
    queues = buildQueueMap(),
    receiveVisibilityTimeouts = QUEUE_VISIBILITY_TIMEOUTS
  } = {}) {
    super();
    this.client = client;
    this.queues = queues;
    this.receiveVisibilityTimeouts = receiveVisibilityTimeouts;
  }

  getQueueUrl(queueName) {
    const queueUrl = this.queues[queueName];

    if (!queueUrl) {
      throw new Error(`Unknown or unconfigured queue: ${queueName}`);
    }

    return queueUrl;
  }

  async send(queueName, payload, options = {}) {
    const { delaySeconds = 0, deduplicationId, groupId, messageAttributes = {} } = options;
    const commandInput = {
      QueueUrl: this.getQueueUrl(queueName),
      MessageBody: resolveMessageBody(payload),
      DelaySeconds: delaySeconds,
      MessageAttributes: {
        ...createBaseAttributes(payload),
        ...messageAttributes
      }
    };

    if (groupId) {
      commandInput.MessageGroupId = groupId;
    }

    if (deduplicationId) {
      commandInput.MessageDeduplicationId = deduplicationId;
    }

    return this.client.send(new SendMessageCommand(commandInput));
  }

  async receive(queueName, maxMessages = 10) {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.getQueueUrl(queueName),
      MaxNumberOfMessages: maxMessages,
      WaitTimeSeconds: DEFAULT_WAIT_TIME_SECONDS,
      MessageAttributeNames: ["All"],
      AttributeNames: ["All"],
      VisibilityTimeout: this.receiveVisibilityTimeouts[queueName] || QUEUE_VISIBILITY_TIMEOUTS.whatsapp
    });
    const response = await this.client.send(command);
    return response.Messages || [];
  }

  async delete(queueName, receiptHandle) {
    return this.client.send(
      new DeleteMessageCommand({
        QueueUrl: this.getQueueUrl(queueName),
        ReceiptHandle: receiptHandle
      })
    );
  }

  async extendVisibility(queueName, receiptHandle, seconds) {
    return this.client.send(
      new ChangeMessageVisibilityCommand({
        QueueUrl: this.getQueueUrl(queueName),
        ReceiptHandle: receiptHandle,
        VisibilityTimeout: seconds || this.receiveVisibilityTimeouts[queueName] || 120
      })
    );
  }
}

export const createQueueAdapter = (options = {}) => new SQSQueueAdapter(options);

export const queue = createQueueAdapter();

export const queueAdapter = queue;
