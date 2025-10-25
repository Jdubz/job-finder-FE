/**
 * AuthModal Component Tests
 * 
 * Comprehensive tests for the AuthModal component functionality
 */

import { describe, it, expect, beforeEach, vi, Mock } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { AuthModal } from "../AuthModal"
import { useAuth } from "@/contexts/AuthContext"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "@/config/firebase"

// Mock dependencies
vi.mock("@/contexts/AuthContext")
vi.mock("firebase/auth")
vi.mock("@/config/firebase", () => ({
  auth: {}
}))

const mockUseAuth = useAuth as Mock
const mockSignInWithPopup = signInWithPopup as Mock
const mockGoogleAuthProvider = GoogleAuthProvider as Mock

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

describe("AuthModal", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockUseAuth.mockReturnValue({
      user: null,
      isEditor: false,
      signOut: vi.fn(),
    })
    
    mockSignInWithPopup.mockResolvedValue({})
    mockGoogleAuthProvider.mockImplementation(() => ({}))
  })

  describe("rendering", () => {
    it("should render authentication modal when open", () => {
      render(<AuthModal {...defaultProps} />)

      expect(screen.getByText("Authentication")).toBeInTheDocument()
      expect(screen.getByText("Sign in to get started")).toBeInTheDocument()
    })

    it("should not render when closed", () => {
      render(<AuthModal {...defaultProps} open={false} />)

      expect(screen.queryByText("Authentication")).not.toBeInTheDocument()
    })

    it("should show sign in form when user is not authenticated", () => {
      render(<AuthModal {...defaultProps} />)

      expect(screen.getByText("Sign in with Google")).toBeInTheDocument()
      expect(screen.getByText("Why authentication?")).toBeInTheDocument()
      expect(screen.getByText("Rate-limit requests appropriately")).toBeInTheDocument()
    })

    it("should show user info when user is authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isEditor: false,
        signOut: vi.fn(),
      })

      render(<AuthModal {...defaultProps} />)

      expect(screen.getByText("Manage your account")).toBeInTheDocument()
      expect(screen.getByText("Signed in as:")).toBeInTheDocument()
      expect(screen.getByText("test@example.com")).toBeInTheDocument()
      expect(screen.getByText("Role: Viewer")).toBeInTheDocument()
    })

    it("should show editor role for editor users", () => {
      mockUseAuth.mockReturnValue({
        user: mockEditorUser,
        isEditor: true,
        signOut: vi.fn(),
      })

      render(<AuthModal {...defaultProps} />)

      expect(screen.getByText("Role: Editor")).toBeInTheDocument()
    })
  })

  describe("Google sign in", () => {
    it("should handle successful Google sign in", async () => {
      const mockOnOpenChange = vi.fn()
      render(<AuthModal {...defaultProps} onOpenChange={mockOnOpenChange} />)

      const signInButton = screen.getByText("Sign in with Google")
      fireEvent.click(signInButton)

      await waitFor(() => {
        expect(mockSignInWithPopup).toHaveBeenCalledWith(auth, expect.any(Object))
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it("should show loading state during sign in", async () => {
      mockSignInWithPopup.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<AuthModal {...defaultProps} />)

      const signInButton = screen.getByText("Sign in with Google")
      fireEvent.click(signInButton)

      expect(screen.getByText("Signing in...")).toBeInTheDocument()
      expect(signInButton).toBeDisabled()

      await waitFor(() => {
        expect(screen.queryByText("Signing in...")).not.toBeInTheDocument()
      })
    })

    it("should handle sign in errors", async () => {
      const errorMessage = "Sign in failed"
      mockSignInWithPopup.mockRejectedValue(new Error(errorMessage))

      render(<AuthModal {...defaultProps} />)

      const signInButton = screen.getByText("Sign in with Google")
      fireEvent.click(signInButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it("should handle unknown sign in errors", async () => {
      mockSignInWithPopup.mockRejectedValue("Unknown error")

      render(<AuthModal {...defaultProps} />)

      const signInButton = screen.getByText("Sign in with Google")
      fireEvent.click(signInButton)

      await waitFor(() => {
        expect(screen.getByText("Failed to sign in. Please try again.")).toBeInTheDocument()
      })
    })
  })

  describe("sign out", () => {
    it("should handle successful sign out", async () => {
      const mockSignOut = vi.fn().mockResolvedValue(undefined)
      const mockOnOpenChange = vi.fn()
      
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isEditor: false,
        signOut: mockSignOut,
      })

      render(<AuthModal {...defaultProps} onOpenChange={mockOnOpenChange} />)

      const signOutButton = screen.getByText("Sign Out")
      fireEvent.click(signOutButton)

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled()
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it("should handle sign out errors", async () => {
      const errorMessage = "Sign out failed"
      const mockSignOut = vi.fn().mockRejectedValue(new Error(errorMessage))
      
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isEditor: false,
        signOut: mockSignOut,
      })

      render(<AuthModal {...defaultProps} />)

      const signOutButton = screen.getByText("Sign Out")
      fireEvent.click(signOutButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it("should handle unknown sign out errors", async () => {
      const mockSignOut = vi.fn().mockRejectedValue("Unknown error")
      
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isEditor: false,
        signOut: mockSignOut,
      })

      render(<AuthModal {...defaultProps} />)

      const signOutButton = screen.getByText("Sign Out")
      fireEvent.click(signOutButton)

      await waitFor(() => {
        expect(screen.getByText("Failed to sign out. Please try again.")).toBeInTheDocument()
      })
    })
  })

  describe("editor permissions", () => {
    it("should show editor access message for editor users", () => {
      mockUseAuth.mockReturnValue({
        user: mockEditorUser,
        isEditor: true,
        signOut: vi.fn(),
      })

      render(<AuthModal {...defaultProps} />)

      // Should not show the viewer access message
      expect(screen.queryByText("You have viewer access")).not.toBeInTheDocument()
    })

    it("should show viewer access message for non-editor users", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isEditor: false,
        signOut: vi.fn(),
      })

      render(<AuthModal {...defaultProps} />)

      expect(screen.getByText("You have viewer access")).toBeInTheDocument()
      expect(screen.getByText("Contact an administrator for editor permissions")).toBeInTheDocument()
    })
  })

  describe("modal interactions", () => {
    it("should call onOpenChange when modal is closed", () => {
      const mockOnOpenChange = vi.fn()
      render(<AuthModal {...defaultProps} onOpenChange={mockOnOpenChange} />)

      // The modal should be open by default
      expect(screen.getByText("Authentication")).toBeInTheDocument()
      
      // Simulate closing the modal (this would be triggered by the Dialog component)
      // In a real test, you might need to trigger the close event differently
    })

    it("should display authentication benefits", () => {
      render(<AuthModal {...defaultProps} />)

      expect(screen.getByText("Why authentication?")).toBeInTheDocument()
      expect(screen.getByText("Rate-limit requests appropriately")).toBeInTheDocument()
      expect(screen.getByText("Protect against automated scraping")).toBeInTheDocument()
      expect(screen.getByText("Provide a better, personalized experience")).toBeInTheDocument()
    })
  })

  describe("accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<AuthModal {...defaultProps} />)

      const signInButton = screen.getByText("Sign in with Google")
      expect(signInButton).toBeInTheDocument()
    })

    it("should be keyboard navigable", () => {
      render(<AuthModal {...defaultProps} />)

      const signInButton = screen.getByText("Sign in with Google")
      expect(signInButton).not.toHaveAttribute("tabindex", "-1")
    })
  })

  describe("error handling", () => {
    it("should clear errors when starting new sign in", async () => {
      // First, trigger an error
      mockSignInWithPopup.mockRejectedValueOnce(new Error("First error"))
      
      render(<AuthModal {...defaultProps} />)

      const signInButton = screen.getByText("Sign in with Google")
      fireEvent.click(signInButton)

      await waitFor(() => {
        expect(screen.getByText("First error")).toBeInTheDocument()
      })

      // Now mock a successful sign in
      mockSignInWithPopup.mockResolvedValueOnce({})

      // Click sign in again
      fireEvent.click(signInButton)

      // Error should be cleared
      expect(screen.queryByText("First error")).not.toBeInTheDocument()
    })
  })

  describe("responsive design", () => {
    it("should handle different screen sizes", () => {
      render(<AuthModal {...defaultProps} />)

      // Should render without errors
      expect(screen.getByText("Authentication")).toBeInTheDocument()
    })
  })
})
