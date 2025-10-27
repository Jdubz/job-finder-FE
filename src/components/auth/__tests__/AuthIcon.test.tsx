/**
 * AuthIcon Component Tests
 *
 * Tests for the AuthIcon component functionality
 * 
 * NOTE: These tests are temporarily skipped due to React 19 compatibility issues
 * with @testing-library/react and React.act. Will be re-enabled when RTL updates.
 */

import { describe, it, expect, beforeEach, vi, type Mock } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { AuthIcon } from "../AuthIcon"
import { useAuth } from "@/contexts/AuthContext"

// Mock dependencies
vi.mock("@/contexts/AuthContext")

const mockUseAuth = useAuth as Mock

// Mock user data
const mockUser = {
  uid: "test-user-123",
  email: "test@example.com",
  displayName: "Test User",
}

const mockEditorUser = {
  uid: "editor-user-456",
  email: "editor@example.com",
  displayName: "Editor User",
}

describe("AuthIcon", () => {
  const defaultProps = {
    onClick: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mocks
    mockUseAuth.mockReturnValue({
      user: null,
      isEditor: false,
      loading: false,
    })
  })

  describe.skip("rendering", () => {
    it("should render loading state when loading", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isEditor: false,
        loading: true,
      })

      render(<AuthIcon {...defaultProps} />)

      const button = screen.getByRole("button", { name: "Loading authentication status" })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
      expect(button).toHaveClass("opacity-50")
    })

    it("should render not signed in state", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isEditor: false,
        loading: false,
      })

      render(<AuthIcon {...defaultProps} />)

      const button = screen.getByRole("button", {
        name: /not signed in - click to learn about authentication/i,
      })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass("bg-muted", "hover:bg-muted/80")
    })

    it("should render viewer state for non-editor user", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isEditor: false,
        loading: false,
      })

      render(<AuthIcon {...defaultProps} />)

      const button = screen.getByRole("button", { name: /signed in as viewer/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass("bg-secondary", "hover:bg-secondary/80")
    })

    it("should render editor state for editor user", () => {
      mockUseAuth.mockReturnValue({
        user: mockEditorUser,
        isEditor: true,
        loading: false,
      })

      render(<AuthIcon {...defaultProps} />)

      const button = screen.getByRole("button", { name: /signed in as editor/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass("bg-primary", "hover:bg-primary/90")
    })
  })

  describe.skip("interactions", () => {
    it("should call onClick when clicked", () => {
      const mockOnClick = vi.fn()
      render(<AuthIcon onClick={mockOnClick} />)

      const button = screen.getByRole("button")
      fireEvent.click(button)

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it("should not call onClick when loading", () => {
      const mockOnClick = vi.fn()
      mockUseAuth.mockReturnValue({
        user: null,
        isEditor: false,
        loading: true,
      })

      render(<AuthIcon onClick={mockOnClick} />)

      const button = screen.getByRole("button", { name: "Loading authentication status" })
      fireEvent.click(button)

      expect(mockOnClick).not.toHaveBeenCalled()
    })
  })

  describe.skip("accessibility", () => {
    it("should have proper ARIA labels for not signed in state", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isEditor: false,
        loading: false,
      })

      render(<AuthIcon {...defaultProps} />)

      const button = screen.getByRole("button", {
        name: /not signed in - click to learn about authentication/i,
      })
      expect(button).toHaveAttribute(
        "aria-label",
        "Not signed in - Click to learn about authentication"
      )
      expect(button).toHaveAttribute("title", "Not signed in - Click to learn about authentication")
    })

    it("should have proper ARIA labels for viewer state", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isEditor: false,
        loading: false,
      })

      render(<AuthIcon {...defaultProps} />)

      const button = screen.getByRole("button", { name: /signed in as viewer/i })
      expect(button).toHaveAttribute(
        "aria-label",
        "Signed in as Viewer - Click for account options"
      )
      expect(button).toHaveAttribute("title", "Signed in as Viewer - Click for account options")
    })

    it("should have proper ARIA labels for editor state", () => {
      mockUseAuth.mockReturnValue({
        user: mockEditorUser,
        isEditor: true,
        loading: false,
      })

      render(<AuthIcon {...defaultProps} />)

      const button = screen.getByRole("button", { name: /signed in as editor/i })
      expect(button).toHaveAttribute(
        "aria-label",
        "Signed in as Editor - Click for account options"
      )
      expect(button).toHaveAttribute("title", "Signed in as Editor - Click for account options")
    })

    it("should have proper ARIA labels for loading state", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isEditor: false,
        loading: true,
      })

      render(<AuthIcon {...defaultProps} />)

      const button = screen.getByRole("button", { name: "Loading authentication status" })
      expect(button).toHaveAttribute("aria-label", "Loading authentication status")
    })
  })

  describe.skip("styling", () => {
    it("should apply custom className", () => {
      render(<AuthIcon {...defaultProps} className="custom-class" />)

      const button = screen.getByRole("button")
      expect(button).toHaveClass("custom-class")
    })

    it("should have correct base classes", () => {
      render(<AuthIcon {...defaultProps} />)

      const button = screen.getByRole("button")
      expect(button).toHaveClass(
        "w-8",
        "h-8",
        "rounded-full",
        "flex",
        "items-center",
        "justify-center",
        "transition-colors"
      )
    })

    it("should have correct icon classes", () => {
      render(<AuthIcon {...defaultProps} />)

      const icon = screen.getByRole("button").querySelector("svg")
      expect(icon).toHaveClass("w-4", "h-4")
    })
  })

  describe.skip("state transitions", () => {
    it("should handle transition from loading to not signed in", () => {
      // Start with loading
      mockUseAuth.mockReturnValue({
        user: null,
        isEditor: false,
        loading: true,
      })
      const { rerender } = render(<AuthIcon {...defaultProps} />)

      expect(
        screen.getByRole("button", { name: "Loading authentication status" })
      ).toBeInTheDocument()

      // Transition to not signed in
      mockUseAuth.mockReturnValue({
        user: null,
        isEditor: false,
        loading: false,
      })

      // Force re-render with new mock
      rerender(<AuthIcon {...defaultProps} />)

      expect(
        screen.getByRole("button", { name: /not signed in - click to learn about authentication/i })
      ).toBeInTheDocument()
    })

    it("should handle transition from not signed in to signed in", () => {
      // Start not signed in
      mockUseAuth.mockReturnValue({
        user: null,
        isEditor: false,
        loading: false,
      })
      const { rerender } = render(<AuthIcon {...defaultProps} />)

      expect(
        screen.getByRole("button", { name: /not signed in - click to learn about authentication/i })
      ).toBeInTheDocument()

      // Transition to signed in as viewer
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isEditor: false,
        loading: false,
      })
      rerender(<AuthIcon {...defaultProps} />)

      expect(
        screen.getByRole("button", { name: /signed in as viewer - click for account options/i })
      ).toBeInTheDocument()
    })

    it("should handle transition from viewer to editor", () => {
      // Start as viewer
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isEditor: false,
        loading: false,
      })
      const { rerender } = render(<AuthIcon {...defaultProps} />)

      expect(
        screen.getByRole("button", { name: /signed in as viewer - click for account options/i })
      ).toBeInTheDocument()

      // Transition to editor
      mockUseAuth.mockReturnValue({
        user: mockEditorUser,
        isEditor: true,
        loading: false,
      })
      rerender(<AuthIcon {...defaultProps} />)

      expect(
        screen.getByRole("button", { name: /signed in as editor - click for account options/i })
      ).toBeInTheDocument()
    })
  })

  describe.skip("edge cases", () => {
    it("should handle undefined user", () => {
      mockUseAuth.mockReturnValue({
        user: undefined,
        isEditor: false,
        loading: false,
      })

      render(<AuthIcon {...defaultProps} />)

      const button = screen.getByRole("button", {
        name: /not signed in - click to learn about authentication/i,
      })
      expect(button).toBeInTheDocument()
    })

    it("should handle undefined isEditor", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isEditor: undefined,
        loading: false,
      })

      render(<AuthIcon {...defaultProps} />)

      const button = screen.getByRole("button", { name: /signed in as viewer/i })
      expect(button).toBeInTheDocument()
    })

    it("should handle undefined loading", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isEditor: false,
        loading: undefined,
      })

      render(<AuthIcon {...defaultProps} />)

      const button = screen.getByRole("button", {
        name: /not signed in - click to learn about authentication/i,
      })
      expect(button).toBeInTheDocument()
    })
  })

  describe.skip("responsive design", () => {
    it("should handle different screen sizes", () => {
      render(<AuthIcon {...defaultProps} />)

      const button = screen.getByRole("button")
      expect(button).toBeInTheDocument()
    })
  })
})
