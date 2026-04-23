import { getProductionSsmParameters, validateEnv } from "./env.js";

const buildValidEnv = () => ({
  NODE_ENV: "development",
  PORT: "8080",
  API_HOST: "0.0.0.0",
  MONGODB_URI: "mongodb://127.0.0.1:27017/caresync-hms",
  JWT_PRIVATE_KEY: "p".repeat(120),
  JWT_PUBLIC_KEY: "u".repeat(120),
  JWT_ACCESS_EXPIRES: "15m",
  JWT_REFRESH_EXPIRES: "7d",
  AWS_REGION: "ap-south-1",
  AWS_ACCESS_KEY_ID: "local-access-key",
  AWS_SECRET_ACCESS_KEY: "local-secret-key",
  AWS_SSM_PREFIX: "/caresync",
  S3_BUCKET_NAME: "caresync-dev-bucket",
  S3_PRESIGN_EXPIRES: "900",
  SQS_WHATSAPP_QUEUE_URL: "https://sqs.ap-south-1.amazonaws.com/123456789012/whatsapp",
  SQS_SMS_QUEUE_URL: "https://sqs.ap-south-1.amazonaws.com/123456789012/sms",
  SQS_PDF_QUEUE_URL: "https://sqs.ap-south-1.amazonaws.com/123456789012/pdf",
  SQS_REPORT_QUEUE_URL: "https://sqs.ap-south-1.amazonaws.com/123456789012/report",
  SES_FROM_EMAIL: "ops@example.com",
  WABA_PHONE_ID: "1234567890",
  WABA_ACCESS_TOKEN: "local-waba-token",
  SMS_API_KEY: "local-sms-api-key",
  SMS_SENDER_ID: "CRSYNC",
  ABDM_BASE_URL: "https://abdm.example.com",
  ABDM_CLIENT_ID: "abdm-client-id",
  ABDM_CLIENT_SECRET: "abdm-client-secret",
  ENCRYPTION_KEY: "a".repeat(64),
  FRONTEND_URL: "http://localhost:5173",
  LOG_LEVEL: "info",
  RATE_LIMIT_WINDOW_MS: "900000",
  RATE_LIMIT_MAX: "100",
  AUTH_RATE_LIMIT_WINDOW_MS: "60000",
  AUTH_RATE_LIMIT_MAX: "10"
});

describe("env validation", () => {
  it("identifies the missing variable by name", () => {
    const invalidEnv = buildValidEnv();

    delete invalidEnv.MONGODB_URI;

    expect(() => validateEnv(invalidEnv)).toThrow(/MONGODB_URI/);
  });

  it("builds the documented production SSM paths", () => {
    expect(getProductionSsmParameters()).toEqual({
      MONGODB_URI: "/caresync/production/mongodb-uri",
      JWT_PRIVATE_KEY: "/caresync/production/jwt-private-key",
      JWT_PUBLIC_KEY: "/caresync/production/jwt-public-key",
      WABA_ACCESS_TOKEN: "/caresync/production/waba-access-token",
      ABDM_CLIENT_SECRET: "/caresync/production/abdm-client-secret",
      ENCRYPTION_KEY: "/caresync/production/encryption-key",
      SMS_API_KEY: "/caresync/production/sms-api-key"
    });
  });

  it("allows production SQS setup without static AWS keys when IAM roles are used", () => {
    const productionEnv = buildValidEnv();

    productionEnv.NODE_ENV = "production";
    delete productionEnv.AWS_ACCESS_KEY_ID;
    delete productionEnv.AWS_SECRET_ACCESS_KEY;

    expect(() => validateEnv(productionEnv)).not.toThrow();
  });

  it("allows NODE_ENV=test for CI pipelines", () => {
    const testEnv = buildValidEnv();

    testEnv.NODE_ENV = "test";

    expect(() => validateEnv(testEnv)).not.toThrow();
  });
});
