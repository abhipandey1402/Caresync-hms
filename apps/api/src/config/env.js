import { z } from "zod";
import "./loadEnv.js";
import { secretsAdapter } from "../shared/adapters/secrets.adapter.js";

const bootstrapEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  API_HOST: z.string().default("0.0.0.0"),
  AWS_REGION: z.string().default("ap-south-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_SSM_PREFIX: z.string().default("/caresync")
});

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  API_HOST: z.string().default("0.0.0.0"),

  MONGODB_URI: z.string().url(),

  JWT_PRIVATE_KEY: z.string().min(100),
  JWT_PUBLIC_KEY: z.string().min(100),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),

  AWS_REGION: z.string().default("ap-south-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_SSM_PREFIX: z.string().default("/caresync"),

  S3_BUCKET_NAME: z.string(),
  S3_PRESIGN_EXPIRES: z.coerce.number().default(900),

  SQS_WHATSAPP_QUEUE_URL: z.string().url(),
  SQS_SMS_QUEUE_URL: z.string().url(),
  SQS_PDF_QUEUE_URL: z.string().url(),
  SQS_REPORT_QUEUE_URL: z.string().url(),

  SES_FROM_EMAIL: z.string().email(),

  WABA_PHONE_ID: z.string(),
  WABA_ACCESS_TOKEN: z.string(),

  SMS_API_KEY: z.string(),
  SMS_SENDER_ID: z.string().default("CRSYNC"),

  ABDM_BASE_URL: z.string().url(),
  ABDM_CLIENT_ID: z.string(),
  ABDM_CLIENT_SECRET: z.string(),

  ENCRYPTION_KEY: z.string().length(64),

  FRONTEND_URL: z.string().url(),

  LOG_LEVEL: z.string().default("info"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  CLOUDWATCH_LOG_GROUP: z.string().optional(),
  CLOUDWATCH_LOG_STREAM: z.string().optional()
});

const ssmProductionSecrets = {
  MONGODB_URI: "mongodb-uri",
  JWT_PRIVATE_KEY: "jwt-private-key",
  JWT_PUBLIC_KEY: "jwt-public-key",
  WABA_ACCESS_TOKEN: "waba-access-token",
  ABDM_CLIENT_SECRET: "abdm-client-secret",
  ENCRYPTION_KEY: "encryption-key",
  SMS_API_KEY: "sms-api-key"
};

const stringifyEnv = (values) =>
  Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)]));

const formatIssues = (issues) =>
  issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");

const buildSecretPath = (prefix, nodeEnv, key) =>
  `${prefix.replace(/\/$/, "")}/${nodeEnv}/${key}`.replace(/\/{2,}/g, "/");

export const getProductionSsmParameters = (
  nodeEnv = "production",
  prefix = "/caresync"
) => {
  return Object.fromEntries(
    Object.entries(ssmProductionSecrets).map(([envKey, secretKey]) => [
      envKey,
      buildSecretPath(prefix, nodeEnv, secretKey)
    ])
  );
};

export const hydrateSecretsFromSSM = async (rawEnv = process.env) => {
  const bootstrap = bootstrapEnvSchema.parse(rawEnv);

  if (bootstrap.NODE_ENV !== "production") {
    return rawEnv;
  }

  const secretPaths = getProductionSsmParameters(bootstrap.NODE_ENV, bootstrap.AWS_SSM_PREFIX);

  for (const [envKey, secretPath] of Object.entries(secretPaths)) {
    if (rawEnv[envKey]) {
      continue;
    }

    const secretValue = await secretsAdapter.getSecret(secretPath);

    if (secretValue) {
      rawEnv[envKey] = secretValue;
    }
  }

  return rawEnv;
};

export const validateEnv = (rawEnv = process.env) => {
  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    throw new Error(`Invalid environment variables: ${formatIssues(result.error.issues)}`);
  }

  Object.assign(rawEnv, stringifyEnv(result.data));

  return result.data;
};

export let env;

export const initializeEnv = async (rawEnv = process.env) => {
  try {
    await hydrateSecretsFromSSM(rawEnv);
    env = validateEnv(rawEnv);
    return env;
  } catch (error) {
    console.error("Invalid environment variables:");
    console.error(error.message);
    throw error;
  }
};
