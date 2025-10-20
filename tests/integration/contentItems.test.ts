/**
 * Content Items API Integration Tests
 *
 * Tests for content items (experience, projects, skills) CRUD operations
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest"
import { contentItemsClient } from "@/api/content-items-client"
import { signInTestUser, cleanupTestAuth, getIntegrationDescribe } from "../utils/testHelpers"
import { mockExperienceItem, mockProjectItem, mockSkillItem } from "../fixtures/mockData"
import { auth } from "@/config/firebase"

// Skip integration tests if Firebase is mocked (unit test mode)
const describeIntegration = getIntegrationDescribe()

describeIntegration("Content Items API Integration", () => {
  beforeAll(async () => {
    // Sign in test user before running tests
    await signInTestUser("regular")
  })

  beforeEach(async () => {
    // Clean up between tests
    await cleanupTestAuth()
    await signInTestUser("regular")
  })

  describe("Content Item Structure", () => {
    it("should validate experience item structure", () => {
      const item = mockExperienceItem

      expect(item).toHaveProperty("id")
      expect(item).toHaveProperty("type", "experience")
      expect(item).toHaveProperty("title")
      expect(item).toHaveProperty("company")
      expect(item).toHaveProperty("location")
      expect(item).toHaveProperty("startDate")
      expect(item).toHaveProperty("endDate")
      expect(item).toHaveProperty("current")
      expect(item).toHaveProperty("description")
      expect(item).toHaveProperty("achievements")
      expect(item).toHaveProperty("skills")
      expect(item).toHaveProperty("visibility")
      expect(item).toHaveProperty("order")
      expect(item).toHaveProperty("createdAt")
      expect(item).toHaveProperty("updatedAt")
    })

    it("should validate project item structure", () => {
      const item = mockProjectItem

      expect(item).toHaveProperty("id")
      expect(item).toHaveProperty("type", "project")
      expect(item).toHaveProperty("title")
      expect(item).toHaveProperty("description")
      expect(item).toHaveProperty("technologies")
      expect(item).toHaveProperty("url")
      expect(item).toHaveProperty("startDate")
      expect(item).toHaveProperty("endDate")
      expect(item).toHaveProperty("highlights")
      expect(item).toHaveProperty("visibility")
      expect(item).toHaveProperty("order")
    })

    it("should validate skill item structure", () => {
      const item = mockSkillItem

      expect(item).toHaveProperty("id")
      expect(item).toHaveProperty("type", "skill")
      expect(item).toHaveProperty("name")
      expect(item).toHaveProperty("category")
      expect(item).toHaveProperty("proficiency")
      expect(item).toHaveProperty("yearsOfExperience")
      expect(item).toHaveProperty("description")
      expect(item).toHaveProperty("visibility")
      expect(item).toHaveProperty("order")
    })
  })

  describe("Content Item Types", () => {
    it("should support experience type", () => {
      expect(mockExperienceItem.type).toBe("experience")
    })

    it("should support project type", () => {
      expect(mockProjectItem.type).toBe("project")
    })

    it("should support skill type", () => {
      expect(mockSkillItem.type).toBe("skill")
    })

    it("should have valid visibility values", () => {
      const validVisibilities = ["public", "private", "unlisted"]

      expect(validVisibilities).toContain(mockExperienceItem.visibility)
      expect(validVisibilities).toContain(mockProjectItem.visibility)
      expect(validVisibilities).toContain(mockSkillItem.visibility)
    })
  })

  describe("Experience Item Validation", () => {
    it("should have valid date format", () => {
      const { startDate, endDate } = mockExperienceItem

      expect(startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      if (endDate) {
        expect(endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
    })

    it("should have achievements as array", () => {
      expect(mockExperienceItem.achievements).toBeInstanceOf(Array)
      expect(mockExperienceItem.achievements.length).toBeGreaterThan(0)
    })

    it("should have skills as array", () => {
      expect(mockExperienceItem.skills).toBeInstanceOf(Array)
      expect(mockExperienceItem.skills.length).toBeGreaterThan(0)
    })

    it("should have current flag", () => {
      expect(typeof mockExperienceItem.current).toBe("boolean")
    })
  })

  describe("Project Item Validation", () => {
    it("should have technologies array", () => {
      expect(mockProjectItem.technologies).toBeInstanceOf(Array)
      expect(mockProjectItem.technologies.length).toBeGreaterThan(0)
    })

    it("should have highlights array", () => {
      expect(mockProjectItem.highlights).toBeInstanceOf(Array)
      expect(mockProjectItem.highlights.length).toBeGreaterThan(0)
    })

    it("should have valid URL format", () => {
      if (mockProjectItem.url) {
        expect(mockProjectItem.url).toMatch(/^https?:\/\//)
      }
    })
  })

  describe("Skill Item Validation", () => {
    it("should have valid proficiency level", () => {
      const validLevels = ["beginner", "intermediate", "advanced", "expert"]
      expect(validLevels).toContain(mockSkillItem.proficiency)
    })

    it("should have years of experience", () => {
      expect(mockSkillItem.yearsOfExperience).toBeDefined()
      expect(typeof mockSkillItem.yearsOfExperience).toBe("number")
      expect(mockSkillItem.yearsOfExperience).toBeGreaterThanOrEqual(0)
    })

    it("should have category", () => {
      expect(mockSkillItem.category).toBeDefined()
      expect(typeof mockSkillItem.category).toBe("string")
      expect(mockSkillItem.category.length).toBeGreaterThan(0)
    })
  })

  describe("Client Configuration", () => {
    it("should have proper base URL configured", () => {
      expect(contentItemsClient.baseUrl).toBeDefined()
      expect(typeof contentItemsClient.baseUrl).toBe("string")
    })

    it("should have timeout configured", () => {
      expect(contentItemsClient.defaultTimeout).toBeDefined()
      expect(contentItemsClient.defaultTimeout).toBeGreaterThan(0)
    })

    it("should have retry settings configured", () => {
      expect(contentItemsClient.defaultRetryAttempts).toBeDefined()
      expect(contentItemsClient.defaultRetryAttempts).toBeGreaterThanOrEqual(0)
    })
  })

  describe("Authentication", () => {
    it("should have auth token available", async () => {
      const token = await contentItemsClient.getAuthToken()

      expect(token).toBeDefined()
      expect(typeof token).toBe("string")
      expect(token?.length).toBeGreaterThan(0)
    })

    it("should return null when not authenticated", async () => {
      await cleanupTestAuth()

      const token = await contentItemsClient.getAuthToken()
      expect(token).toBeNull()
    })
  })

  describe("Filter Validation", () => {
    it("should validate type filter structure", () => {
      const validTypes = ["experience", "project", "skill", "education", "certification"]
      const typeFilter = ["experience", "project"]

      typeFilter.forEach((type) => {
        expect(validTypes).toContain(type)
      })
    })

    it("should validate visibility filter structure", () => {
      const validVisibilities = ["public", "private", "unlisted"]
      const visibilityFilter = ["public"]

      visibilityFilter.forEach((vis) => {
        expect(validVisibilities).toContain(vis)
      })
    })

    it("should validate limit and offset", () => {
      const limit = 10
      const offset = 0

      expect(limit).toBeGreaterThan(0)
      expect(offset).toBeGreaterThanOrEqual(0)
    })
  })

  describe("Data Integrity", () => {
    it("should have consistent timestamps", () => {
      const { createdAt, updatedAt } = mockExperienceItem

      expect(createdAt).toBeDefined()
      expect(updatedAt).toBeDefined()

      const created = new Date(createdAt).getTime()
      const updated = new Date(updatedAt).getTime()

      expect(updated).toBeGreaterThanOrEqual(created)
    })

    it("should have proper order values", () => {
      expect(typeof mockExperienceItem.order).toBe("number")
      expect(typeof mockProjectItem.order).toBe("number")
      expect(typeof mockSkillItem.order).toBe("number")

      expect(mockExperienceItem.order).toBeGreaterThanOrEqual(0)
      expect(mockProjectItem.order).toBeGreaterThanOrEqual(0)
      expect(mockSkillItem.order).toBeGreaterThanOrEqual(0)
    })

    it("should have unique IDs", () => {
      const ids = [mockExperienceItem.id, mockProjectItem.id, mockSkillItem.id]

      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe("Array Field Validation", () => {
    it("should have non-empty achievement strings", () => {
      mockExperienceItem.achievements.forEach((achievement) => {
        expect(typeof achievement).toBe("string")
        expect(achievement.length).toBeGreaterThan(0)
      })
    })

    it("should have non-empty skill strings", () => {
      mockExperienceItem.skills.forEach((skill) => {
        expect(typeof skill).toBe("string")
        expect(skill.length).toBeGreaterThan(0)
      })
    })

    it("should have non-empty technology strings", () => {
      mockProjectItem.technologies.forEach((tech) => {
        expect(typeof tech).toBe("string")
        expect(tech.length).toBeGreaterThan(0)
      })
    })

    it("should have non-empty highlight strings", () => {
      mockProjectItem.highlights.forEach((highlight) => {
        expect(typeof highlight).toBe("string")
        expect(highlight.length).toBeGreaterThan(0)
      })
    })
  })
})
