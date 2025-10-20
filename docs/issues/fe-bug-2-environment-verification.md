# FE-BUG-2 — Environment Verification

- **Status**: Todo
- **Owner**: Worker B
- **Priority**: P0 (Critical)
- **Labels**: priority-p0, repository-frontend, type-bug, status-todo

## Context
All environment-specific configuration for the frontend lives inside this repository. Environment variables are defined in `.env.template`, `.env.development`, `.env.staging`, and `.env.production`. API clients consume URLs from `src/config/api.ts`, while Firebase SDK configuration is read from `src/config/firebase.ts`. Recent migrations changed backend endpoints and hosting routes, so we must validate every environment without assuming knowledge of other repositories.

## Problem Statement
Developers have reported that certain features (job queue actions, document builder, generator history) fail depending on which environment the app targets. The working theory is that the `.env.*` files no longer match what the code expects. We need a comprehensive verification pass that can be executed using only the code and documentation present in `job-finder-FE`.

## What “Done” Looks Like
1. **Environment Matrix**: A markdown table committed to `docs/issues/fe-bug-2-environment-verification.md` listing each API client under `src/api/`, the environment variables it requires, and the observed status (✅/⚠️) for:
   - Local development using `npm run dev` with `.env.development`.
   - Preview mode (`npm run preview`) simulating staging values from `.env.staging`.
   - Production preview using `.env.production` values (no live deploy required — use `npm run build && npm run preview`).
2. **Template Accuracy**: `.env.template` is updated so a first-time contributor can copy it, fill in secrets, and have working defaults for localhost.
3. **Documentation**: Add a new page `docs/environment-troubleshooting.md` that explains how to switch environments, common failure symptoms, and how to regenerate Firebase web app credentials. Cross-link this page from the “Environment Variables” section in `README.md`.
4. **Automation Help**: Introduce a lightweight script `scripts/validate-env.ts` (or similar) that checks required variables are present for the current `NODE_ENV`. Wire it into `package.json` under `"lint"` or a dedicated `"check:env"` script, and document usage.
5. **Tracking Regressions**: Leave issue comments summarizing any environment mismatches. If fixes require backend work, capture the failing request/response payload so someone without backend access understands the dependency.

## Suggested Implementation Steps
1. **Audit Configuration Files**
   - Review `src/config/api.ts` and note every `VITE_*` variable consumed.
   - Review `firebase.json` and Hosting rewrites to understand expected routes.
   - Note any hard-coded fallbacks inside components or API clients.
2. **Exercise Critical Flows** (all doable from this repo):
   - Job submission via `/src/pages/job-finder/JobFinderPage.tsx`.
   - Document generation via `/src/pages/document-builder/DocumentBuilderPage.tsx`.
   - Queue management via `/src/pages/queue-management/QueueManagementPage.tsx`.
   - Auth indicator (header icon) to confirm Firebase Auth works with provided config.
   Use browser dev tools or the console to capture network errors and include them in the matrix.
3. **Update Templates and Docs**
   - Align `.env.template` with the variables actually consumed.
   - Ensure `.env.staging` and `.env.production` mention placeholders for function URLs and hosting origins, even if values are redacted.
   - Document setup flow in `docs/environment-troubleshooting.md` (include commands such as `npm install`, `npm run dev`, `npm run preview`).
4. **Add Env Validation Script**
   - Implement a Node or TypeScript script under `scripts/` that reads `.env` files (use `dotenv`) and lists missing variables.
   - Hook into `package.json` so contributors can run `npm run check:env` before booting the app.
5. **Record Findings**
   - Update the “Environment Matrix” section in this issue file with your results.
   - Attach screenshots or console logs if possible (for future debugging).

## Acceptance Criteria
- [ ] Environment matrix table populated with pass/fail for development, staging-preview, and production-preview modes.
- [ ] `.env.template` matches all required `VITE_*` variables used in the codebase.
- [ ] `docs/environment-troubleshooting.md` created and linked from `README.md`.
- [ ] New `npm run check:env` (or equivalent) script validates required env vars.
- [ ] `npm run lint` and `npm run test` pass after your changes.

## Test Commands
- `npm run check:env`
- `npm run lint`
- `npm run test`
- `npm run build && npm run preview`

## Useful References Inside This Repo
- `src/config/api.ts` — list of environment-driven base URLs.
- `src/api/` — the clients that rely on those URLs.
- `src/config/firebase.ts` — Firebase web app configuration surface.
- `README.md` → “Environment Variables” section.
- `.env.template`, `.env.development`, `.env.staging`, `.env.production` — current env files.
