import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const DEFAULT_REGION = "ap-south-1";
const DEFAULT_DOWNLOAD_EXPIRES_IN = 900;
const DEFAULT_UPLOAD_EXPIRES_IN = 300;
const DEFAULT_TEMP_PREFIX = "temp";
const DEFAULT_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const buildS3ClientConfig = (env = process.env) => ({
  region: env.AWS_REGION || DEFAULT_REGION,
  ...(env.NODE_ENV !== "production" &&
    env.AWS_ACCESS_KEY_ID &&
    env.AWS_SECRET_ACCESS_KEY && {
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
      }
    })
});

const pad = (value) => String(value).padStart(2, "0");

const toIsoDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date provided for storage key: ${value}`);
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const assertRequired = (value, name) => {
  if (!value) {
    throw new Error(`Missing required storage key field: ${name}`);
  }

  return value;
};

class StorageAdapter {
  async upload() {
    throw new Error("Storage adapter upload() not implemented");
  }

  async getPresignedUrl() {
    throw new Error("Storage adapter getPresignedUrl() not implemented");
  }

  async getUploadUrl() {
    throw new Error("Storage adapter getUploadUrl() not implemented");
  }

  async delete() {
    throw new Error("Storage adapter delete() not implemented");
  }
}

export class S3StorageAdapter extends StorageAdapter {
  constructor({
    client = new S3Client(buildS3ClientConfig()),
    bucket = process.env.S3_BUCKET_NAME,
    defaultPresignExpires = Number(process.env.S3_PRESIGN_EXPIRES || DEFAULT_DOWNLOAD_EXPIRES_IN),
    defaultUploadExpires = DEFAULT_UPLOAD_EXPIRES_IN,
    now = () => new Date(),
    presignUrl = getSignedUrl
  } = {}) {
    super();
    this.client = client;
    this.bucket = bucket;
    this.defaultPresignExpires = defaultPresignExpires;
    this.defaultUploadExpires = defaultUploadExpires;
    this.now = now;
    this.presignUrl = presignUrl;
  }

  getBucket(bucket = this.bucket) {
    if (!bucket) {
      throw new Error("S3 bucket name is not configured");
    }

    return bucket;
  }

  buildKey(kind, options = {}) {
    const {
      tenantId,
      resourceId,
      patientId,
      jobId,
      reportType,
      ext = "pdf",
      date = this.now()
    } = options;
    const resolvedDate = date instanceof Date ? date : new Date(date);
    const year = resolvedDate.getFullYear();
    const month = pad(resolvedDate.getMonth() + 1);

    switch (kind) {
      case "prescription":
        return `prescriptions/${assertRequired(tenantId, "tenantId")}/${year}/${month}/${assertRequired(resourceId, "resourceId")}.${ext}`;
      case "invoice":
        return `invoices/${assertRequired(tenantId, "tenantId")}/${year}/${month}/${assertRequired(resourceId, "resourceId")}.${ext}`;
      case "report":
        return `reports/${assertRequired(tenantId, "tenantId")}/${assertRequired(reportType, "reportType")}/${assertRequired(jobId || resourceId, "jobId")}.${ext}`;
      case "abha":
        return `abha-cards/${assertRequired(tenantId, "tenantId")}/${assertRequired(patientId || resourceId, "patientId")}/abha-card.${ext}`;
      case "logo":
        return `clinic-logos/${assertRequired(tenantId, "tenantId")}/logo.${ext}`;
      case "temp":
        return `${DEFAULT_TEMP_PREFIX}/${toIsoDate(resolvedDate)}/${assertRequired(resourceId, "resourceId")}.${ext}`;
      default:
        throw new Error(`Unsupported storage key type: ${kind}`);
    }
  }

  async upload(key, body, contentType, metadata = {}, options = {}) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.getBucket(options.bucket),
        Key: key,
        Body: body,
        ContentType: contentType,
        ServerSideEncryption: "AES256",
        Metadata: metadata,
        CacheControl: options.cacheControl,
        ContentDisposition: options.contentDisposition
      })
    );

    return key;
  }

  async uploadObject({ bucket, key, body, contentType, metadata = {}, ...options }) {
    return this.client.send(
      new PutObjectCommand({
        Bucket: this.getBucket(bucket),
        Key: key,
        Body: body,
        ContentType: contentType,
        ServerSideEncryption: "AES256",
        Metadata: metadata,
        CacheControl: options.cacheControl,
        ContentDisposition: options.contentDisposition
      })
    );
  }

  async getPresignedUrl(key, expiresIn = this.defaultPresignExpires, options = {}) {
    const command = new GetObjectCommand({
      Bucket: this.getBucket(options.bucket),
      Key: key,
      ResponseContentType: options.responseContentType,
      ResponseContentDisposition: options.responseContentDisposition
    });

    return this.presignUrl(this.client, command, { expiresIn });
  }

  async getSignedDownloadUrl({
    bucket,
    key,
    expiresIn = this.defaultPresignExpires,
    responseContentType,
    responseContentDisposition
  }) {
    return this.getPresignedUrl(key, expiresIn, {
      bucket,
      responseContentType,
      responseContentDisposition
    });
  }

  async getUploadUrl(
    key,
    contentType,
    expiresIn = this.defaultUploadExpires,
    options = {}
  ) {
    const metadata = options.metadata || {};
    const command = new PutObjectCommand({
      Bucket: this.getBucket(options.bucket),
      Key: key,
      ContentType: contentType,
      ServerSideEncryption: "AES256",
      Metadata: metadata
    });
    const url = await this.presignUrl(this.client, command, { expiresIn });

    return {
      url,
      method: "PUT",
      expiresIn,
      maxUploadBytes: options.maxUploadBytes || DEFAULT_MAX_UPLOAD_BYTES,
      headers: {
        "Content-Type": contentType,
        "x-amz-server-side-encryption": "AES256",
        ...Object.fromEntries(
          Object.entries(metadata).map(([metadataKey, metadataValue]) => [
            `x-amz-meta-${metadataKey}`,
            String(metadataValue)
          ])
        )
      }
    };
  }

  async delete(key, options = {}) {
    return this.client.send(
      new DeleteObjectCommand({
        Bucket: this.getBucket(options.bucket),
        Key: key
      })
    );
  }
}

export const createStorageAdapter = (options = {}) => new S3StorageAdapter(options);

export const storage = createStorageAdapter();
export const storageAdapter = storage;
