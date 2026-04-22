# CI/CD Setup

This repo uses two GitHub Actions workflows for `SETUP-008`.

- `.github/workflows/test.yml`
- `.github/workflows/deploy.yml`

## Workflow behavior

- Pull requests targeting `main` or `develop` run lint, backend tests with a coverage gate, and `npm audit --audit-level=high`
- Pushes to `develop` run the same CI checks
- Pushes to `main` run a release quality gate and, if it passes, deploy production automatically
- Manual deployments are supported through `workflow_dispatch` with `staging` or `production`

## GitHub environments

Create these repository environments in GitHub:

- `staging`
- `production`

Use environment protection rules for `production` so deployments require the right reviewers if your process needs that.

## Required repository or environment secrets

### CI secrets

- `TEST_JWT_PRIVATE_KEY`
- `TEST_JWT_PUBLIC_KEY`
- `TEST_ENCRYPTION_KEY`
- `CODECOV_TOKEN` (optional but recommended)

### Deployment secrets

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `ECR_REGISTRY`
- `ECR_REPOSITORY` (optional, defaults to `caresync-api`)
- `WEB_BUCKET`
- `CLOUDFRONT_DIST_ID`
- `EC2_HOST`
- `EC2_SSH_KEY`
- `DEPLOY_USER` (optional, defaults to `ubuntu`)
- `DEPLOY_PATH` (optional, defaults to `/opt/caresync`)

## Required EC2 host state

The target host should already have:

- Docker Engine with the `docker compose` plugin
- AWS CLI configured with permission to pull from ECR
- An application directory at `/opt/caresync`
- A production `.env` file at `/opt/caresync/.env`

The workflow copies `infra/docker-compose.prod.yml` to the host and deploys the immutable API + worker images from ECR.

## Branch protection

Enable branch protection for `main` in GitHub settings:

- Require a pull request before merging
- Require status checks to pass before merging
- Add `Test & Lint / test` as a required status check
- Restrict direct pushes if your team policy requires it

This is the manual step that makes CI failures block merges.

## Release flow

1. Open a PR to `main`
2. GitHub Actions runs `Test & Lint`
3. After merge to `main`, GitHub Actions runs `Deploy`
4. The deploy workflow:
   - reruns lint, tests, coverage gate, and security audit
   - builds the frontend once and uploads it to S3
   - invalidates CloudFront
   - builds and pushes the API image to ECR
   - updates EC2 using `docker compose`

## Notes

- The deploy workflow is intentionally blocked by `npm audit --audit-level=high`
- The API image is built from `apps/api/Dockerfile` using the repo root as build context because this is a monorepo
- `infra/docker-compose.prod.yml` no longer installs dependencies on the server or mounts source code into production containers
