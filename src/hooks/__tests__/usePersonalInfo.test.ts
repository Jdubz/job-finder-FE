/**
 * usePersonalInfo Hook Tests
 * 
 * Tests for the usePersonalInfo custom hook
 */

import { describe, it, expect, beforeEach, vi, Mock } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { usePersonalInfo } from "../usePersonalInfo"
import { useAuth } from "@/contexts/AuthContext"
import { useFirestore } from "@/contexts/FirestoreContext"
import type { PersonalInfo } from "@jsdubzw/job-finder-shared-types"

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

const mockPersonalInfo: PersonalInfo = {
  id: "personal-info",
  type: "personal-info",
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  location: "San Francisco, CA",
  website: "https://johndoe.com",
  github: "johndoe",
  linkedin: "johndoe",
  avatar: "https://avatar.com/john.jpg",
  logo: "https://logo.com/logo.png",
  accentColor: "#3b82f6",
}

const mockFirestoreService = {
  getDocument: vi.fn(),
  setDocument: vi.fn(),
  updateDocument: vi.fn(),
}

describe("usePersonalInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockUseAuth.mockReturnValue({
      user: mockUser,
    })
    
    mockUseFirestore.mockReturnValue({
      service: mockFirestoreService,
    })
  })

  describe("initial state", () => {
    it("should return initial state when user is not authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: null,
      })

      const { result } = renderHook(() => usePersonalInfo())

      expect(result.current.personalInfo).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it("should start loading when user is authenticated", async () => {
      mockFirestoreService.getDocument.mockResolvedValue(mockPersonalInfo)

      const { result } = renderHook(() => usePersonalInfo())

      expect(result.current.loading).toBe(true)
      expect(result.current.personalInfo).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe("loading personal info", () => {
    it("should load personal info successfully", async () => {
      mockFirestoreService.getDocument.mockResolvedValue(mockPersonalInfo)

      const { result } = renderHook(() => usePersonalInfo())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.personalInfo).toEqual(mockPersonalInfo)
      expect(result.current.error).toBeNull()
      expect(mockFirestoreService.getDocument).toHaveBeenCalledWith(
        "job-finder-config",
        "personal-info"
      )
    })

    it("should handle loading errors", async () => {
      const error = new Error("Failed to load personal info")
      mockFirestoreService.getDocument.mockRejectedValue(error)

      const { result } = renderHook(() => usePersonalInfo())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.personalInfo).toBeNull()
      expect(result.current.error).toEqual(error)
    })

    it("should handle null document response", async () => {
      mockFirestoreService.getDocument.mockResolvedValue(null)

      const { result } = renderHook(() => usePersonalInfo())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.personalInfo).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe("updating personal info", () => {
    it("should create new personal info document when none exists", async () => {
      mockFirestoreService.getDocument.mockResolvedValue(null)
      mockFirestoreService.setDocument.mockResolvedValue(undefined)
      mockFirestoreService.getDocument.mockResolvedValueOnce(null).mockResolvedValueOnce(mockPersonalInfo)

      const { result } = renderHook(() => usePersonalInfo())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const updates = {
        name: "Jane Doe",
        phone: "+0987654321",
      }

      await act(async () => {
        await result.current.updatePersonalInfo(updates)
      })

      expect(mockFirestoreService.setDocument).toHaveBeenCalledWith(
        "job-finder-config",
        "personal-info",
        expect.objectContaining({
          name: "Jane Doe",
          email: mockUser.email,
          phone: "+0987654321",
          accentColor: "#3b82f6",
        })
      )
    })

    it("should update existing personal info document", async () => {
      mockFirestoreService.getDocument.mockResolvedValue(mockPersonalInfo)
      mockFirestoreService.updateDocument.mockResolvedValue(undefined)

      const { result } = renderHook(() => usePersonalInfo())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const updates = {
        name: "Jane Doe",
        phone: "+0987654321",
      }

      await act(async () => {
        await result.current.updatePersonalInfo(updates)
      })

      expect(mockFirestoreService.updateDocument).toHaveBeenCalledWith(
        "job-finder-config",
        "personal-info",
        updates
      )
    })

    it("should handle update errors", async () => {
      mockFirestoreService.getDocument.mockResolvedValue(mockPersonalInfo)
      const error = new Error("Failed to update personal info")
      mockFirestoreService.updateDocument.mockRejectedValue(error)

      const { result } = renderHook(() => usePersonalInfo())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const updates = { name: "Jane Doe" }

      await expect(async () => {
        await act(async () => {
          await result.current.updatePersonalInfo(updates)
        })
      }).rejects.toThrow("Failed to update personal info")

      expect(result.current.error).toEqual(error)
    })

    it("should throw error when user is not authenticated", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
      })

      const { result } = renderHook(() => usePersonalInfo())

      await expect(async () => {
        await act(async () => {
          await result.current.updatePersonalInfo({ name: "Jane Doe" })
        })
      }).rejects.toThrow("User must be authenticated to update personal info")
    })

    it("should throw error when user email is not available", async () => {
      mockUseAuth.mockReturnValue({
        user: { uid: "test-123" }, // No email
      })

      const { result } = renderHook(() => usePersonalInfo())

      await expect(async () => {
        await act(async () => {
          await result.current.updatePersonalInfo({ name: "Jane Doe" })
        })
      }).rejects.toThrow("User must be authenticated to update personal info")
    })
  })

  describe("refetch functionality", () => {
    it("should refetch personal info", async () => {
      mockFirestoreService.getDocument.mockResolvedValue(mockPersonalInfo)

      const { result } = renderHook(() => usePersonalInfo())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Change the mock response
      const updatedPersonalInfo = { ...mockPersonalInfo, name: "Updated Name" }
      mockFirestoreService.getDocument.mockResolvedValue(updatedPersonalInfo)

      await act(async () => {
        await result.current.refetch()
      })

      expect(mockFirestoreService.getDocument).toHaveBeenCalledTimes(2)
    })
  })

  describe("user changes", () => {
    it("should reload personal info when user changes", async () => {
      // Start with no user
      mockUseAuth.mockReturnValue({
        user: null,
      })

      const { result, rerender } = renderHook(() => usePersonalInfo())

      expect(result.current.personalInfo).toBeNull()

      // Change to authenticated user
      mockUseAuth.mockReturnValue({
        user: mockUser,
      })
      mockFirestoreService.getDocument.mockResolvedValue(mockPersonalInfo)

      rerender()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.personalInfo).toEqual(mockPersonalInfo)
    })

    it("should clear personal info when user logs out", async () => {
      mockFirestoreService.getDocument.mockResolvedValue(mockPersonalInfo)

      const { result, rerender } = renderHook(() => usePersonalInfo())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.personalInfo).toEqual(mockPersonalInfo)

      // User logs out
      mockUseAuth.mockReturnValue({
        user: null,
      })

      rerender()

      expect(result.current.personalInfo).toBeNull()
      expect(result.current.loading).toBe(false)
    })
  })

  describe("error handling", () => {
    it("should handle non-Error exceptions", async () => {
      mockFirestoreService.getDocument.mockRejectedValue("String error")

      const { result } = renderHook(() => usePersonalInfo())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe("Failed to load personal info")
    })

    it("should handle update non-Error exceptions", async () => {
      mockFirestoreService.getDocument.mockResolvedValue(mockPersonalInfo)
      mockFirestoreService.updateDocument.mockRejectedValue("String error")

      const { result } = renderHook(() => usePersonalInfo())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const updates = { name: "Jane Doe" }

      await expect(async () => {
        await act(async () => {
          await result.current.updatePersonalInfo(updates)
        })
      }).rejects.toThrow("Failed to update personal info")
    })
  })

  describe("edge cases", () => {
    it("should handle empty updates", async () => {
      mockFirestoreService.getDocument.mockResolvedValue(mockPersonalInfo)
      mockFirestoreService.updateDocument.mockResolvedValue(undefined)

      const { result } = renderHook(() => usePersonalInfo())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.updatePersonalInfo({})
      })

      expect(mockFirestoreService.updateDocument).toHaveBeenCalledWith(
        "job-finder-config",
        "personal-info",
        {}
      )
    })

    it("should handle undefined user", async () => {
      mockUseAuth.mockReturnValue({
        user: undefined,
      })

      const { result } = renderHook(() => usePersonalInfo())

      expect(result.current.personalInfo).toBeNull()
      expect(result.current.loading).toBe(false)
    })
  })
})
