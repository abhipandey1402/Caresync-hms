# SQS Queue Setup

These queues must exist in AWS before the API worker is useful. This workspace cannot create them in AWS Console directly, so use this checklist when provisioning `ap-south-1`.

## Queues

| Queue Name | Type | Visibility Timeout | DLQ |
|------------|------|--------------------|-----|
| `caresync-whatsapp-prod` | Standard | `120` seconds | `caresync-whatsapp-dlq` |
| `caresync-sms-prod` | Standard | `60` seconds | `caresync-sms-dlq` |
| `caresync-pdf-prod` | Standard | `300` seconds | `caresync-pdf-dlq` |
| `caresync-report-prod` | Standard | `600` seconds | `caresync-report-dlq` |
| `caresync-whatsapp-dlq` | Standard | `3600` seconds | none |
| `caresync-sms-dlq` | Standard | `3600` seconds | none |
| `caresync-pdf-dlq` | Standard | `3600` seconds | none |
| `caresync-report-dlq` | Standard | `3600` seconds | none |

## Main Queue Settings

- Message retention: `4 days`
- Max message size: `256 KB`
- Receive message wait time: `20 seconds`
- Redrive policy: `maxReceiveCount = 3`

## Required Environment Variables

- `AWS_REGION=ap-south-1`
- `SQS_WHATSAPP_QUEUE_URL=...`
- `SQS_SMS_QUEUE_URL=...`
- `SQS_PDF_QUEUE_URL=...`
- `SQS_REPORT_QUEUE_URL=...`

In production, prefer IAM role credentials on ECS or EC2. Local development can still use `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
