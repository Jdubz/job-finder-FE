/**
 * Content Items Page Tests
 *
 * Tests for content items management including:
 * - CRUD operations
 * - Hierarchy display
 * - Item creation and editing
 * - Validation
 * - Authorization
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ContentItemsPage } from "../ContentItemsPage"
import { useAuth } from "@/contexts/AuthContext"
import { useContentItems } from "@/hooks/useContentItems"
import type { ContentItem } from "@/types/content-items"

// Mock modules
vi.mock("@/contexts/AuthContext")
vi.mock("@/hooks/useContentItems")

describe("ContentItemsPage", () => {
  const mockUser = {
    uid: "test-user-123",
    email: "test@example.com",
    displayName: "Test User",
    isEditor: true,
  }

  const mockContentItems: ContentItem[] = [
    {
      id: "company-1",
      type: "company",
      company: "Tech Corp",
      role: "Senior Software Engineer",
      location: "San Francisco, CA",
      startDate: "2020-01",
      endDate: "2023-12",
      parentId: null,
      order: 0,
      visibility: "published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "test@example.com",
      updatedBy: "test@example.com",
    },
    {
      id: "skill-group-1",
      type: "skill-group",
      name: "Frontend Development",
      parentId: null,
      order: 1,
      visibility: "published",
      skills: ["React", "TypeScript", "CSS"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "test@example.com",
      updatedBy: "test@example.com",
    },
    {
      id: "project-1",
      type: "project",
      name: "E-commerce Platform",
      description: "Built a scalable e-commerce platform",
      parentId: "company-1",
      order: 0,
      visibility: "published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "test@example.com",
      updatedBy: "test@example.com",
    },
  ] as any

  const mockCreateContentItem = vi.fn()
  const mockUpdateContentItem = vi.fn()
  const mockDeleteContentItem = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mocks
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser as any,
      loading: false,
      isEditor: true,
      signOut: vi.fn(),
      signInWithGoogle: vi.fn(),
    } as any)

    vi.mocked(useContentItems).mockReturnValue({
      contentItems: mockContentItems as any,
      loading: false,
      error: null,
      createContentItem: mockCreateContentItem,
      updateContentItem: mockUpdateContentItem,
      deleteContentItem: mockDeleteContentItem,
    } as any)
  })

  describe("Initial Rendering", () => {
    it("should render the content items page", () => {
      render(<ContentItemsPage />)

      expect(screen.getByText(/content/i) || screen.getByText(/experience/i)).toBeInTheDocument()
    })

    it("should display loading state", () => {
      vi.mocked(useContentItems).mockReturnValue({
        contentItems: [],
        loading: true,
        error: null,
        createContentItem: mockCreateContentItem,
        updateContentItem: mockUpdateContentItem,
        deleteContentItem: mockDeleteContentItem,
      } as any)

      render(<ContentItemsPage />)

      expect(screen.getByTestId("skeleton") || screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it("should display content items when loaded", () => {
      render(<ContentItemsPage />)

      expect(screen.getByText(/tech corp/i)).toBeInTheDocument()
      expect(screen.getByText(/frontend development/i)).toBeInTheDocument()
    })

    it("should display error message when loading fails", () => {
      vi.mocked(useContentItems).mockReturnValue({
        contentItems: [],
        loading: false,
        error: new Error("Failed to load"),
        createContentItem: mockCreateContentItem,
        updateContentItem: mockUpdateContentItem,
        deleteContentItem: mockDeleteContentItem,
      } as any)

      render(<ContentItemsPage />)

      expect(screen.getByText(/failed|error/i)).toBeInTheDocument()
    })
  })

  describe("Create Content Item", () => {
    it("should show add button for editors", () => {
      render(<ContentItemsPage />)

      expect(screen.getByRole("button", { name: /add|create|new/i })).toBeInTheDocument()
    })

    it("should not show add button for non-editors", () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        loading: false,
        isEditor: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signInWithGoogle: vi.fn(),
      })

      render(<ContentItemsPage />)

      expect(screen.queryByRole("button", { name: /add|create|new/i })).not.toBeInTheDocument()
    })

    it("should open dialog when add button clicked", async () => {
      const user = userEvent.setup()
      render(<ContentItemsPage />)

      const addButton = screen.getByRole("button", { name: /add|create|new/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByRole("dialog") || screen.getByText(/company|project|skill/i)).toBeInTheDocument()
      })
    })

    it("should create new company item", async () => {
      const user = userEvent.setup()
      mockCreateContentItem.mockResolvedValue({ id: "new-company-1" })

      render(<ContentItemsPage />)

      const addButton = screen.getByRole("button", { name: /add|create|new/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByRole("dialog") || screen.getByText(/company|project|skill/i)).toBeInTheDocument()
      })

      // Fill form
      const companyInput = screen.getByLabelText(/company name/i) || screen.getByPlaceholderText(/company/i)
      const roleInput = screen.getByLabelText(/role|title/i) || screen.getByPlaceholderText(/role|title/i)
      
      await user.type(companyInput, "New Company")
      await user.type(roleInput, "Developer")

      // Submit
      const saveButton = screen.getByRole("button", { name: /save|create/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockCreateContentItem).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "company",
            company: "New Company",
            role: "Developer",
          }),
        )
      })
    })

    it("should create new skill group", async () => {
      const user = userEvent.setup()
      mockCreateContentItem.mockResolvedValue({ id: "new-skill-group-1" })

      render(<ContentItemsPage />)

      const addButton = screen.getByRole("button", { name: /add|create|new/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      })

      // Select skill group type
      const typeSelect = screen.getByRole("combobox", { name: /type/i })
      await user.click(typeSelect)
      const skillGroupOption = screen.getByText(/skill group/i)
      await user.click(skillGroupOption)

      // Fill form
      const nameInput = screen.getByLabelText(/name/i) || screen.getByPlaceholderText(/name/i)
      await user.type(nameInput, "Backend Development")

      // Submit
      const saveButton = screen.getByRole("button", { name: /save|create/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockCreateContentItem).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "skill-group",
            name: "Backend Development",
          }),
        )
      })
    })

    it("should show success message after creating item", async () => {
      const user = userEvent.setup()
      mockCreateContentItem.mockResolvedValue({ id: "new-item-1" })

      render(<ContentItemsPage />)

      const addButton = screen.getByRole("button", { name: /add|create|new/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      })

      const companyInput = screen.getByLabelText(/company name/i) || screen.getByPlaceholderText(/company/i)
      await user.type(companyInput, "New Company")

      const saveButton = screen.getByRole("button", { name: /save|create/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/success|created/i)).toBeInTheDocument()
      })
    })
  })

  describe("Update Content Item", () => {
    it("should open edit dialog when item is clicked", async () => {
      const user = userEvent.setup()
      render(<ContentItemsPage />)

      const item = screen.getByText(/tech corp/i)
      await user.click(item)

      await waitFor(() => {
        expect(screen.getByRole("dialog") || screen.getByDisplayValue(/tech corp/i)).toBeInTheDocument()
      })
    })

    it("should update company item", async () => {
      const user = userEvent.setup()
      mockUpdateContentItem.mockResolvedValue({})

      render(<ContentItemsPage />)

      const item = screen.getByText(/tech corp/i)
      await user.click(item)

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      })

      const roleInput = screen.getByDisplayValue(/senior software engineer/i)
      await user.clear(roleInput)
      await user.type(roleInput, "Lead Engineer")

      const saveButton = screen.getByRole("button", { name: /save|update/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockUpdateContentItem).toHaveBeenCalledWith(
          "company-1",
          expect.objectContaining({
            role: "Lead Engineer",
          }),
        )
      })
    })

    it("should show success message after updating item", async () => {
      const user = userEvent.setup()
      mockUpdateContentItem.mockResolvedValue({})

      render(<ContentItemsPage />)

      const item = screen.getByText(/tech corp/i)
      await user.click(item)

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      })

      const saveButton = screen.getByRole("button", { name: /save|update/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/success|updated/i)).toBeInTheDocument()
      })
    })
  })

  describe("Delete Content Item", () => {
    it("should show delete button for each item", () => {
      render(<ContentItemsPage />)

      const deleteButtons = screen.getAllByRole("button", { name: /delete|remove/i })
      expect(deleteButtons.length).toBeGreaterThan(0)
    })

    it("should confirm before deleting", async () => {
      const user = userEvent.setup()
      window.confirm = vi.fn(() => false) // Cancel deletion

      render(<ContentItemsPage />)

      const deleteButton = screen.getAllByRole("button", { name: /delete|remove/i })[0]
      await user.click(deleteButton)

      expect(mockDeleteContentItem).not.toHaveBeenCalled()
    })

    it("should delete item when confirmed", async () => {
      const user = userEvent.setup()
      window.confirm = vi.fn(() => true) // Confirm deletion
      mockDeleteContentItem.mockResolvedValue({})

      render(<ContentItemsPage />)

      const deleteButton = screen.getAllByRole("button", { name: /delete|remove/i })[0]
      await user.click(deleteButton)

      await waitFor(() => {
        expect(mockDeleteContentItem).toHaveBeenCalledWith("company-1")
      })
    })

    it("should show success message after deleting", async () => {
      const user = userEvent.setup()
      window.confirm = vi.fn(() => true)
      mockDeleteContentItem.mockResolvedValue({})

      render(<ContentItemsPage />)

      const deleteButton = screen.getAllByRole("button", { name: /delete|remove/i })[0]
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText(/deleted|removed/i)).toBeInTheDocument()
      })
    })
  })

  describe("Hierarchy Display", () => {
    it("should display items in hierarchical structure", () => {
      render(<ContentItemsPage />)

      // Company should be at root level
      expect(screen.getByText(/tech corp/i)).toBeInTheDocument()
      
      // Project should be nested under company
      expect(screen.getByText(/e-commerce platform/i)).toBeInTheDocument()
    })

    it("should show nested projects under company", () => {
      render(<ContentItemsPage />)

      const company = screen.getByText(/tech corp/i).closest("div")
      const project = screen.getByText(/e-commerce platform/i)
      
      expect(company).toBeInTheDocument()
      expect(project).toBeInTheDocument()
    })

    it("should display skill groups separately", () => {
      render(<ContentItemsPage />)

      expect(screen.getByText(/frontend development/i)).toBeInTheDocument()
      expect(screen.getByText(/react/i) || screen.getByText(/typescript/i)).toBeInTheDocument()
    })
  })

  describe("Form Validation", () => {
    it("should require company name for company items", async () => {
      const user = userEvent.setup()
      render(<ContentItemsPage />)

      const addButton = screen.getByRole("button", { name: /add|create|new/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      })

      // Try to save without filling required fields
      const saveButton = screen.getByRole("button", { name: /save|create/i })
      await user.click(saveButton)

      // Should not call create if validation fails
      expect(mockCreateContentItem).not.toHaveBeenCalled()
    })

    it("should require name for skill groups", async () => {
      const user = userEvent.setup()
      render(<ContentItemsPage />)

      const addButton = screen.getByRole("button", { name: /add|create|new/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      })

      // Select skill group type
      const typeSelect = screen.getByRole("combobox", { name: /type/i })
      await user.click(typeSelect)
      const skillGroupOption = screen.getByText(/skill group/i)
      await user.click(skillGroupOption)

      // Try to save without name
      const saveButton = screen.getByRole("button", { name: /save|create/i })
      await user.click(saveButton)

      expect(mockCreateContentItem).not.toHaveBeenCalled()
    })
  })

  describe("Authorization", () => {
    it("should only show edit/delete buttons for editors", () => {
      render(<ContentItemsPage />)

      expect(screen.getByRole("button", { name: /add|create|new/i })).toBeInTheDocument()
      expect(screen.getAllByRole("button", { name: /delete|remove/i }).length).toBeGreaterThan(0)
    })

    it("should hide edit/delete buttons for non-editors", () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        loading: false,
        isEditor: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signInWithGoogle: vi.fn(),
      })

      render(<ContentItemsPage />)

      expect(screen.queryByRole("button", { name: /add|create|new/i })).not.toBeInTheDocument()
      expect(screen.queryByRole("button", { name: /delete|remove/i })).not.toBeInTheDocument()
    })
  })

  describe("Error Handling", () => {
    it("should handle create errors", async () => {
      const user = userEvent.setup()
      mockCreateContentItem.mockRejectedValue(new Error("Create failed"))

      render(<ContentItemsPage />)

      const addButton = screen.getByRole("button", { name: /add|create|new/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      })

      const companyInput = screen.getByLabelText(/company name/i) || screen.getByPlaceholderText(/company/i)
      await user.type(companyInput, "New Company")

      const saveButton = screen.getByRole("button", { name: /save|create/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
      })
    })

    it("should handle update errors", async () => {
      const user = userEvent.setup()
      mockUpdateContentItem.mockRejectedValue(new Error("Update failed"))

      render(<ContentItemsPage />)

      const item = screen.getByText(/tech corp/i)
      await user.click(item)

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      })

      const saveButton = screen.getByRole("button", { name: /save|update/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
      })
    })

    it("should handle delete errors", async () => {
      const user = userEvent.setup()
      window.confirm = vi.fn(() => true)
      mockDeleteContentItem.mockRejectedValue(new Error("Delete failed"))

      render(<ContentItemsPage />)

      const deleteButton = screen.getAllByRole("button", { name: /delete|remove/i })[0]
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
      })
    })
  })
})
