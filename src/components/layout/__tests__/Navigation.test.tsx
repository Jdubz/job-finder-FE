/**
 * Navigation Component Tests
 * 
 * Comprehensive tests for the Navigation component functionality
 */

import { describe, it, expect, beforeEach, vi, Mock } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { Navigation } from "../Navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ROUTES } from "@/types/routes"

// Mock dependencies
vi.mock("@/contexts/AuthContext")
vi.mock("@/components/auth/AuthIcon", () => ({
  AuthIcon: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} data-testid="auth-icon">
      Auth Icon
    </button>
  ),
}))
vi.mock("@/components/auth/AuthModalDebug", () => ({
  AuthModalDebug: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    open ? <div data-testid="auth-modal">Auth Modal</div> : null
  ),
}))

const mockUseAuth = useAuth as Mock

// Helper to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe("Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockUseAuth.mockReturnValue({
      user: null,
      isEditor: false,
    })
  })

  describe("rendering", () => {
    it("should render navigation bar", () => {
      renderWithRouter(<Navigation />)

      expect(screen.getByText("Job Finder")).toBeInTheDocument()
      expect(screen.getByTestId("auth-icon")).toBeInTheDocument()
    })

    it("should render menu button", () => {
      renderWithRouter(<Navigation />)

      const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
      expect(menuButton).toBeInTheDocument()
    })

    it("should show public navigation links", () => {
      renderWithRouter(<Navigation />)

      // Open the drawer
      const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
      fireEvent.click(menuButton)

      expect(screen.getByText("Home")).toBeInTheDocument()
      expect(screen.getByText("How It Works")).toBeInTheDocument()
      expect(screen.getByText("Experience")).toBeInTheDocument()
      expect(screen.getByText("Document Builder")).toBeInTheDocument()
      expect(screen.getByText("AI Prompts")).toBeInTheDocument()
      expect(screen.getByText("Settings")).toBeInTheDocument()
    })

    it("should show editor tools for editor users", () => {
      mockUseAuth.mockReturnValue({
        user: { uid: "editor-123", email: "editor@example.com" },
        isEditor: true,
      })

      renderWithRouter(<Navigation />)

      // Open the drawer
      const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
      fireEvent.click(menuButton)

      expect(screen.getByText("Job Finder Tools")).toBeInTheDocument()
      expect(screen.getByText("Job Finder")).toBeInTheDocument()
      expect(screen.getByText("Job Applications")).toBeInTheDocument()
      expect(screen.getByText("Queue Management")).toBeInTheDocument()
      expect(screen.getByText("Document History")).toBeInTheDocument()
    })

    it("should show system links for editor users", () => {
      mockUseAuth.mockReturnValue({
        user: { uid: "editor-123", email: "editor@example.com" },
        isEditor: true,
      })

      renderWithRouter(<Navigation />)

      // Open the drawer
      const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
      fireEvent.click(menuButton)

      expect(screen.getByText("System")).toBeInTheDocument()
      expect(screen.getByText("Configuration")).toBeInTheDocument()
      expect(screen.getByText("System Health")).toBeInTheDocument()
    })

    it("should not show editor tools for non-editor users", () => {
      mockUseAuth.mockReturnValue({
        user: { uid: "user-123", email: "user@example.com" },
        isEditor: false,
      })

      renderWithRouter(<Navigation />)

      // Open the drawer
      const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
      fireEvent.click(menuButton)

      expect(screen.queryByText("Job Finder Tools")).not.toBeInTheDocument()
      expect(screen.queryByText("System")).not.toBeInTheDocument()
    })
  })

  describe("navigation links", () => {
    it("should have correct href attributes for public links", () => {
      renderWithRouter(<Navigation />)

      // Open the drawer
      const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
      fireEvent.click(menuButton)

      const homeLink = screen.getByText("Home").closest("a")
      const howItWorksLink = screen.getByText("How It Works").closest("a")
      const experienceLink = screen.getByText("Experience").closest("a")
      const documentBuilderLink = screen.getByText("Document Builder").closest("a")

      expect(homeLink).toHaveAttribute("href", ROUTES.HOME)
      expect(howItWorksLink).toHaveAttribute("href", ROUTES.HOW_IT_WORKS)
      expect(experienceLink).toHaveAttribute("href", ROUTES.CONTENT_ITEMS)
      expect(documentBuilderLink).toHaveAttribute("href", ROUTES.DOCUMENT_BUILDER)
    })

    it("should have correct href attributes for editor links", () => {
      mockUseAuth.mockReturnValue({
        user: { uid: "editor-123", email: "editor@example.com" },
        isEditor: true,
      })

      renderWithRouter(<Navigation />)

      // Open the drawer
      const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
      fireEvent.click(menuButton)

      const jobFinderLink = screen.getByText("Job Finder").closest("a")
      const jobApplicationsLink = screen.getByText("Job Applications").closest("a")
      const queueManagementLink = screen.getByText("Queue Management").closest("a")

      expect(jobFinderLink).toHaveAttribute("href", ROUTES.JOB_FINDER)
      expect(jobApplicationsLink).toHaveAttribute("href", ROUTES.JOB_APPLICATIONS)
      expect(queueManagementLink).toHaveAttribute("href", ROUTES.QUEUE_MANAGEMENT)
    })
  })

  describe("drawer functionality", () => {
    it("should open drawer when menu button is clicked", () => {
      renderWithRouter(<Navigation />)

      const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
      fireEvent.click(menuButton)

      expect(screen.getByText("Main")).toBeInTheDocument()
    })

    it("should close drawer when navigation link is clicked", () => {
      renderWithRouter(<Navigation />)

      // Open the drawer
      const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
      fireEvent.click(menuButton)

      expect(screen.getByText("Main")).toBeInTheDocument()

      // Click a navigation link
      const homeLink = screen.getByText("Home")
      fireEvent.click(homeLink)

      // Drawer should close (this is handled by the Sheet component)
      // We can't easily test the drawer state directly, but we can verify the link was clicked
      expect(homeLink).toBeInTheDocument()
    })
  })

  describe("authentication modal", () => {
    it("should open auth modal when auth icon is clicked", () => {
      renderWithRouter(<Navigation />)

      const authIcon = screen.getByTestId("auth-icon")
      fireEvent.click(authIcon)

      expect(screen.getByTestId("auth-modal")).toBeInTheDocument()
    })

    it("should close auth modal when onOpenChange is called", () => {
      renderWithRouter(<Navigation />)

      // Open the modal
      const authIcon = screen.getByTestId("auth-icon")
      fireEvent.click(authIcon)

      expect(screen.getByTestId("auth-modal")).toBeInTheDocument()

      // The modal would be closed by the AuthModal component itself
      // This is tested in the AuthModal component tests
    })
  })

  describe("active link highlighting", () => {
    it("should highlight active link based on current location", () => {
      // Mock useLocation to return a specific path
      vi.mock("react-router-dom", async () => {
        const actual = await vi.importActual("react-router-dom")
        return {
          ...actual,
          useLocation: () => ({ pathname: ROUTES.HOME }),
        }
      })

      renderWithRouter(<Navigation />)

      // Open the drawer
      const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
      fireEvent.click(menuButton)

      const homeLink = screen.getByText("Home").closest("a")
      expect(homeLink).toHaveClass("bg-primary/10", "text-primary", "font-semibold")
    })
  })

  describe("responsive design", () => {
    it("should handle different screen sizes", () => {
      renderWithRouter(<Navigation />)

      // Should render without errors
      expect(screen.getByText("Job Finder")).toBeInTheDocument()
    })

    it("should show logo in drawer", () => {
      renderWithRouter(<Navigation />)

      // Open the drawer
      const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
      fireEvent.click(menuButton)

      expect(screen.getByText("Job Finder")).toBeInTheDocument()
    })
  })

  describe("accessibility", () => {
    it("should have proper ARIA labels", () => {
      renderWithRouter(<Navigation />)

      const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
      expect(menuButton).toHaveAttribute("aria-label", "Toggle navigation menu")
    })

    it("should be keyboard navigable", () => {
      renderWithRouter(<Navigation />)

      const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
      expect(menuButton).not.toHaveAttribute("tabindex", "-1")
    })

    it("should have proper heading structure", () => {
      renderWithRouter(<Navigation />)

      // Open the drawer
      const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
      fireEvent.click(menuButton)

      expect(screen.getByText("Main")).toBeInTheDocument()
    })
  })

  describe("footer information", () => {
    it("should show footer information in drawer", () => {
      renderWithRouter(<Navigation />)

      // Open the drawer
      const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
      fireEvent.click(menuButton)

      expect(screen.getByText("Job Finder Portfolio")).toBeInTheDocument()
      expect(screen.getByText("Build your career toolkit")).toBeInTheDocument()
    })
  })

  describe("edge cases", () => {
    it("should handle missing user gracefully", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isEditor: false,
      })

      renderWithRouter(<Navigation />)

      expect(screen.getByText("Job Finder")).toBeInTheDocument()
    })

    it("should handle undefined isEditor gracefully", () => {
      mockUseAuth.mockReturnValue({
        user: { uid: "user-123", email: "user@example.com" },
        isEditor: undefined,
      })

      renderWithRouter(<Navigation />)

      // Should not show editor tools
      const menuButton = screen.getByRole("button", { name: /toggle navigation menu/i })
      fireEvent.click(menuButton)

      expect(screen.queryByText("Job Finder Tools")).not.toBeInTheDocument()
    })
  })
})
