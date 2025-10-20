# FE-RECOVERY-4 — Codify Hosting & Secrets via Terraform

- **Status**: Todo
- **Owner**: Worker A
- **Priority**: P1 (High Impact)
- **Labels**: priority-p1, repository-frontend, type-infrastructure, status-todo

## Context

This repository already contains Firebase Hosting configuration (`firebase.json`, `.firebaserc`) and GitHub Actions workflows under `.github/workflows`. Deployments depend on manually managed service account JSON files and API tokens. There is no infrastructure-as-code to recreate hosting sites, Cloudflare DNS entries, or GitHub secrets from scratch. The goal is to capture all infrastructure definitions in this repo so that a new contributor with only the `job-finder-FE` project can provision staging and production reliably.

## Scope of Work (Repository Only)

1. **Terraform Project Skeleton**
   - Create `infrastructure/terraform/` inside this repo.
   - Include Terraform version pinning (`required_version`) and providers (`hashicorp/google`, `cloudflare`). Store provider credentials in environment variables or Terraform Cloud — do **not** commit secrets.
2. **Firebase Hosting Resources**
   - Model the hosting sites referenced in `.firebaserc`. Use data sources to read existing sites if you cannot create them from scratch, but document clearly how to import them.
   - Define Hosting channels (staging/production) and deploy roles for the GitHub Actions service account.
3. **Cloudflare DNS Records**
   - Capture the DNS records that point to Firebase Hosting. Even if actual values are redacted, create variables with descriptive names (e.g., `cloudflare_cname_staging`).
   - Include guidance for importing existing records using `terraform import`.
4. **Secrets & CI Integration**
   - Document how GitHub Actions should retrieve secrets. If you choose Google Secret Manager, create Terraform resources for secret containers but leave values empty.
   - Update `.github/workflows/deploy-*.yml` (or create new workflows) to run `terraform plan` on pull requests and gated `terraform apply` on merges.
5. **Documentation**
   - Author `docs/infrastructure/terraform-hosting.md` with step-by-step instructions: configuring credentials, running `terraform init/plan/apply`, importing existing resources, and rolling back changes.
   - Update `README.md` to highlight the Terraform workflow for new contributors.

## Assumptions You May Make

- Staging and production Firebase projects already exist. Provide import instructions rather than hard-creating them.
- Cloudflare zone ID can be passed in via Terraform variable; supply an example in a sample `terraform.tfvars.example` file.
- GitHub Secrets will be managed manually after Terraform provisions dependent infrastructure.

## Deliverables

- `infrastructure/terraform/main.tf` plus supporting files (`variables.tf`, `outputs.tf`, `versions.tf`, `terraform.tfvars.example`).
- Updated GitHub Actions workflow that executes `terraform fmt` and `terraform validate`. If full apply is not possible, at least ensure plan runs as a CI quality gate.
- `docs/infrastructure/terraform-hosting.md` describing:
  - Required environment variables.
  - How to import existing Firebase Hosting sites and Cloudflare records.
  - How to run plan/apply for staging vs production safely.
- `README.md` section linking to the new documentation.

## Acceptance Criteria

- [ ] Terraform project committed with clearly separated staging and production workspaces or work dirs.
- [ ] `terraform fmt` and `terraform validate` succeed locally and in CI.
- [ ] Terraform configuration models Firebase Hosting sites, channels, deploy service accounts, and Cloudflare DNS entries via variables or data sources.
- [ ] GitHub Actions workflow includes a Terraform validation step.
- [ ] Documentation explains provisioning, state management, and rollback using only files contained in this repo.

## Helpful Files in This Repo

- `.firebaserc` and `firebase.json` — current hosting setup.
- `.github/workflows/` — existing CI/CD definition.
- `docs/DEPLOYMENT_RUNBOOK.md` and `docs/GITHUB_SECRETS_SETUP.md` (if present) — current manual steps that need codifying.

## Suggested Commands

- `terraform init`
- `terraform fmt`
- `terraform validate`
- `npm run lint` (ensure Terraform steps integrate cleanly with current workflows)
