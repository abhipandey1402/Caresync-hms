import { jest } from "@jest/globals";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  S3StorageAdapter,
  buildS3ClientConfig,
  createStorageAdapter
} from "./storage.adapter.js";

describe("S3 storage adapter", () => {
  it("uses static credentials only outside production", () => {
    expect(
      buildS3ClientConfig({
        NODE_ENV: "development",
        AWS_REGION: "ap-south-1",
        AWS_ACCESS_KEY_ID: "local-key",
        AWS_SECRET_ACCESS_KEY: "local-secret"
      })
    ).toEqual({
      region: "ap-south-1",
      credentials: {
        accessKeyId: "local-key",
        secretAccessKey: "local-secret"
      }
    });

    expect(
      buildS3ClientConfig({
        NODE_ENV: "production",
        AWS_REGION: "ap-south-1",
        AWS_ACCESS_KEY_ID: "should-not-be-used",
        AWS_SECRET_ACCESS_KEY: "should-not-be-used"
      })
    ).toEqual({
      region: "ap-south-1"
    });
  });

  it("uploads with SSE-S3 and returns the storage key", async () => {
    const client = { send: jest.fn().mockResolvedValue({ ETag: "etag-1" }) };
    const adapter = createStorageAdapter({
      client,
      bucket: "caresync-files-prod"
    });

    await expect(
      adapter.upload("prescriptions/tenant-1/2026/04/rx-1.pdf", Buffer.from("pdf"), "application/pdf", {
        tenantId: "tenant-1"
      })
    ).resolves.toBe("prescriptions/tenant-1/2026/04/rx-1.pdf");

    expect(client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    expect(client.send.mock.calls[0][0].input).toMatchObject({
      Bucket: "caresync-files-prod",
      Key: "prescriptions/tenant-1/2026/04/rx-1.pdf",
      ContentType: "application/pdf",
      ServerSideEncryption: "AES256",
      Metadata: {
        tenantId: "tenant-1"
      }
    });
  });

  it("creates a presigned download URL with the configured expiry", async () => {
    const presignUrl = jest.fn().mockResolvedValue("https://example.com/download");
    const adapter = new S3StorageAdapter({
      client: { send: jest.fn() },
      bucket: "caresync-files-prod",
      defaultPresignExpires: 900,
      presignUrl
    });

    await expect(
      adapter.getPresignedUrl("invoices/tenant-1/2026/04/inv-1.pdf")
    ).resolves.toBe("https://example.com/download");

    expect(presignUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(GetObjectCommand),
      { expiresIn: 900 }
    );
    expect(presignUrl.mock.calls[0][1].input).toMatchObject({
      Bucket: "caresync-files-prod",
      Key: "invoices/tenant-1/2026/04/inv-1.pdf"
    });
  });

  it("creates a presigned upload URL with encryption headers for browser uploads", async () => {
    const presignUrl = jest.fn().mockResolvedValue("https://example.com/upload");
    const adapter = new S3StorageAdapter({
      client: { send: jest.fn() },
      bucket: "caresync-files-prod",
      presignUrl
    });

    const upload = await adapter.getUploadUrl(
      "reports/tenant-1/daily/job-1.csv",
      "text/csv",
      300,
      {
        metadata: {
          tenantId: "tenant-1"
        }
      }
    );

    expect(upload).toEqual({
      url: "https://example.com/upload",
      method: "PUT",
      expiresIn: 300,
      maxUploadBytes: 10 * 1024 * 1024,
      headers: {
        "Content-Type": "text/csv",
        "x-amz-server-side-encryption": "AES256",
        "x-amz-meta-tenantId": "tenant-1"
      }
    });
    expect(presignUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(PutObjectCommand),
      { expiresIn: 300 }
    );
  });

  it("builds the ticketed S3 key layout", () => {
    const adapter = new S3StorageAdapter({
      client: { send: jest.fn() },
      bucket: "caresync-files-prod",
      now: () => new Date("2026-04-22T10:00:00.000Z")
    });

    expect(
      adapter.buildKey("prescription", {
        tenantId: "tenant-1",
        resourceId: "prescription-1"
      })
    ).toBe("prescriptions/tenant-1/2026/04/prescription-1.pdf");
    expect(
      adapter.buildKey("invoice", {
        tenantId: "tenant-1",
        resourceId: "bill-1"
      })
    ).toBe("invoices/tenant-1/2026/04/bill-1.pdf");
    expect(
      adapter.buildKey("report", {
        tenantId: "tenant-1",
        reportType: "daily-sales",
        jobId: "job-1",
        ext: "csv"
      })
    ).toBe("reports/tenant-1/daily-sales/job-1.csv");
    expect(
      adapter.buildKey("abha", {
        tenantId: "tenant-1",
        patientId: "patient-1"
      })
    ).toBe("abha-cards/tenant-1/patient-1/abha-card.pdf");
    expect(
      adapter.buildKey("logo", {
        tenantId: "tenant-1",
        ext: "png"
      })
    ).toBe("clinic-logos/tenant-1/logo.png");
    expect(
      adapter.buildKey("temp", {
        resourceId: "preview-1",
        ext: "pdf",
        date: "2026-04-22T10:00:00.000Z"
      })
    ).toBe("temp/2026-04-22/preview-1.pdf");
  });

  it("deletes objects from the configured bucket", async () => {
    const client = { send: jest.fn().mockResolvedValue({}) };
    const adapter = new S3StorageAdapter({
      client,
      bucket: "caresync-files-prod"
    });

    await adapter.delete("abha-cards/tenant-1/patient-1/abha-card.pdf");

    expect(client.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    expect(client.send.mock.calls[0][0].input).toMatchObject({
      Bucket: "caresync-files-prod",
      Key: "abha-cards/tenant-1/patient-1/abha-card.pdf"
    });
  });
});
