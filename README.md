# CareSync HMS

Monorepo bootstrap for the Hospital Management System.

## Workspaces

- `apps/api`: Express API scaffold
- `apps/web`: Vite + React frontend scaffold
- `packages/shared`: Shared Zod schemas and types
- `infra`: Docker, Nginx, and deployment configs

## Getting Started

1. Copy `.env.example` to `.env` and adjust values as needed.
2. Run `npm install` from the repo root.
3. Run `npm run dev` from the repo root.

The API starts on `http://localhost:3000` and the web app starts on `http://localhost:5173`.

## Environment and Secrets

- Local development uses the repo-root `.env` file. It is ignored by git.
- Production must not read `.env`; the API only loads `.env` outside `production`.
- Production secret values are resolved from AWS SSM Parameter Store before full env validation runs.
- Private file storage is provisioned from `infra/aws/storage-stack.yml`; runtime usage is documented in `apps/api/docs/storage-setup.md`.

### Production SSM Parameters

- `/caresync/production/mongodb-uri`
- `/caresync/production/jwt-private-key`
- `/caresync/production/jwt-public-key`
- `/caresync/production/waba-access-token`
- `/caresync/production/abdm-client-secret`
- `/caresync/production/encryption-key`
- `/caresync/production/sms-api-key`
