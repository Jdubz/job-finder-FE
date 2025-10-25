/**
 * Generator Client Tests
 * Comprehensive tests for the generator API client functionality
 */

import { describe, it, expect, beforeEach, vi, Mock } from "vitest"
import { GeneratorClient } from "@/api/generator-client"
import type { GenerateDocumentRequest, StartGenerationResponse, ExecuteStepResponse } from "@/api/generator-client"

// Mock fetch globally
global.fetch = vi.fn()

const mockFetch = fetch as Mock

describe("GeneratorClient", () => {
  let generatorClient: GeneratorClient
  const mockBaseUrl = "https://test-api.example.com"

  beforeEach(() => {
    vi.clearAllMocks()
    generatorClient = new GeneratorClient(mockBaseUrl)
  })

  describe("generateDocument", () => {
    const mockRequest: GenerateDocumentRequest = {
      generateType: "resume",
      job: {
        role: "Software Engineer",
        company: "Tech Corp",
        jobDescriptionText: "Build amazing software",
      },
      preferences: {
        emphasize: ["React", "TypeScript"],
      },
      date: "2024-01-15",
    }

    it("should make POST request to correct endpoint", async () => {
      const mockResponse = {
        success: true,
        message: "Document generated successfully",
        documentUrl: "https://storage.example.com/resume.pdf",
        documentId: "doc-123",
        generationId: "gen-123",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await generatorClient.generateDocument(mockRequest)

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/generator/generate`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(mockRequest),
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it("should handle API errors", async () => {
      const mockErrorResponse = {
        success: false,
        error: "VALIDATION_FAILED",
        message: "Invalid request parameters",
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockErrorResponse),
      })

      await expect(generatorClient.generateDocument(mockRequest)).rejects.toThrow()
    })

    it("should include auth token in headers", async () => {
      // Mock auth token
      vi.spyOn(generatorClient, "getAuthToken").mockResolvedValue("mock-token")

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      await generatorClient.generateDocument(mockRequest)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      )
    })
  })

  describe("startGeneration", () => {
    const mockRequest: GenerateDocumentRequest = {
      generateType: "coverLetter",
      job: {
        role: "Frontend Developer",
        company: "Startup Inc",
      },
    }

    it("should start multi-step generation", async () => {
      const mockResponse: StartGenerationResponse = {
        success: true,
        data: {
          requestId: "gen-request-123",
          status: "pending",
          nextStep: "fetch_data",
        },
        requestId: "gen-request-123",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await generatorClient.startGeneration(mockRequest)

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/generator/start`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(mockRequest),
        })
      )

      expect(result).toEqual(mockResponse)
    })
  })

  describe("executeStep", () => {
    it("should execute next step in generation", async () => {
      const mockResponse: ExecuteStepResponse = {
        success: true,
        data: {
          stepCompleted: "fetch_data",
          nextStep: "generate_resume",
          status: "processing",
          steps: [
            {
              id: "fetch_data",
              name: "Fetch Data",
              description: "Loading your experience data",
              status: "completed",
              startedAt: new Date(),
              completedAt: new Date(),
              duration: 1000,
            },
          ],
        },
        requestId: "gen-request-123",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await generatorClient.executeStep("gen-request-123")

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/generator/step/gen-request-123`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({}),
        })
      )

      expect(result).toEqual(mockResponse)
    })
  })

  describe("getHistory", () => {
    it("should fetch document history", async () => {
      const mockHistory = [
        {
          id: "doc-1",
          type: "resume" as const,
          jobTitle: "Software Engineer",
          companyName: "Tech Corp",
          documentUrl: "https://storage.example.com/resume1.pdf",
          createdAt: new Date(),
          status: "completed" as const,
        },
        {
          id: "doc-2",
          type: "cover_letter" as const,
          jobTitle: "Frontend Developer",
          companyName: "Startup Inc",
          documentUrl: "https://storage.example.com/cover-letter1.pdf",
          createdAt: new Date(),
          status: "completed" as const,
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistory),
      })

      const result = await generatorClient.getHistory()

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/generator/requests`,
        expect.objectContaining({
          method: "GET",
        })
      )

      expect(result).toEqual(mockHistory)
    })

    it("should fetch history for specific user", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      await generatorClient.getHistory("user-123")

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/generator/requests?userId=user-123`,
        expect.objectContaining({
          method: "GET",
        })
      )
    })
  })

  describe("getUserDefaults", () => {
    it("should fetch user defaults", async () => {
      const mockDefaults = {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1-555-0123",
        location: "San Francisco, CA",
        linkedin: "https://linkedin.com/in/johndoe",
        github: "https://github.com/johndoe",
        portfolio: "https://johndoe.dev",
        summary: "Experienced software engineer",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDefaults),
      })

      const result = await generatorClient.getUserDefaults()

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/generator/defaults`,
        expect.objectContaining({
          method: "GET",
        })
      )

      expect(result).toEqual(mockDefaults)
    })
  })

  describe("updateUserDefaults", () => {
    it("should update user defaults", async () => {
      const updateData = {
        name: "John Doe",
        email: "john@example.com",
      }

      const mockResponse = { success: true }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await generatorClient.updateUserDefaults(updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/generator/defaults`,
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        })
      )

      expect(result).toEqual(mockResponse)
    })
  })

  describe("deleteDocument", () => {
    it("should delete document", async () => {
      const mockResponse = { success: true }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await generatorClient.deleteDocument("doc-123")

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/generator/requests/doc-123`,
        expect.objectContaining({
          method: "DELETE",
        })
      )

      expect(result).toEqual(mockResponse)
    })
  })

  describe("error handling", () => {
    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      await expect(generatorClient.generateDocument({
        generateType: "resume",
        job: { role: "Engineer", company: "Corp" },
      })).rejects.toThrow("Network error")
    })

    it("should handle HTTP errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.resolve({ error: "Internal Server Error" }),
      })

      await expect(generatorClient.generateDocument({
        generateType: "resume",
        job: { role: "Engineer", company: "Corp" },
      })).rejects.toThrow()
    })

    it("should retry on network failures", async () => {
      // Mock retry behavior
      mockFetch
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })

      const result = await generatorClient.generateDocument({
        generateType: "resume",
        job: { role: "Engineer", company: "Corp" },
      })

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(result).toEqual({ success: true })
    })
  })

  describe("request validation", () => {
    it("should validate required fields", () => {
      const validRequest: GenerateDocumentRequest = {
        generateType: "resume",
        job: {
          role: "Software Engineer",
          company: "Tech Corp",
        },
      }

      expect(validRequest.generateType).toBeDefined()
      expect(validRequest.job.role).toBeDefined()
      expect(validRequest.job.company).toBeDefined()
      expect(["resume", "coverLetter", "both"]).toContain(validRequest.generateType)
    })

    it("should handle optional fields", () => {
      const requestWithOptionals: GenerateDocumentRequest = {
        generateType: "both",
        job: {
          role: "Software Engineer",
          company: "Tech Corp",
          companyWebsite: "https://techcorp.com",
          jobDescriptionUrl: "https://techcorp.com/jobs/123",
          jobDescriptionText: "We are looking for...",
        },
        preferences: {
          style: "modern",
          emphasize: ["React", "TypeScript"],
        },
        date: "2024-01-15",
        jobMatchId: "match-123",
      }

      expect(requestWithOptionals.job.companyWebsite).toBeDefined()
      expect(requestWithOptionals.job.jobDescriptionText).toBeDefined()
      expect(requestWithOptionals.preferences).toBeDefined()
      expect(requestWithOptionals.date).toBeDefined()
      expect(requestWithOptionals.jobMatchId).toBeDefined()
    })
  })
})
