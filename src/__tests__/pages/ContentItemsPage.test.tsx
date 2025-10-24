import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ContentItemsPage } from "@/pages/content-items/ContentItemsPage"

// Mock the auth context
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    isEditor: true,
  }),
}))

// Mock the content items hook
vi.mock("@/hooks/useContentItems", () => ({
  useContentItems: () => ({
    contentItems: [],
    loading: false,
    error: null,
    createContentItem: vi.fn(),
    updateContentItem: vi.fn(),
    deleteContentItem: vi.fn(),
  }),
}))

// Mock the utils
vi.mock("@/lib/utils", () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(" "),
}))

describe("ContentItemsPage", () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the page with header", () => {
    render(<ContentItemsPage />)

    expect(screen.getByText("Experience")).toBeInTheDocument()
    expect(
      screen.getByText("Manage your professional experience and portfolio")
    ).toBeInTheDocument()
  })

  it("shows editor actions when user is editor", () => {
    render(<ContentItemsPage />)

    expect(screen.getByText("Add Content")).toBeInTheDocument()
    expect(screen.getByText("Export")).toBeInTheDocument()
    expect(screen.getByText("Import")).toBeInTheDocument()
    expect(screen.getByText("Download Resume")).toBeInTheDocument()
    expect(screen.getByText("Upload Resume")).toBeInTheDocument()
  })

  it("handles resume download", async () => {
    // Mock document methods
    const mockLink = {
      href: "",
      download: "",
      target: "",
      click: vi.fn(),
    }
    const mockAppendChild = vi.fn()
    const mockRemoveChild = vi.fn()

    Object.defineProperty(document, "createElement", {
      value: vi.fn().mockReturnValue(mockLink),
    })
    Object.defineProperty(document.body, "appendChild", {
      value: mockAppendChild,
    })
    Object.defineProperty(document.body, "removeChild", {
      value: mockRemoveChild,
    })

    render(<ContentItemsPage />)

    const downloadButton = screen.getByText("Download Resume")
    await user.click(downloadButton)

    expect(mockLink.href).toBe("/resume.pdf")
    expect(mockLink.download).toBe("resume.pdf")
    expect(mockLink.click).toHaveBeenCalled()
  })

  it("handles resume upload with valid file", async () => {
    render(<ContentItemsPage />)

    const uploadButton = screen.getByText("Upload Resume")
    await user.click(uploadButton)

    // Create a mock file
    const file = new File(["test content"], "resume.pdf", { type: "application/pdf" })

    // Mock the file input change event
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      })

      const event = new Event("change", { bubbles: true })
      fileInput.dispatchEvent(event)
    }

    await waitFor(() => {
      expect(screen.getByText('Resume "resume.pdf" uploaded successfully')).toBeInTheDocument()
    })
  })

  it("handles resume upload with invalid file type", async () => {
    render(<ContentItemsPage />)

    const uploadButton = screen.getByText("Upload Resume")
    await user.click(uploadButton)

    // Create a mock file with invalid type
    const file = new File(["test content"], "resume.txt", { type: "text/plain" })

    // Mock the file input change event
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      })

      const event = new Event("change", { bubbles: true })
      fileInput.dispatchEvent(event)
    }

    await waitFor(() => {
      expect(screen.getByText("Please select a PDF, DOC, or DOCX file.")).toBeInTheDocument()
    })
  })

  it("handles resume upload with file too large", async () => {
    render(<ContentItemsPage />)

    const uploadButton = screen.getByText("Upload Resume")
    await user.click(uploadButton)

    // Create a mock file that's too large (11MB)
    const largeContent = "x".repeat(11 * 1024 * 1024)
    const file = new File([largeContent], "resume.pdf", { type: "application/pdf" })

    // Mock the file input change event
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      Object.defineProperty(fileInput, "files", {
        value: [file],
        writable: false,
      })

      const event = new Event("change", { bubbles: true })
      fileInput.dispatchEvent(event)
    }

    await waitFor(() => {
      expect(screen.getByText("File size must be less than 10MB.")).toBeInTheDocument()
    })
  })

  it("shows empty state when no content items", () => {
    render(<ContentItemsPage />)

    expect(screen.getByText("No work experience yet")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Add your professional experience to showcase your career history and accomplishments."
      )
    ).toBeInTheDocument()
  })
})
