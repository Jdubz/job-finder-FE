# FA-2 — Cover Letter Generation Verification

- **Status**: Todo
- **Owner**: Worker B
- **Priority**: P0 (Critical once staging is live)
- **Labels**: priority-p0, repository-frontend, type-verification, status-todo

## What This Issue Covers
Re-validate the Document Builder cover letter flow using only assets in `job-finder-FE`. You will capture evidence that local previews, staging builds, and production preview builds all render letters correctly and talk to the migrated backend endpoints.

## Tasks
1. **Map the Flow**
   - Review `src/pages/document-builder/DocumentBuilderPage.tsx`, `src/components/document-builder/CoverLetterForm.tsx`, and related hooks under `src/hooks/document-builder/` to understand required environment variables and API calls.
   - Document the request payloads generated in `src/api/generator.ts` so that discrepancies can be reported without backend access.
   - Record findings in a new “Implementation Notes” section appended to this issue file.
2. **Prepare Local Fixtures**
   - In `src/mocks/` (create if missing), add a JSON fixture representing a typical cover letter request/response pair. Use it to configure MSW or fetch mocks inside `src/setupTests.ts` so unit tests can exercise the flow without hitting real services.
   - Extend `src/tests/document-builder/coverLetter.test.tsx` (create path if missing) to assert that form submission renders the preview modal and surfaces validation errors when fields are empty.
3. **Run Local Verification**
   - Install dependencies (`npm install`) and start the dev server with `.env.development`.
   - Capture screenshots of the preview modal, generated Markdown/HTML output, and network logs from the browser dev tools. Save references to the image file names in this issue description (actual images can live under `docs/assets/cover-letter/`).
   - Update `.env.template` with any new variables required by the flow (e.g., generator endpoint, feature flags) so new contributors can replicate the run.
4. **Stage and Production Preview Checks**
   - Build the app (`npm run build`) and run `npm run preview` using `.env.staging` and `.env.production` respectively. Document any differences in behavior, CSS, or API responses in a comparison table added to this file.
   - If an endpoint fails, log the failing URL, status, and payload. Keep everything reproducible from the frontend side (no backend edits here).
5. **Documentation Updates**
   - Create `docs/features/cover-letter.md` summarizing how to trigger the flow, required environment variables, and troubleshooting steps.
   - Add a “Cover Letter Verification” subsection under “Testing” in `README.md` pointing to the new doc and the test commands.
   - Append a dated verification note to `COMPLETED.md` referencing the evidence you captured.

## Acceptance Criteria
- [ ] Cover letter flow executes locally with mock data; screenshots or asset references recorded in this issue.
- [ ] Staging and production preview builds tested; comparison table with outcomes committed here.
- [ ] `.env.template` updated with any additional generator-related keys.
- [ ] Automated tests covering form validation and preview rendering exist and pass.
- [ ] `docs/features/cover-letter.md`, `README.md`, and `COMPLETED.md` updated accordingly.
- [ ] `npm run lint`, `npm run test`, and `npm run build` succeed.

## Test Commands
- `npm run test -- cover-letter`
- `npm run lint`
- `npm run build`
- `npm run preview`

## Useful Files
- `src/pages/document-builder/DocumentBuilderPage.tsx`
- `src/api/generator.ts`
- `src/tests/document-builder/`
- `.env.*`
- `docs/features/`
