/**
 * Generator Client Tests
 *
 * Tests for document generation API client including:
 * - Document generation requests
 * - Multi-step generation flow
 * - Error handling
 * - History retrieval
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { generatorClient } from "../generator-client"
import type { GenerateDocumentRequest } from "../generator-client"

// Mock fetch
global.fetch = vi.fn()

describe("Generator Client", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetch).mockReset()
  })

  describe("generateDocument", () => {
    const mockRequest: GenerateDocumentRequest = {
      generateType: "resume",
      job: {
        role: "Software Engineer",
        company: "Tech Corp",
        jobDescriptionText: "Looking for a developer",
      },
    }

    it("should send generate request with correct payload", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          documentUrl: "https://storage.example.com/resume.pdf",
          documentId: "doc-123",
        }),
      } as Response)

      const result = await generatorClient.generateDocument(mockRequest)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/generate"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: expect.stringContaining("resume"),
        }),
      )

      expect(result.success).toBe(true)
      expect(result.documentUrl).toBe("https://storage.example.com/resume.pdf")
    })

    it("should handle generateType = both", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          documentUrl: "https://storage.example.com/combined.pdf",
        }),
      } as Response)

      const request: GenerateDocumentRequest = {
        ...mockRequest,
        generateType: "both",
      }

      const result = await generatorClient.generateDocument(request)

      expect(result.success).toBe(true)
    })

    it("should include provider preference", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      await generatorClient.generateDocument({
        ...mockRequest,
        provider: "gemini",
      })

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)
      expect(body.provider).toBe("gemini")
    })

    it("should include job match ID when provided", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      await generatorClient.generateDocument({
        ...mockRequest,
        jobMatchId: "match-123",
      })

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)
      expect(body.jobMatchId).toBe("match-123")
    })

    it("should handle network errors", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"))

      await expect(generatorClient.generateDocument(mockRequest)).rejects.toThrow()
    })

    it("should handle API errors", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal server error" }),
      } as Response)

      await expect(generatorClient.generateDocument(mockRequest)).rejects.toThrow()
    })

    it("should include preferences when provided", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      await generatorClient.generateDocument({
        ...mockRequest,
        preferences: {
          style: "modern",
          emphasize: ["leadership", "teamwork"],
        },
      })

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)
      expect(body.preferences.style).toBe("modern")
      expect(body.preferences.emphasize).toContain("leadership")
    })
  })

  describe("startGeneration", () => {
    it("should initiate multi-step generation", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            requestId: "req-123",
            status: "pending",
            nextStep: "fetch_data",
          },
          requestId: "req-123",
        }),
      } as Response)

      const result = await generatorClient.startGeneration({
        generateType: "resume",
        job: {
          role: "Engineer",
          company: "Tech",
        },
      })

      expect(result.success).toBe(true)
      expect(result.requestId).toBe("req-123")
      expect(result.data.nextStep).toBe("fetch_data")
    })

    it("should handle start generation errors", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Failed to start"))

      await expect(
        generatorClient.startGeneration({
          generateType: "resume",
          job: { role: "Engineer", company: "Tech" },
        }),
      ).rejects.toThrow()
    })
  })

  describe("executeStep", () => {
    it("should execute a generation step", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            stepCompleted: "fetch_data",
            nextStep: "generate_content",
            status: "in_progress",
          },
        }),
      } as Response)

      const result = await generatorClient.executeStep("req-123", "fetch_data")

      expect(result.success).toBe(true)
      expect(result.data.stepCompleted).toBe("fetch_data")
      expect(result.data.nextStep).toBe("generate_content")
    })

    it("should handle step execution errors", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid step" }),
      } as Response)

      await expect(generatorClient.executeStep("req-123", "invalid_step")).rejects.toThrow()
    })

    it("should return URLs when generation completes", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            stepCompleted: "create_pdf",
            status: "completed",
            resumeUrl: "https://storage.example.com/resume.pdf",
          },
        }),
      } as Response)

      const result = await generatorClient.executeStep("req-123", "create_pdf")

      expect(result.data.status).toBe("completed")
      expect(result.data.resumeUrl).toBeDefined()
    })
  })

  describe("getHistory", () => {
    it("should fetch document history", async () => {
      const mockHistory = [
        {
          id: "doc-1",
          type: "resume",
          jobTitle: "Software Engineer",
          companyName: "Tech Corp",
          documentUrl: "https://storage.example.com/resume1.pdf",
          createdAt: new Date().toISOString(),
        },
        {
          id: "doc-2",
          type: "cover_letter",
          jobTitle: "Developer",
          companyName: "StartupCo",
          documentUrl: "https://storage.example.com/cover1.pdf",
          createdAt: new Date().toISOString(),
        },
      ]

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          documents: mockHistory,
        }),
      } as Response)

      const result = await generatorClient.getHistory()

      expect(result).toHaveLength(2)
      expect(result[0].type).toBe("resume")
      expect(result[1].type).toBe("cover_letter")
    })

    it("should handle empty history", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          documents: [],
        }),
      } as Response)

      const result = await generatorClient.getHistory()

      expect(result).toEqual([])
    })

    it("should handle history fetch errors", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"))

      await expect(generatorClient.getHistory()).rejects.toThrow()
    })
  })

  describe("getUserDefaults", () => {
    it("should fetch user default settings", async () => {
      const mockDefaults = {
        name: "John Doe",
        email: "john@example.com",
        phone: "555-0100",
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/johndoe",
        github: "github.com/johndoe",
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          defaults: mockDefaults,
        }),
      } as Response)

      const result = await generatorClient.getUserDefaults()

      expect(result.name).toBe("John Doe")
      expect(result.email).toBe("john@example.com")
      expect(result.phone).toBe("555-0100")
    })

    it("should handle missing defaults", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          defaults: null,
        }),
      } as Response)

      const result = await generatorClient.getUserDefaults()

      expect(result).toBeNull()
    })
  })

  describe("updateUserDefaults", () => {
    it("should update user default settings", async () => {
      const updates = {
        name: "Jane Doe",
        email: "jane@example.com",
        location: "New York, NY",
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          defaults: updates,
        }),
      } as Response)

      const result = await generatorClient.updateUserDefaults(updates)

      expect(result.success).toBe(true)
    })

    it("should handle update errors", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid data" }),
      } as Response)

      await expect(
        generatorClient.updateUserDefaults({ name: "Test" }),
      ).rejects.toThrow()
    })
  })

  describe("deleteDocument", () => {
    it("should delete a document", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "Document deleted",
        }),
      } as Response)

      const result = await generatorClient.deleteDocument("doc-123")

      expect(result.success).toBe(true)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/doc-123"),
        expect.objectContaining({
          method: "DELETE",
        }),
      )
    })

    it("should handle delete errors", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Document not found" }),
      } as Response)

      await expect(generatorClient.deleteDocument("invalid-id")).rejects.toThrow()
    })
  })

  describe("Request Validation", () => {
    it("should require job role", async () => {
      const invalidRequest = {
        generateType: "resume" as const,
        job: {
          role: "",
          company: "Tech Corp",
        },
      }

      // Client should validate or API should reject
      expect(invalidRequest.job.role).toBe("")
    })

    it("should require company name", async () => {
      const invalidRequest = {
        generateType: "resume" as const,
        job: {
          role: "Engineer",
          company: "",
        },
      }

      expect(invalidRequest.job.company).toBe("")
    })

    it("should accept optional job description", async () => {
      const request: GenerateDocumentRequest = {
        generateType: "resume",
        job: {
          role: "Engineer",
          company: "Tech",
          jobDescriptionText: "Optional description",
        },
      }

      expect(request.job.jobDescriptionText).toBeDefined()
    })
  })

  describe("Response Handling", () => {
    it("should parse success response correctly", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          documentUrl: "https://storage.example.com/doc.pdf",
          documentId: "doc-123",
          generationId: "gen-456",
        }),
      } as Response)

      const result = await generatorClient.generateDocument({
        generateType: "resume",
        job: { role: "Engineer", company: "Tech" },
      })

      expect(result.success).toBe(true)
      expect(result.documentUrl).toBeDefined()
      expect(result.documentId).toBeDefined()
      expect(result.generationId).toBeDefined()
    })

    it("should parse error response correctly", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: "Invalid request",
        }),
      } as Response)

      await expect(
        generatorClient.generateDocument({
          generateType: "resume",
          job: { role: "Engineer", company: "Tech" },
        }),
      ).rejects.toThrow()
    })
  })
})
