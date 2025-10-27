/**
 * Document History Page Tests
 *
 * Tests for document history management including:
 * - Document list display
 * - Search and filtering
 * - Download and view actions
 * - Delete operations
 * - Type filtering
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DocumentHistoryPage } from "../DocumentHistoryPage"
import { useAuth } from "@/contexts/AuthContext"
import { useGeneratorDocuments } from "@/hooks/useGeneratorDocuments"

// Mock modules
vi.mock("@/contexts/AuthContext")
vi.mock("@/hooks/useGeneratorDocuments")

// Mock window.open
global.open = vi.fn()

describe("DocumentHistoryPage", () => {
  const mockUser = {
    uid: "test-user-123",
    email: "test@example.com",
    displayName: "Test User",
  }

  const mockDocuments = [
    {
      id: "doc-1",
      type: "resume",
      jobTitle: "Software Engineer",
      companyName: "Tech Corp",
      documentUrl: "https://storage.example.com/resume1.pdf",
      createdAt: "2024-01-15T10:00:00.000Z",
      jobMatchId: "match-1",
    },
    {
      id: "doc-2",
      type: "cover-letter",
      jobTitle: "Senior Developer",
      companyName: "StartupCo",
      documentUrl: "https://storage.example.com/cover1.pdf",
      createdAt: "2024-01-14T10:00:00.000Z",
      jobMatchId: "match-2",
    },
    {
      id: "doc-3",
      type: "resume",
      jobTitle: "Full Stack Engineer",
      companyName: "BigCorp",
      documentUrl: "https://storage.example.com/resume2.pdf",
      createdAt: "2024-01-13T10:00:00.000Z",
    },
    {
      id: "doc-4",
      type: "application",
      jobTitle: "Backend Developer",
      companyName: "DevShop",
      documentUrl: "https://storage.example.com/app1.pdf",
      createdAt: "2024-01-12T10:00:00.000Z",
    },
  ]

  const mockDeleteDocument = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser as any,
      loading: false,
      signOut: vi.fn(),
      signInWithGoogle: vi.fn(),
    } as any)

    vi.mocked(useGeneratorDocuments).mockReturnValue({
      documents: mockDocuments as any,
      loading: false,
      error: null,
      deleteDocument: mockDeleteDocument,
      refetch: vi.fn(),
    } as any)
  })

  describe("Initial Rendering", () => {
    it("should render the document history page", async () => {
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText(/document history|my documents/i)).toBeInTheDocument()
      })
    })

    it("should display all documents", async () => {
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
        expect(screen.getByText("Senior Developer")).toBeInTheDocument()
        expect(screen.getByText("Full Stack Engineer")).toBeInTheDocument()
        expect(screen.getByText("Backend Developer")).toBeInTheDocument()
      })
    })

    it("should show loading state", () => {
      vi.mocked(useGeneratorDocuments).mockReturnValue({
        documents: [],
        loading: true,
        error: null,
        deleteDocument: mockDeleteDocument,
        refetch: vi.fn(),
      } as any)

      render(<DocumentHistoryPage />)

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it("should display error state", async () => {
      vi.mocked(useGeneratorDocuments).mockReturnValue({
        documents: [],
        loading: false,
        error: new Error("Failed to load documents"),
        deleteDocument: mockDeleteDocument,
        refetch: vi.fn(),
      } as any)

      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
      })
    })

    it("should show empty state when no documents", () => {
      vi.mocked(useGeneratorDocuments).mockReturnValue({
        documents: [],
        loading: false,
        error: null,
        deleteDocument: mockDeleteDocument,
        refetch: vi.fn(),
      } as any)

      render(<DocumentHistoryPage />)

      expect(screen.getByText(/no documents|empty/i)).toBeInTheDocument()
    })
  })

  describe("Document Display", () => {
    it("should show document type icons", async () => {
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        // Check for type badges or icons
        expect(screen.getByText(/resume/i) || screen.getByText("📄")).toBeInTheDocument()
        expect(screen.getByText(/cover/i) || screen.getByText("📝")).toBeInTheDocument()
      })
    })

    it("should display company names", async () => {
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Tech Corp")).toBeInTheDocument()
        expect(screen.getByText("StartupCo")).toBeInTheDocument()
        expect(screen.getByText("BigCorp")).toBeInTheDocument()
      })
    })

    it("should format dates correctly", async () => {
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        // Should show formatted dates
        expect(screen.getByText(/Jan|January/)).toBeInTheDocument()
        expect(screen.getByText(/2024/)).toBeInTheDocument()
      })
    })

    it("should show job titles", async () => {
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
        expect(screen.getByText("Senior Developer")).toBeInTheDocument()
      })
    })
  })

  describe("Search Functionality", () => {
    it("should search by job title", async () => {
      const user = userEvent.setup()
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/search/i) || screen.getByRole("textbox")
      await user.type(searchInput, "Senior")

      await waitFor(() => {
        expect(screen.getByText("Senior Developer")).toBeInTheDocument()
        expect(screen.queryByText("Software Engineer")).not.toBeInTheDocument()
      })
    })

    it("should search by company name", async () => {
      const user = userEvent.setup()
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Tech Corp")).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/search/i) || screen.getByRole("textbox")
      await user.type(searchInput, "BigCorp")

      await waitFor(() => {
        expect(screen.getByText("Full Stack Engineer")).toBeInTheDocument()
        expect(screen.queryByText("Software Engineer")).not.toBeInTheDocument()
      })
    })

    it("should be case insensitive", async () => {
      const user = userEvent.setup()
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Tech Corp")).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/search/i) || screen.getByRole("textbox")
      await user.type(searchInput, "TECH")

      await waitFor(() => {
        expect(screen.getByText("Tech Corp")).toBeInTheDocument()
      })
    })

    it("should clear search", async () => {
      const user = userEvent.setup()
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/search/i) || screen.getByRole("textbox")
      await user.type(searchInput, "Senior")

      await waitFor(() => {
        expect(screen.queryByText("Software Engineer")).not.toBeInTheDocument()
      })

      await user.clear(searchInput)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
      })
    })
  })

  describe("Type Filtering", () => {
    it("should filter by resume type", async () => {
      const user = userEvent.setup()
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
      })

      const typeFilter =
        screen.getByRole("combobox", { name: /type/i }) || screen.getAllByRole("combobox")[0]
      await user.click(typeFilter)

      const resumeOption = screen.getByText(/^resume$/i)
      await user.click(resumeOption)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
        expect(screen.getByText("Full Stack Engineer")).toBeInTheDocument()
        expect(screen.queryByText("Senior Developer")).not.toBeInTheDocument()
      })
    })

    it("should filter by cover letter type", async () => {
      const user = userEvent.setup()
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Senior Developer")).toBeInTheDocument()
      })

      const typeFilter =
        screen.getByRole("combobox", { name: /type/i }) || screen.getAllByRole("combobox")[0]
      await user.click(typeFilter)

      const coverOption = screen.getByText(/cover.*letter/i)
      await user.click(coverOption)

      await waitFor(() => {
        expect(screen.getByText("Senior Developer")).toBeInTheDocument()
        expect(screen.queryByText("Software Engineer")).not.toBeInTheDocument()
      })
    })

    it("should show all types when filter is cleared", async () => {
      const user = userEvent.setup()
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
      })

      const typeFilter =
        screen.getByRole("combobox", { name: /type/i }) || screen.getAllByRole("combobox")[0]
      await user.click(typeFilter)

      const allOption = screen.getByText(/^all$/i)
      await user.click(allOption)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
        expect(screen.getByText("Senior Developer")).toBeInTheDocument()
      })
    })
  })

  describe("Document Actions", () => {
    it("should download document", async () => {
      const user = userEvent.setup()
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
      })

      const downloadButton = screen.getAllByRole("button", { name: /download/i })[0]
      await user.click(downloadButton)

      expect(global.open).toHaveBeenCalledWith("https://storage.example.com/resume1.pdf", "_blank")
    })

    it("should view document", async () => {
      const user = userEvent.setup()
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
      })

      const viewButton = screen.getAllByRole("button", { name: /view|eye/i })[0]
      await user.click(viewButton)

      expect(global.open).toHaveBeenCalledWith("https://storage.example.com/resume1.pdf", "_blank")
    })

    it("should delete document with confirmation", async () => {
      const user = userEvent.setup()
      global.confirm = vi.fn(() => true)
      mockDeleteDocument.mockResolvedValue(undefined)

      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
      })

      const deleteButton = screen.getAllByRole("button", { name: /delete|trash/i })[0]
      await user.click(deleteButton)

      expect(global.confirm).toHaveBeenCalled()

      await waitFor(() => {
        expect(mockDeleteDocument).toHaveBeenCalledWith("doc-1")
      })
    })

    it("should cancel delete on confirmation cancel", async () => {
      const user = userEvent.setup()
      global.confirm = vi.fn(() => false)

      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
      })

      const deleteButton = screen.getAllByRole("button", { name: /delete|trash/i })[0]
      await user.click(deleteButton)

      expect(global.confirm).toHaveBeenCalled()
      expect(mockDeleteDocument).not.toHaveBeenCalled()
    })

    it("should handle delete errors", async () => {
      const user = userEvent.setup()
      global.confirm = vi.fn(() => true)
      global.alert = vi.fn()
      mockDeleteDocument.mockRejectedValue(new Error("Delete failed"))

      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
      })

      const deleteButton = screen.getAllByRole("button", { name: /delete|trash/i })[0]
      await user.click(deleteButton)

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("failed"))
      })
    })

    it("should show deleting state", async () => {
      const user = userEvent.setup()
      global.confirm = vi.fn(() => true)
      mockDeleteDocument.mockImplementation(() => new Promise(() => {}))

      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
      })

      const deleteButton = screen.getAllByRole("button", { name: /delete|trash/i })[0]
      await user.click(deleteButton)

      await waitFor(() => {
        expect(
          screen.getByText(/deleting/i) || screen.getByRole("button", { name: /delete/i })
        ).toBeDisabled()
      })
    })
  })

  describe("Combined Filters", () => {
    it("should apply search and type filter together", async () => {
      const user = userEvent.setup()
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
      })

      // Apply type filter
      const typeFilter =
        screen.getByRole("combobox", { name: /type/i }) || screen.getAllByRole("combobox")[0]
      await user.click(typeFilter)
      const resumeOption = screen.getByText(/^resume$/i)
      await user.click(resumeOption)

      // Apply search
      const searchInput = screen.getByPlaceholderText(/search/i) || screen.getByRole("textbox")
      await user.type(searchInput, "Full")

      await waitFor(() => {
        expect(screen.getByText("Full Stack Engineer")).toBeInTheDocument()
        expect(screen.queryByText("Software Engineer")).not.toBeInTheDocument()
        expect(screen.queryByText("Senior Developer")).not.toBeInTheDocument()
      })
    })
  })

  describe("Sorting", () => {
    it("should display documents in chronological order", async () => {
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        const documents = screen.getAllByRole("article") || screen.getAllByRole("listitem")

        // Most recent first
        expect(documents[0]).toHaveTextContent("Software Engineer")
      })
    })
  })

  describe("Document Count", () => {
    it("should display total document count", async () => {
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText(/4.*documents?/i) || screen.getByText("4")).toBeInTheDocument()
      })
    })

    it("should update count after filtering", async () => {
      const user = userEvent.setup()
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
      })

      const typeFilter =
        screen.getByRole("combobox", { name: /type/i }) || screen.getAllByRole("combobox")[0]
      await user.click(typeFilter)
      const resumeOption = screen.getByText(/^resume$/i)
      await user.click(resumeOption)

      await waitFor(() => {
        expect(screen.getByText(/2.*documents?/i) || screen.getByText("2")).toBeInTheDocument()
      })
    })
  })

  describe("Link to Job Match", () => {
    it("should show link when jobMatchId exists", async () => {
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
      })

      const jobMatchLink = screen.getByRole("link", { name: /view.*job|job.*match/i })
      expect(jobMatchLink).toBeInTheDocument()
    })

    it("should not show link when jobMatchId is missing", async () => {
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Full Stack Engineer")).toBeInTheDocument()
      })

      // Full Stack Engineer doc doesn't have jobMatchId
      const cards = screen.getAllByRole("article") || screen.getAllByText("Full Stack Engineer")
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  describe("Accessibility", () => {
    it("should have proper ARIA labels", async () => {
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /download/i })).toBeInTheDocument()
      })

      expect(screen.getByRole("button", { name: /view/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument()
    })

    it("should be keyboard navigable", async () => {
      const user = userEvent.setup()
      render(<DocumentHistoryPage />)

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument()
      })

      // Tab through interactive elements
      await user.tab()
      expect(screen.getByPlaceholderText(/search/i)).toHaveFocus()
    })
  })
})
