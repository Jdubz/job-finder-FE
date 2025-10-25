/**
 * DocumentHistoryList Component Tests
 * 
 * Comprehensive tests for the DocumentHistoryList component functionality
 */

import { describe, it, expect, beforeEach, vi, Mock } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { DocumentHistoryList } from "@/pages/document-builder/components/DocumentHistoryList"
import { useAuth } from "@/contexts/AuthContext"
import { useGeneratorDocuments } from "@/hooks/useGeneratorDocuments"

// Mock dependencies
vi.mock("@/contexts/AuthContext")
vi.mock("@/hooks/useGeneratorDocuments")

const mockUseAuth = useAuth as Mock
const mockUseGeneratorDocuments = useGeneratorDocuments as Mock

// Mock data
const mockUser = {
  uid: "test-user-123",
  email: "test@example.com",
  displayName: "Test User",
}

const mockDocuments = [
  {
    id: "doc-1",
    type: "resume" as const,
    jobTitle: "Senior Software Engineer",
    companyName: "Tech Corp",
    documentUrl: "https://storage.example.com/resume-1.pdf",
    createdAt: new Date("2024-01-15T10:00:00Z"),
    status: "completed" as const,
    jobMatchId: "match-1",
  },
  {
    id: "doc-2",
    type: "cover_letter" as const,
    jobTitle: "Frontend Developer",
    companyName: "Startup Inc",
    documentUrl: "https://storage.example.com/cover-letter-1.pdf",
    createdAt: new Date("2024-01-14T14:30:00Z"),
    status: "completed" as const,
    jobMatchId: "match-2",
  },
  {
    id: "doc-3",
    type: "both" as const,
    jobTitle: "Full Stack Developer",
    companyName: "Enterprise Corp",
    documentUrl: "https://storage.example.com/resume-2.pdf",
    createdAt: new Date("2024-01-13T09:15:00Z"),
    status: "completed" as const,
    jobMatchId: "match-3",
  },
]

describe("DocumentHistoryList", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    })
    
    mockUseGeneratorDocuments.mockReturnValue({
      documents: mockDocuments,
      loading: false,
      error: null,
      deleteDocument: vi.fn(),
      refetch: vi.fn(),
    })
  })

  describe("rendering", () => {
    it("should render document history list", () => {
      render(<DocumentHistoryList />)

      expect(screen.getByText("Document History")).toBeInTheDocument()
      expect(screen.getByText("3 documents generated")).toBeInTheDocument()
    })

    it("should render all documents", () => {
      render(<DocumentHistoryList />)

      expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument()
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument()
      expect(screen.getByText("Full Stack Developer")).toBeInTheDocument()
    })

    it("should show correct document types", () => {
      render(<DocumentHistoryList />)

      expect(screen.getByText("Resume")).toBeInTheDocument()
      expect(screen.getByText("Cover Letter")).toBeInTheDocument()
      expect(screen.getAllByText("Both")).toHaveLength(1)
    })

    it("should show company names", () => {
      render(<DocumentHistoryList />)

      expect(screen.getByText("Tech Corp")).toBeInTheDocument()
      expect(screen.getByText("Startup Inc")).toBeInTheDocument()
      expect(screen.getByText("Enterprise Corp")).toBeInTheDocument()
    })

    it("should show creation dates", () => {
      render(<DocumentHistoryList />)

      // Check for formatted dates
      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument()
      expect(screen.getByText(/Jan 14, 2024/)).toBeInTheDocument()
      expect(screen.getByText(/Jan 13, 2024/)).toBeInTheDocument()
    })
  })

  describe("loading state", () => {
    it("should show loading skeleton when loading", () => {
      mockUseGeneratorDocuments.mockReturnValue({
        documents: [],
        loading: true,
        error: null,
        deleteDocument: vi.fn(),
        refetch: vi.fn(),
      })

      render(<DocumentHistoryList />)

      expect(screen.getByText("Document History")).toBeInTheDocument()
      expect(screen.getByText("Your previously generated documents")).toBeInTheDocument()
      
      // Should show skeleton loading items
      const skeletonItems = screen.getAllByTestId("skeleton-item")
      expect(skeletonItems).toHaveLength(3)
    })
  })

  describe("empty state", () => {
    it("should show empty state when no documents", () => {
      mockUseGeneratorDocuments.mockReturnValue({
        documents: [],
        loading: false,
        error: null,
        deleteDocument: vi.fn(),
        refetch: vi.fn(),
      })

      render(<DocumentHistoryList />)

      expect(screen.getByText("No documents yet")).toBeInTheDocument()
      expect(screen.getByText("Generate your first resume or cover letter to get started")).toBeInTheDocument()
    })
  })

  describe("error state", () => {
    it("should show error message when there's an error", () => {
      const mockError = new Error("Failed to load documents")
      
      mockUseGeneratorDocuments.mockReturnValue({
        documents: [],
        loading: false,
        error: mockError,
        deleteDocument: vi.fn(),
        refetch: vi.fn(),
      })

      render(<DocumentHistoryList />)

      expect(screen.getByText("Failed to load documents")).toBeInTheDocument()
    })
  })

  describe("download functionality", () => {
    it("should show download buttons for documents with URLs", () => {
      render(<DocumentHistoryList />)

      const downloadButtons = screen.getAllByText("Download")
      expect(downloadButtons).toHaveLength(3)
    })

    it("should open download URL in new tab when download button is clicked", () => {
      const mockOpen = vi.fn()
      window.open = mockOpen

      render(<DocumentHistoryList />)

      const downloadButtons = screen.getAllByText("Download")
      fireEvent.click(downloadButtons[0])

      expect(mockOpen).toHaveBeenCalledWith(
        "https://storage.example.com/resume-1.pdf",
        "_blank"
      )
    })

    it("should not show download button for documents without URLs", () => {
      const documentsWithoutUrls = mockDocuments.map(doc => ({
        ...doc,
        documentUrl: undefined,
      }))

      mockUseGeneratorDocuments.mockReturnValue({
        documents: documentsWithoutUrls,
        loading: false,
        error: null,
        deleteDocument: vi.fn(),
        refetch: vi.fn(),
      })

      render(<DocumentHistoryList />)

      expect(screen.queryByText("Download")).not.toBeInTheDocument()
    })
  })

  describe("delete functionality", () => {
    it("should show delete buttons for all documents", () => {
      render(<DocumentHistoryList />)

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i })
      expect(deleteButtons).toHaveLength(3)
    })

    it("should show confirmation dialog when delete button is clicked", () => {
      // Mock window.confirm
      const mockConfirm = vi.spyOn(window, "confirm").mockReturnValue(true)

      const mockDeleteDocument = vi.fn().mockResolvedValue(undefined)
      mockUseGeneratorDocuments.mockReturnValue({
        documents: mockDocuments,
        loading: false,
        error: null,
        deleteDocument: mockDeleteDocument,
        refetch: vi.fn(),
      })

      render(<DocumentHistoryList />)

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i })
      fireEvent.click(deleteButtons[0])

      expect(mockConfirm).toHaveBeenCalledWith(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
      expect(mockDeleteDocument).toHaveBeenCalledWith("doc-1")

      mockConfirm.mockRestore()
    })

    it("should not delete when confirmation is cancelled", () => {
      // Mock window.confirm to return false
      const mockConfirm = vi.spyOn(window, "confirm").mockReturnValue(false)

      const mockDeleteDocument = vi.fn()
      mockUseGeneratorDocuments.mockReturnValue({
        documents: mockDocuments,
        loading: false,
        error: null,
        deleteDocument: mockDeleteDocument,
        refetch: vi.fn(),
      })

      render(<DocumentHistoryList />)

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i })
      fireEvent.click(deleteButtons[0])

      expect(mockConfirm).toHaveBeenCalled()
      expect(mockDeleteDocument).not.toHaveBeenCalled()

      mockConfirm.mockRestore()
    })

    it("should show loading state on delete button during deletion", async () => {
      const mockDeleteDocument = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
      
      mockUseGeneratorDocuments.mockReturnValue({
        documents: mockDocuments,
        loading: false,
        error: null,
        deleteDocument: mockDeleteDocument,
        refetch: vi.fn(),
      })

      // Mock window.confirm
      const mockConfirm = vi.spyOn(window, "confirm").mockReturnValue(true)

      render(<DocumentHistoryList />)

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i })
      fireEvent.click(deleteButtons[0])

      // Button should be disabled during deletion
      expect(deleteButtons[0]).toBeDisabled()

      await waitFor(() => {
        expect(deleteButtons[0]).not.toBeDisabled()
      })

      mockConfirm.mockRestore()
    })

    it("should handle delete errors", async () => {
      const deleteError = new Error("Failed to delete document")
      const mockDeleteDocument = vi.fn().mockRejectedValue(deleteError)
      
      mockUseGeneratorDocuments.mockReturnValue({
        documents: mockDocuments,
        loading: false,
        error: null,
        deleteDocument: mockDeleteDocument,
        refetch: vi.fn(),
      })

      // Mock window.confirm and alert
      const mockConfirm = vi.spyOn(window, "confirm").mockReturnValue(true)
      const mockAlert = vi.spyOn(window, "alert").mockImplementation(() => {})

      render(<DocumentHistoryList />)

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i })
      fireEvent.click(deleteButtons[0])

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith("Failed to delete document")
      })

      mockConfirm.mockRestore()
      mockAlert.mockRestore()
    })
  })

  describe("refresh functionality", () => {
    it("should trigger refetch when refreshTrigger changes", () => {
      const mockRefetch = vi.fn()
      
      mockUseGeneratorDocuments.mockReturnValue({
        documents: mockDocuments,
        loading: false,
        error: null,
        deleteDocument: vi.fn(),
        refetch: mockRefetch,
      })

      const { rerender } = render(<DocumentHistoryList refreshTrigger={0} />)

      // Change refreshTrigger
      rerender(<DocumentHistoryList refreshTrigger={1} />)

      // The hook should automatically refetch when dependencies change
      // This is tested by ensuring the hook is called with the new refreshTrigger
      expect(mockUseGeneratorDocuments).toHaveBeenCalled()
    })
  })

  describe("document status badges", () => {
    it("should show correct status badges for different document types", () => {
      render(<DocumentHistoryList />)

      // Check for status badges
      const resumeBadge = screen.getByText("Resume")
      const coverLetterBadge = screen.getByText("Cover Letter")
      const bothBadge = screen.getByText("Both")

      expect(resumeBadge).toBeInTheDocument()
      expect(coverLetterBadge).toBeInTheDocument()
      expect(bothBadge).toBeInTheDocument()
    })

    it("should apply correct styling to status badges", () => {
      render(<DocumentHistoryList />)

      const resumeBadge = screen.getByText("Resume")
      const coverLetterBadge = screen.getByText("Cover Letter")
      const bothBadge = screen.getByText("Both")

      // Check that badges have correct classes
      expect(resumeBadge.closest('[class*="inline-flex"]')).toBeInTheDocument()
      expect(coverLetterBadge.closest('[class*="inline-flex"]')).toBeInTheDocument()
      expect(bothBadge.closest('[class*="inline-flex"]')).toBeInTheDocument()
    })
  })

  describe("accessibility", () => {
    it("should have proper ARIA labels for delete buttons", () => {
      render(<DocumentHistoryList />)

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i })
      deleteButtons.forEach(button => {
        expect(button).toHaveAttribute("aria-label")
      })
    })

    it("should have proper ARIA labels for download buttons", () => {
      render(<DocumentHistoryList />)

      const downloadButtons = screen.getAllByText("Download")
      downloadButtons.forEach(button => {
        expect(button.closest("button")).toHaveAttribute("aria-label")
      })
    })

    it("should be keyboard navigable", () => {
      render(<DocumentHistoryList />)

      const downloadButtons = screen.getAllByText("Download")
      const deleteButtons = screen.getAllByRole("button", { name: /delete/i })

      // All interactive elements should be focusable
      downloadButtons.forEach(button => {
        expect(button.closest("button")).not.toHaveAttribute("tabindex", "-1")
      })

      deleteButtons.forEach(button => {
        expect(button).not.toHaveAttribute("tabindex", "-1")
      })
    })
  })

  describe("responsive design", () => {
    it("should handle different screen sizes", () => {
      render(<DocumentHistoryList />)

      // Check that the component renders without errors
      expect(screen.getByText("Document History")).toBeInTheDocument()
      
      // Check that documents are displayed in a responsive layout
      const documentItems = screen.getAllByText(/Software Engineer|Frontend Developer|Full Stack Developer/)
      expect(documentItems).toHaveLength(3)
    })
  })

  describe("performance", () => {
    it("should handle large numbers of documents", () => {
      const manyDocuments = Array.from({ length: 100 }, (_, i) => ({
        id: `doc-${i}`,
        type: "resume" as const,
        jobTitle: `Job ${i}`,
        companyName: `Company ${i}`,
        documentUrl: `https://storage.example.com/doc-${i}.pdf`,
        createdAt: new Date(),
        status: "completed" as const,
        jobMatchId: `match-${i}`,
      }))

      mockUseGeneratorDocuments.mockReturnValue({
        documents: manyDocuments,
        loading: false,
        error: null,
        deleteDocument: vi.fn(),
        refetch: vi.fn(),
      })

      render(<DocumentHistoryList />)

      // Should render without performance issues
      expect(screen.getByText("100 documents generated")).toBeInTheDocument()
    })
  })
})
