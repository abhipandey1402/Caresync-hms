import winston from "winston";
import WinstonCloudWatchModule from "winston-cloudwatch";
import "./loadEnv.js";

const WinstonCloudWatch = WinstonCloudWatchModule.default || WinstonCloudWatchModule;

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), winston.format.simple())
  })
];

if (
  process.env.CLOUDWATCH_LOG_GROUP &&
  process.env.CLOUDWATCH_LOG_STREAM &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY
) {
  transports.push(
    new WinstonCloudWatch({
      logGroupName: process.env.CLOUDWATCH_LOG_GROUP,
      logStreamName: process.env.CLOUDWATCH_LOG_STREAM,
      awsRegion: process.env.AWS_REGION || "ap-south-1",
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY
    })
  );
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: { service: "caresync-hms-api" },
  transports
});
