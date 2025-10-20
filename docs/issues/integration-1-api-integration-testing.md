# INTEGRATION-1 — API Integration Testing

> **Context**: See [CLAUDE.md](../../CLAUDE.md) for project overview and testing patterns
> **Architecture**: Comprehensive testing of frontend-backend integration

---

## Issue Metadata

```yaml
Title: INTEGRATION-1 — API Integration Testing
Labels: priority-p1, repository-frontend, type-testing, status-todo
Assignee: Worker B
Priority: P1-High
Estimated Effort: 8-12 hours
Repository: job-finder-FE
```

---

## Summary

**Problem**: After migrating to the new job-finder-BE backend, all API integrations between the frontend and backend need comprehensive testing to ensure reliability, proper error handling, and correct functionality across all endpoints and scenarios.

**Goal**: Create and execute a complete test suite covering all API endpoints, authentication flows, error scenarios, rate limiting, and end-to-end user workflows.

**Impact**: Ensures the frontend reliably integrates with the backend, catches bugs before production, and validates the complete migration to job-finder-BE is successful.

---

## Architecture References

> **📚 Read these docs first for context:**

- **[CLAUDE.md](../../CLAUDE.md)** - API patterns, testing approaches
- **[BACKEND_MIGRATION_PLAN.md](../architecture/BACKEND_MIGRATION_PLAN.md)** - Backend API structure
- **[SYSTEM_ARCHITECTURE.md](../architecture/SYSTEM_ARCHITECTURE.md)** - Full system integration

**Key concepts to understand**:
- **API Endpoints**: All Firebase Functions in job-finder-BE
- **Authentication**: Firebase Auth token validation
- **Error Handling**: Network errors, validation errors, auth errors
- **Rate Limiting**: Backend may enforce rate limits
- **Real-time Data**: Firestore listener integration

---

## Tasks

### Phase 1: Test Infrastructure Setup
1. **Set up integration test framework**
   - What: Configure Vitest/Jest for integration tests
   - Where: `tests/integration/` directory (create)
   - Why: Need dedicated test environment for API calls
   - Test: Test framework runs successfully

2. **Create test utilities**
   - What: Helper functions for auth, API calls, test data
   - Where: `tests/utils/testHelpers.ts` (create)
   - Why: Reusable testing utilities
   - Test: Utilities work across multiple test files

### Phase 2: Endpoint Testing
3. **Test manageGenerator endpoint**
   - What: Test document generation (resume, cover letter)
   - Where: `tests/integration/documentGeneration.test.ts` (create)
   - Why: Critical user-facing functionality
   - Test: All generation scenarios pass

4. **Test manageContentItems endpoint**
   - What: Test CRUD operations for content items
   - Where: `tests/integration/contentItems.test.ts` (create)
   - Why: Core content management functionality
   - Test: All CRUD operations work correctly

5. **Test authentication flows**
   - What: Test login, logout, token refresh, session persistence
   - Where: `tests/integration/authentication.test.ts` (create)
   - Why: Security foundation of the application
   - Test: All auth scenarios work as expected

### Phase 3: Error Handling & Edge Cases
6. **Test error scenarios**
   - What: Network errors, 4xx/5xx responses, validation errors
   - Where: Add error cases to existing test files
   - Why: Ensure graceful error handling
   - Test: All error scenarios handled properly

7. **Test rate limiting**
   - What: Verify rate limit responses and UI handling
   - Where: `tests/integration/rateLimiting.test.ts` (create)
   - Why: Prevent abuse and handle backend limits
   - Test: Rate limits respected, UI shows appropriate messages

### Phase 4: End-to-End Testing
8. **Create E2E test suite**
   - What: Complete user workflows with Playwright
   - Where: `tests/e2e/` directory (create)
   - Why: Validate full user journeys
   - Test: Critical paths work end-to-end

---

## Technical Details

### Files to Create

```
CREATE:
- tests/integration/documentGeneration.test.ts - Document API tests
- tests/integration/contentItems.test.ts - Content management tests
- tests/integration/authentication.test.ts - Auth flow tests
- tests/integration/rateLimiting.test.ts - Rate limit tests
- tests/integration/firestore.test.ts - Firestore integration tests
- tests/e2e/jobApplicationWorkflow.spec.ts - E2E job workflow
- tests/e2e/documentGenerationWorkflow.spec.ts - E2E document flow
- tests/utils/testHelpers.ts - Shared test utilities
- tests/utils/mockData.ts - Test data fixtures
- tests/setup.ts - Test environment setup

MODIFY:
- package.json - Add test scripts and dependencies
- vite.config.ts - Add test configuration
- .env.test - Test environment variables

REFERENCE:
- src/config/api.ts - API endpoints to test
- src/services/ - Service layer being tested
```

### Key Implementation Notes

**Test Helper Utilities**:
```typescript
// tests/utils/testHelpers.ts
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '@/config/firebase'

export async function getTestAuthToken(): Promise<string> {
  const email = process.env.VITE_TEST_USER_EMAIL
  const password = process.env.VITE_TEST_USER_PASSWORD

  if (!email || !password) {
    throw new Error('Test credentials not configured')
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return await userCredential.user.getIdToken()
}

export async function cleanupTestAuth() {
  await signOut(auth)
}

export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getTestAuthToken()

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export const testData = {
  validJobMatch: {
    jobTitle: 'Test Software Engineer',
    company: 'Test Company',
    matchScore: 85,
    url: 'https://example.com/job',
    summary: 'Test job description',
  },
  validContentItem: {
    type: 'experience',
    title: 'Test Experience',
    description: 'Test description',
    skills: ['JavaScript', 'React'],
  },
}
```

**Document Generation Integration Test**:
```typescript
// tests/integration/documentGeneration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { api } from '@/config/api'
import { getTestAuthToken, cleanupTestAuth, makeAuthenticatedRequest } from '../utils/testHelpers'

describe('Document Generation API', () => {
  beforeAll(async () => {
    // Set up test environment
    await getTestAuthToken()
  })

  afterAll(async () => {
    await cleanupTestAuth()
  })

  it('should generate a resume successfully', async () => {
    const response = await makeAuthenticatedRequest(
      api.functions.manageGenerator,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'generate',
          documentType: 'resume',
          jobMatchId: 'test-job-match-id',
          contentItems: ['item-1', 'item-2'],
          options: {
            tone: 'professional',
            length: 'standard',
          },
        }),
      }
    )

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('success', true)
    expect(data).toHaveProperty('documentId')
    expect(data).toHaveProperty('content')
  })

  it('should generate a cover letter successfully', async () => {
    const response = await makeAuthenticatedRequest(
      api.functions.manageGenerator,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'generate',
          documentType: 'coverLetter',
          jobMatchId: 'test-job-match-id',
          contentItems: ['item-1'],
          options: {
            tone: 'enthusiastic',
            length: 'concise',
          },
        }),
      }
    )

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })

  it('should reject unauthenticated requests', async () => {
    const response = await fetch(api.functions.manageGenerator, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate' }),
    })

    expect(response.status).toBe(401)
  })

  it('should validate required fields', async () => {
    const response = await makeAuthenticatedRequest(
      api.functions.manageGenerator,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'generate',
          // Missing required fields
        }),
      }
    )

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })

  it('should handle backend errors gracefully', async () => {
    const response = await makeAuthenticatedRequest(
      api.functions.manageGenerator,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'generate',
          documentType: 'invalid-type', // Invalid type to trigger error
          jobMatchId: 'test',
          contentItems: [],
        }),
      }
    )

    expect([400, 500]).toContain(response.status)
  })
})
```

**E2E Workflow Test**:
```typescript
// tests/e2e/jobApplicationWorkflow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Job Application Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto('/login')
    await page.fill('input[type="email"]', process.env.VITE_TEST_USER_EMAIL!)
    await page.fill('input[type="password"]', process.env.VITE_TEST_USER_PASSWORD!)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should view job matches and generate resume', async ({ page }) => {
    // Navigate to job applications
    await page.goto('/job-applications')

    // Wait for job matches to load
    await page.waitForSelector('[data-testid="job-match-card"]')

    // Verify job matches are displayed
    const jobCards = await page.locator('[data-testid="job-match-card"]')
    expect(await jobCards.count()).toBeGreaterThan(0)

    // Click on first job match
    await jobCards.first().click()

    // Navigate to document builder
    await page.click('text=Generate Resume')
    await page.waitForURL(/\/document-builder/)

    // Fill out generation form
    await page.selectOption('select[name="documentType"]', 'resume')
    await page.selectOption('select[name="tone"]', 'professional')
    await page.click('button:has-text("Generate Document")')

    // Wait for generation to complete
    await page.waitForSelector('[data-testid="document-preview"]', {
      timeout: 30000, // Generation can take time
    })

    // Verify document preview displays
    const preview = await page.locator('[data-testid="document-preview"]')
    expect(await preview.isVisible()).toBe(true)

    // Download document
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Download")')
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/resume.*\.pdf/)
  })

  test('should filter and sort job matches', async ({ page }) => {
    await page.goto('/job-applications')

    // Apply status filter
    await page.click('button:has-text("Filter")')
    await page.check('input[value="applied"]')

    // Verify filtered results
    await page.waitForTimeout(500) // Wait for filter to apply
    const cards = await page.locator('[data-testid="job-match-card"]')
    expect(await cards.count()).toBeGreaterThan(0)

    // Change sort order
    await page.selectOption('select[name="sort"]', 'matchScore')

    // Verify sorting applied
    const firstCard = cards.first()
    const firstScore = await firstCard.getAttribute('data-match-score')
    expect(parseInt(firstScore!)).toBeGreaterThan(70)
  })
})
```

**Integration Points**:
- **All API Endpoints**: manageGenerator, manageContentItems, handleContactForm
- **Firestore**: Real-time listeners and queries
- **Authentication**: Token validation and refresh
- **Error Handling**: Network failures, validation errors, server errors

---

## Acceptance Criteria

- [ ] **All endpoint tests pass**: 100% pass rate for API endpoint tests
- [ ] **Authentication tests pass**: Login, logout, token refresh work correctly
- [ ] **Error handling validated**: All error scenarios handled gracefully
- [ ] **Rate limiting tested**: Rate limits respected and UI responds appropriately
- [ ] **E2E tests pass**: Critical user workflows work end-to-end
- [ ] **Firestore integration works**: Real-time updates and queries function correctly
- [ ] **Test coverage > 80%**: Integration tests cover majority of API interactions
- [ ] **CI integration**: Tests run automatically on PRs
- [ ] **Performance validated**: API calls complete within acceptable timeframes
- [ ] **Documentation complete**: Test setup and execution documented

---

## Testing

### Test Commands

```bash
# Run all integration tests
npm run test:integration

# Run specific test file
npm run test:integration -- documentGeneration.test.ts

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode (see browser)
npm run test:e2e -- --headed

# Run all tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Manual Testing

```bash
# Step 1: Set up test environment
cp .env.example .env.test
# Add test user credentials to .env.test

# Step 2: Run integration tests
npm run test:integration
# All tests should pass

# Step 3: Run specific endpoint tests
npm run test:integration -- documentGeneration.test.ts
npm run test:integration -- contentItems.test.ts
npm run test:integration -- authentication.test.ts

# Step 4: Run E2E tests
npm run test:e2e
# Verify browser automation works
# All workflows should complete successfully

# Step 5: Test error scenarios manually
# 1. Disconnect internet
# 2. Try to generate document
# 3. Verify error message displays
# 4. Reconnect and verify retry works

# Step 6: Test rate limiting (if applicable)
# 1. Make rapid API calls
# 2. Verify rate limit response (429)
# 3. Verify UI shows rate limit message
# 4. Wait and verify requests resume

# Step 7: Performance testing
# Run tests and check response times:
# - Document generation: < 10 seconds
# - Content CRUD: < 1 second
# - Auth operations: < 2 seconds
```

---

## Commit Message Template

```
test(integration): add comprehensive API integration testing

Create complete integration and E2E test suite covering all API
endpoints, authentication flows, error handling, and critical user
workflows. Ensures reliable frontend-backend integration.

Key changes:
- Add integration tests for all API endpoints
- Create E2E tests for critical user workflows
- Implement test utilities and helpers
- Add error scenario and rate limit testing
- Configure Playwright for E2E testing
- Set up CI integration for automated testing
- Add test coverage reporting

Testing:
- All integration tests pass (100% pass rate)
- E2E tests validate complete workflows
- Error scenarios handled correctly
- Rate limiting tested and validated
- Test coverage > 80%

Closes #10
```

---

## Related Issues

- **Depends on**: CONFIG-1 (API Configuration for job-finder-BE)
- **Depends on**: AUTH-1 (Authentication System)
- **Depends on**: FEATURE-1 (Job Application Interface)
- **Depends on**: FEATURE-2 (Document Builder Interface)
- **Related**: job-finder-BE deployment and testing

---

## Resources

### Documentation
- **Vitest**: https://vitest.dev/
- **Playwright**: https://playwright.dev/
- **Firebase Testing**: https://firebase.google.com/docs/rules/unit-tests
- **Integration Testing Best Practices**: https://kentcdodds.com/blog/write-tests

### External References
- **Testing Library**: https://testing-library.com/
- **API Testing**: https://www.freecodecamp.org/news/how-to-test-your-api/

---

## Success Metrics

**How we'll measure success**:
- **Test Pass Rate**: 100% of integration tests pass
- **Test Coverage**: > 80% coverage of API interactions
- **E2E Success**: All critical workflows pass
- **CI Reliability**: < 1% flaky test rate
- **Test Speed**: Integration suite completes in < 5 minutes

---

## Notes

**Questions? Need clarification?**
- Comment on this issue with specific questions
- Tag @PM for guidance
- Reference BACKEND_MIGRATION_PLAN.md for API details

**Implementation Tips**:
- Use test user accounts, not production data
- Mock external dependencies when appropriate
- Clean up test data after each test run
- Use parallel test execution for speed
- Add retry logic for flaky network tests
- Document test environment setup clearly
- Consider visual regression testing for UI components
- Add performance benchmarks for API calls

**Testing Checklist**:
- [ ] All Firebase Functions endpoints tested
- [ ] Authentication flows validated
- [ ] Firestore queries and listeners tested
- [ ] Error scenarios covered
- [ ] Rate limiting tested
- [ ] E2E workflows validated
- [ ] Performance benchmarks established
- [ ] CI integration configured
- [ ] Test documentation complete

---

**Created**: 2025-10-19
**Created By**: PM
**Last Updated**: 2025-10-19
**Status**: Todo
