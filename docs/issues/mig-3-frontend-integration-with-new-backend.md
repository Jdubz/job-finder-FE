# MIG-3 — Frontend Integration with job-finder-BE

- **Status**: Todo
- **Owner**: Worker B
- **Priority**: P1 (High Impact)
- **Labels**: priority-p1, repository-frontend, type-migration, status-todo

## What This Issue Covers

Replace every legacy Portfolio API dependency with the new `job-finder-BE` endpoints, refresh the shared types dependency, and prove the frontend works against staging using only assets located in `job-finder-FE`.

## Tasks

1. **Inventory Existing Calls**
   - Run `npm run lint` to surface type warnings, then search for `portfolio`, `legacy`, or hard-coded `cloudfunctions.net` URLs in `src/`.
   - Capture findings in a table appended to this issue with columns: component/hook, current endpoint, replacement endpoint, status.
   - Pay special attention to `src/api/`, `src/lib/request/`, and any `fetch` calls inside React components.
2. **Update Environment Configuration**
   - Align `.env.template`, `.env.development`, `.env.staging`, and `.env.production` with the new backend base URLs. Use the patterns defined in `src/config/api.ts` to avoid hard-coded values.
   - Document each environment variable’s purpose in `docs/environment/backend-integration.md` (create directory if missing) so contributors can update staging values without leaving this repo.
3. **Refresh Shared Types**
   - Update the `job-finder-shared-types` dependency via `npm install --save job-finder-shared-types@latest` (or use workspace reference) and ensure `tsconfig.json` path mappings remain valid.
   - Address TypeScript errors by adjusting imports in files like `src/types/` and `src/api/*`. Avoid `any`; prefer generated interfaces from the package.
   - Capture any mismatches between backend responses and the shared types in a “Schema Notes” section within this issue.
4. **Refactor API Clients**
   - Update `src/api/` modules to call the new Cloud Functions (likely `httpsCallable` usage). For HTTP endpoints, centralize base URLs in `src/config/api.ts` and ensure fetch wrappers handle auth tokens.
   - Add integration tests under `src/tests/api/` mocking the new endpoints to confirm payloads and error handling align.
   - Remove unused Portfolio-specific helpers or move them to `deprecated/` if temporarily needed.
5. **Verification Pass**
   - Build the app (`npm run build`) and run `npm run preview` with `.env.staging`. Manually exercise job submission, document builder, analytics dashboards, and queue management.
   - For each flow, record the endpoint invoked, HTTP method, status, and whether the UI behaved correctly. Summaries should live in a markdown table at the bottom of this issue.
6. **Documentation Cleanup**
   - Update `README.md` and `docs/ARCHITECTURE.md` to describe the new dependency on `job-finder-BE`, including links to `API.md` and any relevant setup steps.
   - Remove or rewrite sections referencing the Portfolio backend to avoid confusion.

## Acceptance Criteria

- [ ] Endpoint replacement table completed and committed in this issue.
- [ ] All API clients point to `job-finder-BE`; lint/build show no references to legacy Portfolio URLs.
- [ ] Shared types updated with zero `any` fallbacks and passing TypeScript build.
- [ ] Verification table populated with results from staging preview.
- [ ] `docs/environment/backend-integration.md`, `README.md`, and `docs/ARCHITECTURE.md` reflect the new architecture.
- [ ] `npm run lint`, `npm run test`, and `npm run build` succeed.

## Test Commands

- `npm run test -- api`
- `npm run lint`
- `npm run build`
- `npm run preview`

## Useful Files

- `src/config/api.ts`
- `src/api/`
- `src/tests/api/`
- `.env.*`
- `docs/ARCHITECTURE.md`
