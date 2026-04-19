import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1"
});

export const storageAdapter = {
  async uploadObject({ bucket = process.env.S3_BUCKET_NAME, key, body, contentType }) {
    return client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType
      })
    );
  },

  async getSignedDownloadUrl({
    bucket = process.env.S3_BUCKET_NAME,
    key,
    expiresIn = Number(process.env.S3_PRESIGN_EXPIRES || 900)
  }) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });

    return getSignedUrl(client, command, { expiresIn });
  }
};
