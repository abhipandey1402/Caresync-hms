# S3 and CloudFront Storage Setup

This ticket is implemented in code and provisioned through [infra/aws/storage-stack.yml](/Users/abhipandey/Desktop/caresync-hms/infra/aws/storage-stack.yml).

## What the stack creates

- Private S3 bucket `caresync-files-prod`
- All S3 public access blocked
- S3 versioning enabled
- SSE-S3 (`AES256`) encryption at rest
- Lifecycle transition to Glacier after 365 days
- Lifecycle expiry for `temp/` objects after 7 days
- CloudFront distribution with Origin Access Control to the private bucket
- EC2 IAM role and instance profile for S3 access without hardcoded production credentials

## App configuration

- `AWS_REGION=ap-south-1`
- `S3_BUCKET_NAME=caresync-files-prod`
- `S3_PRESIGN_EXPIRES=900`
- In production, do not set `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY`; rely on the EC2 instance profile

## Deploy

```bash
aws cloudformation deploy \
  --stack-name caresync-storage-prod \
  --template-file infra/aws/storage-stack.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    EnvironmentName=prod \
    BucketName=caresync-files-prod \
    AppInstanceProfileName=caresync-api-prod
```

## Post-deploy verification

```bash
aws s3api get-public-access-block --bucket caresync-files-prod
aws s3api get-bucket-versioning --bucket caresync-files-prod
aws s3api get-bucket-encryption --bucket caresync-files-prod
aws s3api get-bucket-lifecycle-configuration --bucket caresync-files-prod
aws cloudfront get-distribution --id <distribution-id>
aws iam get-instance-profile --instance-profile-name caresync-api-prod
```

## Runtime acceptance checks

Use the adapter in `apps/api/src/shared/adapters/storage.adapter.js`.

```js
import { storage } from "../src/shared/adapters/storage.adapter.js";

const key = storage.buildKey("prescription", {
  tenantId: "tenant-1",
  resourceId: "prescription-123"
});

await storage.upload(key, Buffer.from("pdf bytes"), "application/pdf");
const url = await storage.getPresignedUrl(key, 900);
console.log({ key, url });
```

The URL should work for 15 minutes and then return `403` after expiry.

## Notes

- Application documents should continue to use S3 pre-signed URLs. They are not public and should not be fronted directly by an open CDN path.
- The CloudFront distribution exists for controlled static delivery patterns while keeping the S3 bucket private through OAC.
