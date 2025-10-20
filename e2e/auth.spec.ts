import { test, expect } from "@playwright/test"

/**
 * Authentication E2E Tests
 *
 * Tests critical authentication workflows including login, logout,
 * protected route access, and session persistence.
 */

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should display login page for unauthenticated users", async ({ page }) => {
    // Navigate to a protected route
    await page.goto("/dashboard")

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText(/sign in/i)).toBeVisible()
  })

  test("should show authentication modal", async ({ page }) => {
    // Check if auth icon/button exists
    const authButton = page.getByRole("button", { name: /sign in|auth/i }).first()

    if (await authButton.isVisible()) {
      await authButton.click()

      // Wait for modal to appear
      await expect(page.getByText(/authentication|sign in with google/i)).toBeVisible()
    }
  })

  test("should persist authentication state", async ({ page, context }) => {
    // This test requires actual authentication which needs Google OAuth
    // Skip in CI/automated environments
    test.skip(!!process.env.CI, "Requires interactive Google OAuth")

    await page.goto("/login")

    // If already logged in, skip
    const isLoggedIn = await page.locator('text="Dashboard"').isVisible().catch(() => false)

    if (!isLoggedIn) {
      test.skip(true, "Requires manual login for this test")
    }

    // After login, navigate to dashboard
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/dashboard/)

    // Reload page - should stay authenticated
    await page.reload()
    await expect(page).toHaveURL(/\/dashboard/)

    // Open new tab - should be authenticated
    const newPage = await context.newPage()
    await newPage.goto("/dashboard")
    await expect(newPage).toHaveURL(/\/dashboard/)
    await newPage.close()
  })

  test("should protect editor-only routes", async ({ page }) => {
    // Navigate to editor-only route (e.g., AI Prompts)
    await page.goto("/ai-prompts")

    // Should redirect to login or unauthorized
    const url = page.url()
    expect(url).toMatch(/\/(login|unauthorized)/)
  })
})
