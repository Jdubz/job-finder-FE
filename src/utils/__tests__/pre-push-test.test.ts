/**
 * Temporary test to verify pre-push hook blocks failures
 * DELETE THIS FILE after verification
 */

import { describe, it, expect } from "vitest"

describe("Pre-push hook verification", () => {
  it("should fail to test pre-push blocking", () => {
    expect(true).toBe(false) // Intentionally failing test
  })
})
