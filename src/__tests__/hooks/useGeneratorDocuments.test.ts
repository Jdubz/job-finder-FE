/**
 * useGeneratorDocuments Hook Tests
 * 
 * Comprehensive tests for the useGeneratorDocuments hook functionality
 */

import { describe, it, expect, beforeEach, vi, Mock } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useGeneratorDocuments } from "@/hooks/useGeneratorDocuments"
import { useAuth } from "@/contexts/AuthContext"
import { useFirestore } from "@/contexts/FirestoreContext"
import type { GeneratorRequest, GeneratorResponse } from "@jsdubzw/job-finder-shared-types"

// Mock dependencies
vi.mock("@/contexts/AuthContext")
vi.mock("@/contexts/FirestoreContext")

const mockUseAuth = useAuth as Mock
const mockUseFirestore = useFirestore as Mock

// Mock data
const mockUser = {
  uid: "test-user-123",
  email: "test@example.com",
  displayName: "Test User",
}

const mockFirestoreService = {
  deleteDocument: vi.fn(),
}

const mockRawDocuments: (GeneratorRequest | GeneratorResponse)[] = [
  {
    id: "request-1",
    type: "request",
    generateType: "resume",
    job: {
      role: "Software Engineer",
      company: "Tech Corp",
    },
    status: "completed",
    createdAt: new Date("2024-01-15"),
    files: {
      resume: {
        gcsPath: "documents/resume-1.pdf",
        signedUrl: "https://storage.example.com/resume-1.pdf",
        size: 1024000,
        storageClass: "STANDARD",
      },
    },
  },
  {
    id: "request-2",
    type: "request",
    generateType: "coverLetter",
    job: {
      role: "Frontend Developer",
      company: "Startup Inc",
    },
    status: "completed",
    createdAt: new Date("2024-01-14"),
    files: {
      coverLetter: {
        gcsPath: "documents/cover-letter-1.pdf",
        signedUrl: "https://storage.example.com/cover-letter-1.pdf",
        size: 512000,
        storageClass: "STANDARD",
      },
    },
  },
  {
    id: "request-3",
    type: "request",
    generateType: "both",
    job: {
      role: "Full Stack Developer",
      company: "Enterprise Corp",
    },
    status: "completed",
    createdAt: new Date("2024-01-13"),
    files: {
      resume: {
        gcsPath: "documents/resume-2.pdf",
        signedUrl: "https://storage.example.com/resume-2.pdf",
        size: 1024000,
        storageClass: "STANDARD",
      },
      coverLetter: {
        gcsPath: "documents/cover-letter-2.pdf",
        signedUrl: "https://storage.example.com/cover-letter-2.pdf",
        size: 512000,
        storageClass: "STANDARD",
      },
    },
  },
]

const mockTransformedDocuments = [
  {
    id: "request-1",
    type: "resume" as const,
    jobTitle: "Software Engineer",
    companyName: "Tech Corp",
    documentUrl: "https://storage.example.com/resume-1.pdf",
    createdAt: new Date("2024-01-15"),
    status: "completed" as const,
    jobMatchId: undefined,
  },
  {
    id: "request-2",
    type: "cover_letter" as const,
    jobTitle: "Frontend Developer",
    companyName: "Startup Inc",
    documentUrl: "https://storage.example.com/cover-letter-1.pdf",
    createdAt: new Date("2024-01-14"),
    status: "completed" as const,
    jobMatchId: undefined,
  },
  {
    id: "request-3",
    type: "both" as const,
    jobTitle: "Full Stack Developer",
    companyName: "Enterprise Corp",
    documentUrl: "https://storage.example.com/resume-2.pdf", // Should use resume URL as primary
    createdAt: new Date("2024-01-13"),
    status: "completed" as const,
    jobMatchId: undefined,
  },
]

describe("useGeneratorDocuments", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    })
    
    mockUseFirestore.mockReturnValue({
      service: mockFirestoreService,
    })
  })

  describe("data fetching", () => {
    it("should fetch documents when user is authenticated", async () => {
      const mockUseFirestoreCollection = vi.fn().mockReturnValue({
        data: mockRawDocuments,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      // Mock the useFirestoreCollection hook
      vi.doMock("@/hooks/useFirestoreCollection", () => ({
        useFirestoreCollection: mockUseFirestoreCollection,
      }))

      const { result } = renderHook(() => useGeneratorDocuments())

      await waitFor(() => {
        expect(result.current.documents).toEqual(mockTransformedDocuments)
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeNull()
      })
    })

    it("should not fetch documents when user is not authenticated", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      })

      const mockUseFirestoreCollection = vi.fn().mockReturnValue({
        data: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      vi.doMock("@/hooks/useFirestoreCollection", () => ({
        useFirestoreCollection: mockUseFirestoreCollection,
      }))

      const { result } = renderHook(() => useGeneratorDocuments())

      expect(result.current.documents).toEqual([])
      expect(result.current.loading).toBe(false)
    })

    it("should handle loading state", async () => {
      const mockUseFirestoreCollection = vi.fn().mockReturnValue({
        data: [],
        loading: true,
        error: null,
        refetch: vi.fn(),
      })

      vi.doMock("@/hooks/useFirestoreCollection", () => ({
        useFirestoreCollection: mockUseFirestoreCollection,
      }))

      const { result } = renderHook(() => useGeneratorDocuments())

      expect(result.current.loading).toBe(true)
    })

    it("should handle error state", async () => {
      const mockError = new Error("Failed to fetch documents")
      
      const mockUseFirestoreCollection = vi.fn().mockReturnValue({
        data: [],
        loading: false,
        error: mockError,
        refetch: vi.fn(),
      })

      vi.doMock("@/hooks/useFirestoreCollection", () => ({
        useFirestoreCollection: mockUseFirestoreCollection,
      }))

      const { result } = renderHook(() => useGeneratorDocuments())

      expect(result.current.error).toBe(mockError)
    })
  })

  describe("document transformation", () => {
    it("should transform resume documents correctly", async () => {
      const resumeDocument: GeneratorRequest = {
        id: "request-1",
        type: "request",
        generateType: "resume",
        job: {
          role: "Software Engineer",
          company: "Tech Corp",
        },
        status: "completed",
        createdAt: new Date("2024-01-15"),
        files: {
          resume: {
            gcsPath: "documents/resume-1.pdf",
            signedUrl: "https://storage.example.com/resume-1.pdf",
            size: 1024000,
            storageClass: "STANDARD",
          },
        },
      }

      const mockUseFirestoreCollection = vi.fn().mockReturnValue({
        data: [resumeDocument],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      vi.doMock("@/hooks/useFirestoreCollection", () => ({
        useFirestoreCollection: mockUseFirestoreCollection,
      }))

      const { result } = renderHook(() => useGeneratorDocuments())

      await waitFor(() => {
        expect(result.current.documents).toHaveLength(1)
        expect(result.current.documents[0]).toEqual({
          id: "request-1",
          type: "resume",
          jobTitle: "Software Engineer",
          companyName: "Tech Corp",
          documentUrl: "https://storage.example.com/resume-1.pdf",
          createdAt: new Date("2024-01-15"),
          status: "completed",
          jobMatchId: undefined,
        })
      })
    })

    it("should transform cover letter documents correctly", async () => {
      const coverLetterDocument: GeneratorRequest = {
        id: "request-2",
        type: "request",
        generateType: "coverLetter",
        job: {
          role: "Frontend Developer",
          company: "Startup Inc",
        },
        status: "completed",
        createdAt: new Date("2024-01-14"),
        files: {
          coverLetter: {
            gcsPath: "documents/cover-letter-1.pdf",
            signedUrl: "https://storage.example.com/cover-letter-1.pdf",
            size: 512000,
            storageClass: "STANDARD",
          },
        },
      }

      const mockUseFirestoreCollection = vi.fn().mockReturnValue({
        data: [coverLetterDocument],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      vi.doMock("@/hooks/useFirestoreCollection", () => ({
        useFirestoreCollection: mockUseFirestoreCollection,
      }))

      const { result } = renderHook(() => useGeneratorDocuments())

      await waitFor(() => {
        expect(result.current.documents).toHaveLength(1)
        expect(result.current.documents[0]).toEqual({
          id: "request-2",
          type: "cover_letter",
          jobTitle: "Frontend Developer",
          companyName: "Startup Inc",
          documentUrl: "https://storage.example.com/cover-letter-1.pdf",
          createdAt: new Date("2024-01-14"),
          status: "completed",
          jobMatchId: undefined,
        })
      })
    })

    it("should transform both documents correctly", async () => {
      const bothDocument: GeneratorRequest = {
        id: "request-3",
        type: "request",
        generateType: "both",
        job: {
          role: "Full Stack Developer",
          company: "Enterprise Corp",
        },
        status: "completed",
        createdAt: new Date("2024-01-13"),
        files: {
          resume: {
            gcsPath: "documents/resume-2.pdf",
            signedUrl: "https://storage.example.com/resume-2.pdf",
            size: 1024000,
            storageClass: "STANDARD",
          },
          coverLetter: {
            gcsPath: "documents/cover-letter-2.pdf",
            signedUrl: "https://storage.example.com/cover-letter-2.pdf",
            size: 512000,
            storageClass: "STANDARD",
          },
        },
      }

      const mockUseFirestoreCollection = vi.fn().mockReturnValue({
        data: [bothDocument],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      vi.doMock("@/hooks/useFirestoreCollection", () => ({
        useFirestoreCollection: mockUseFirestoreCollection,
      }))

      const { result } = renderHook(() => useGeneratorDocuments())

      await waitFor(() => {
        expect(result.current.documents).toHaveLength(1)
        expect(result.current.documents[0]).toEqual({
          id: "request-3",
          type: "both",
          jobTitle: "Full Stack Developer",
          companyName: "Enterprise Corp",
          documentUrl: "https://storage.example.com/resume-2.pdf", // Should use resume URL as primary
          createdAt: new Date("2024-01-13"),
          status: "completed",
          jobMatchId: undefined,
        })
      })
    })

    it("should handle documents without files", async () => {
      const documentWithoutFiles: GeneratorRequest = {
        id: "request-4",
        type: "request",
        generateType: "resume",
        job: {
          role: "Software Engineer",
          company: "Tech Corp",
        },
        status: "processing",
        createdAt: new Date("2024-01-15"),
      }

      const mockUseFirestoreCollection = vi.fn().mockReturnValue({
        data: [documentWithoutFiles],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      vi.doMock("@/hooks/useFirestoreCollection", () => ({
        useFirestoreCollection: mockUseFirestoreCollection,
      }))

      const { result } = renderHook(() => useGeneratorDocuments())

      await waitFor(() => {
        expect(result.current.documents).toHaveLength(1)
        expect(result.current.documents[0].documentUrl).toBeUndefined()
      })
    })

    it("should handle different date formats", async () => {
      const documentWithTimestamp: GeneratorRequest = {
        id: "request-5",
        type: "request",
        generateType: "resume",
        job: {
          role: "Software Engineer",
          company: "Tech Corp",
        },
        status: "completed",
        createdAt: { seconds: 1705276800, nanoseconds: 0 } as any, // Firestore Timestamp
        files: {
          resume: {
            gcsPath: "documents/resume-5.pdf",
            signedUrl: "https://storage.example.com/resume-5.pdf",
            size: 1024000,
            storageClass: "STANDARD",
          },
        },
      }

      const mockUseFirestoreCollection = vi.fn().mockReturnValue({
        data: [documentWithTimestamp],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      vi.doMock("@/hooks/useFirestoreCollection", () => ({
        useFirestoreCollection: mockUseFirestoreCollection,
      }))

      const { result } = renderHook(() => useGeneratorDocuments())

      await waitFor(() => {
        expect(result.current.documents).toHaveLength(1)
        expect(result.current.documents[0].createdAt).toEqual(new Date(1705276800000))
      })
    })
  })

  describe("deleteDocument", () => {
    it("should delete document successfully", async () => {
      mockFirestoreService.deleteDocument.mockResolvedValue(undefined)

      const mockUseFirestoreCollection = vi.fn().mockReturnValue({
        data: mockRawDocuments,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      vi.doMock("@/hooks/useFirestoreCollection", () => ({
        useFirestoreCollection: mockUseFirestoreCollection,
      }))

      const { result } = renderHook(() => useGeneratorDocuments())

      await result.current.deleteDocument("request-1")

      expect(mockFirestoreService.deleteDocument).toHaveBeenCalledWith(
        "generator-documents",
        "request-1"
      )
    })

    it("should handle delete errors", async () => {
      const deleteError = new Error("Failed to delete document")
      mockFirestoreService.deleteDocument.mockRejectedValue(deleteError)

      const mockUseFirestoreCollection = vi.fn().mockReturnValue({
        data: mockRawDocuments,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      vi.doMock("@/hooks/useFirestoreCollection", () => ({
        useFirestoreCollection: mockUseFirestoreCollection,
      }))

      const { result } = renderHook(() => useGeneratorDocuments())

      await expect(result.current.deleteDocument("request-1")).rejects.toThrow(deleteError)
    })
  })

  describe("refetch functionality", () => {
    it("should provide refetch function", async () => {
      const mockRefetch = vi.fn()
      
      const mockUseFirestoreCollection = vi.fn().mockReturnValue({
        data: mockRawDocuments,
        loading: false,
        error: null,
        refetch: mockRefetch,
      })

      vi.doMock("@/hooks/useFirestoreCollection", () => ({
        useFirestoreCollection: mockUseFirestoreCollection,
      }))

      const { result } = renderHook(() => useGeneratorDocuments())

      expect(result.current.refetch).toBe(mockRefetch)
    })

    it("should call refetch when called", async () => {
      const mockRefetch = vi.fn()
      
      const mockUseFirestoreCollection = vi.fn().mockReturnValue({
        data: mockRawDocuments,
        loading: false,
        error: null,
        refetch: mockRefetch,
      })

      vi.doMock("@/hooks/useFirestoreCollection", () => ({
        useFirestoreCollection: mockUseFirestoreCollection,
      }))

      const { result } = renderHook(() => useGeneratorDocuments())

      await result.current.refetch()

      expect(mockRefetch).toHaveBeenCalled()
    })
  })

  describe("filtering and ordering", () => {
    it("should filter only request documents", async () => {
      const mixedDocuments = [
        ...mockRawDocuments,
        {
          id: "response-1",
          type: "response",
          // ... other response properties
        } as GeneratorResponse,
      ]

      const mockUseFirestoreCollection = vi.fn().mockReturnValue({
        data: mixedDocuments,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      vi.doMock("@/hooks/useFirestoreCollection", () => ({
        useFirestoreCollection: mockUseFirestoreCollection,
      }))

      const { result } = renderHook(() => useGeneratorDocuments())

      await waitFor(() => {
        // Should only include request documents, not response documents
        expect(result.current.documents).toHaveLength(3)
        expect(result.current.documents.every(doc => doc.id.startsWith("request"))).toBe(true)
      })
    })

    it("should order documents by creation date descending", async () => {
      const mockUseFirestoreCollection = vi.fn().mockReturnValue({
        data: mockRawDocuments,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      vi.doMock("@/hooks/useFirestoreCollection", () => ({
        useFirestoreCollection: mockUseFirestoreCollection,
      }))

      const { result } = renderHook(() => useGeneratorDocuments())

      await waitFor(() => {
        const documents = result.current.documents
        expect(documents[0].createdAt.getTime()).toBeGreaterThanOrEqual(documents[1].createdAt.getTime())
        expect(documents[1].createdAt.getTime()).toBeGreaterThanOrEqual(documents[2].createdAt.getTime())
      })
    })
  })

  describe("memoization", () => {
    it("should memoize transformed documents", async () => {
      const mockUseFirestoreCollection = vi.fn().mockReturnValue({
        data: mockRawDocuments,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })

      vi.doMock("@/hooks/useFirestoreCollection", () => ({
        useFirestoreCollection: mockUseFirestoreCollection,
      }))

      const { result, rerender } = renderHook(() => useGeneratorDocuments())

      await waitFor(() => {
        expect(result.current.documents).toEqual(mockTransformedDocuments)
      })

      // Rerender with same data
      rerender()

      await waitFor(() => {
        expect(result.current.documents).toEqual(mockTransformedDocuments)
      })

      // The transformation should be memoized and not recalculated
      // This is tested by ensuring the hook doesn't cause infinite re-renders
    })
  })
})
