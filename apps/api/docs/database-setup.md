# Database Schema and Seed Setup

This ticket adds the core Mongoose model registry, deployment-safe index initialization, and seed scripts for reference data.

## Commands

```bash
npm run db:indexes -w apps/api
npm run seed -w apps/api
npm run db:plans -w apps/api
```

## What gets created

- Tenant-scoped operational models for users, patients, visits, prescriptions, bills, inventory, IPD admissions, audit logs, sequences, notifications, and services
- Global models for tenants, OTPs, medicine master, and diagnosis master
- Explicit registry-backed index verification for all required indexes

## Seed behavior

- `scripts/seed/medicines.seed.js` upserts at least `6000` medicine master rows
- `scripts/seed/diagnoses.seed.js` upserts at least `3500` diagnosis rows
- `scripts/seed/services.seed.js` provisions the default service catalog for every tenant
- New tenants also receive the default service catalog automatically through the `Tenant` post-save provisioning hook

## Query plan verification

- `scripts/tests/queryPlans.js` checks that patient text search and visit queue queries resolve with `IXSCAN`
- Run this against a real MongoDB instance after indexes and seeds have been applied

## Notes

- The medicine and diagnosis masters are generated deterministically from local seed generators so the bootstrap remains reproducible without external downloads
- `audit_logs.timestamp` and `otps.createdAt` use TTL indexes; MongoDB TTL cleanup is asynchronous and typically runs on a background schedule rather than immediately at expiry
