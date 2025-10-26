/**
 * Job Finder Config Page Tests
 *
 * Tests for configuration management including:
 * - Stop list management (companies, keywords, domains)
 * - Queue settings
 * - AI settings
 * - Save/reset functionality
 * - Authorization
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { JobFinderConfigPage } from "../JobFinderConfigPage"
import { useAuth } from "@/contexts/AuthContext"
import { configClient } from "@/api"

// Mock modules
vi.mock("@/contexts/AuthContext")
vi.mock("@/api", () => ({
  configClient: {
    getStopList: vi.fn(),
    updateStopList: vi.fn(),
    getQueueSettings: vi.fn(),
    updateQueueSettings: vi.fn(),
    getAISettings: vi.fn(),
    updateAISettings: vi.fn(),
  },
}))

describe("JobFinderConfigPage", () => {
  const mockUser = {
    uid: "test-user-123",
    email: "test@example.com",
    displayName: "Test User",
  }

  const mockStopList = {
    id: "stop-list",
    companies: ["Spam Corp", "Bad Company"],
    keywords: ["unpaid", "volunteer"],
    domains: ["spam.com", "scam.com"],
    updatedAt: new Date().toISOString(),
    updatedBy: "test@example.com",
  }

  const mockQueueSettings = {
    id: "queue-settings",
    maxRetries: 3,
    retryDelayMs: 5000,
    batchSize: 10,
    enabled: true,
    updatedAt: new Date().toISOString(),
    updatedBy: "test@example.com",
  }

  const mockAISettings = {
    id: "ai-settings",
    provider: "gemini" as const,
    model: "gemini-2.0-flash",
    temperature: 0.7,
    maxTokens: 2000,
    enabled: true,
    updatedAt: new Date().toISOString(),
    updatedBy: "test@example.com",
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser as any,
      loading: false,
      isEditor: true,
      signOut: vi.fn(),
      signInWithGoogle: vi.fn(),
    } as any)

    vi.mocked(configClient.getStopList).mockResolvedValue(mockStopList)
    vi.mocked(configClient.getQueueSettings).mockResolvedValue(mockQueueSettings)
    vi.mocked(configClient.getAISettings).mockResolvedValue(mockAISettings)
  })

  describe("Initial Loading", () => {
    it("should render the config page", async () => {
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByText(/configuration/i)).toBeInTheDocument()
      })
    })

    it("should load all configuration settings", async () => {
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(configClient.getStopList).toHaveBeenCalled()
        expect(configClient.getQueueSettings).toHaveBeenCalled()
        expect(configClient.getAISettings).toHaveBeenCalled()
      })
    })

    it("should show loading state initially", () => {
      vi.mocked(configClient.getStopList).mockImplementation(
        () => new Promise(() => {}),
      )

      render(<JobFinderConfigPage />)

      expect(screen.getByText(/loading/i) || screen.getByRole("progressbar")).toBeInTheDocument()
    })

    it("should display error when loading fails", async () => {
      vi.mocked(configClient.getStopList).mockRejectedValue(
        new Error("Failed to load"),
      )

      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
      })
    })
  })

  describe("Stop List Tab", () => {
    it("should display stop list tab", async () => {
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /stop list/i })).toBeInTheDocument()
      })
    })

    it("should show blocked companies", async () => {
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByText("Spam Corp")).toBeInTheDocument()
        expect(screen.getByText("Bad Company")).toBeInTheDocument()
      })
    })

    it("should show blocked keywords", async () => {
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByText("unpaid")).toBeInTheDocument()
        expect(screen.getByText("volunteer")).toBeInTheDocument()
      })
    })

    it("should show blocked domains", async () => {
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByText("spam.com")).toBeInTheDocument()
        expect(screen.getByText("scam.com")).toBeInTheDocument()
      })
    })

    it("should add new company to stop list", async () => {
      const user = userEvent.setup()
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByText("Spam Corp")).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/add company/i) || 
                    screen.getByLabelText(/company/i)
      await user.type(input, "New Bad Company")

      const addButton = screen.getByRole("button", { name: /add/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText("New Bad Company")).toBeInTheDocument()
      })
    })

    it("should remove company from stop list", async () => {
      const user = userEvent.setup()
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByText("Spam Corp")).toBeInTheDocument()
      })

      // Find and click remove button for "Spam Corp"
      const removeButtons = screen.getAllByRole("button", { name: /remove|delete|x/i })
      await user.click(removeButtons[0])

      await waitFor(() => {
        expect(screen.queryByText("Spam Corp")).not.toBeInTheDocument()
      })
    })

    it("should save stop list changes", async () => {
      const user = userEvent.setup()
      vi.mocked(configClient.updateStopList).mockResolvedValue(mockStopList)

      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByText("Spam Corp")).toBeInTheDocument()
      })

      const saveButton = screen.getByRole("button", { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(configClient.updateStopList).toHaveBeenCalledWith(
          expect.objectContaining({
            companies: expect.arrayContaining(["Spam Corp", "Bad Company"]),
          }),
          mockUser.email,
        )
      })
    })

    it("should show success message after saving", async () => {
      const user = userEvent.setup()
      vi.mocked(configClient.updateStopList).mockResolvedValue(mockStopList)

      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByText("Spam Corp")).toBeInTheDocument()
      })

      const saveButton = screen.getByRole("button", { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument()
      })
    })

    it("should reset stop list to original values", async () => {
      const user = userEvent.setup()
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByText("Spam Corp")).toBeInTheDocument()
      })

      // Add a new company
      const input = screen.getByPlaceholderText(/add company/i) || 
                    screen.getByLabelText(/company/i)
      await user.type(input, "Temporary Company")
      const addButton = screen.getByRole("button", { name: /add/i })
      await user.click(addButton)

      // Reset
      const resetButton = screen.getByRole("button", { name: /reset/i })
      await user.click(resetButton)

      await waitFor(() => {
        expect(screen.queryByText("Temporary Company")).not.toBeInTheDocument()
      })
    })
  })

  describe("Queue Settings Tab", () => {
    it("should display queue settings tab", async () => {
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /queue/i })).toBeInTheDocument()
      })
    })

    it("should show current queue settings", async () => {
      const user = userEvent.setup()
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /queue/i })).toBeInTheDocument()
      })

      const queueTab = screen.getByRole("tab", { name: /queue/i })
      await user.click(queueTab)

      await waitFor(() => {
        expect(screen.getByDisplayValue("3") || screen.getByText(/3/)).toBeInTheDocument()
        expect(screen.getByDisplayValue("10") || screen.getByText(/10/)).toBeInTheDocument()
      })
    })

    it("should update max retries", async () => {
      const user = userEvent.setup()
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /queue/i })).toBeInTheDocument()
      })

      const queueTab = screen.getByRole("tab", { name: /queue/i })
      await user.click(queueTab)

      const retriesInput = screen.getByLabelText(/max retries/i) || 
                          screen.getByDisplayValue("3")
      await user.clear(retriesInput)
      await user.type(retriesInput, "5")

      expect(retriesInput).toHaveValue("5")
    })

    it("should update batch size", async () => {
      const user = userEvent.setup()
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /queue/i })).toBeInTheDocument()
      })

      const queueTab = screen.getByRole("tab", { name: /queue/i })
      await user.click(queueTab)

      const batchInput = screen.getByLabelText(/batch size/i) || 
                        screen.getByDisplayValue("10")
      await user.clear(batchInput)
      await user.type(batchInput, "20")

      expect(batchInput).toHaveValue("20")
    })

    it("should save queue settings", async () => {
      const user = userEvent.setup()
      vi.mocked(configClient.updateQueueSettings).mockResolvedValue(mockQueueSettings)

      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /queue/i })).toBeInTheDocument()
      })

      const queueTab = screen.getByRole("tab", { name: /queue/i })
      await user.click(queueTab)

      const saveButton = screen.getByRole("button", { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(configClient.updateQueueSettings).toHaveBeenCalledWith(
          expect.objectContaining({
            maxRetries: 3,
            batchSize: 10,
          }),
          mockUser.email,
        )
      })
    })
  })

  describe("AI Settings Tab", () => {
    it("should display AI settings tab", async () => {
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /ai/i })).toBeInTheDocument()
      })
    })

    it("should show current AI provider", async () => {
      const user = userEvent.setup()
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /ai/i })).toBeInTheDocument()
      })

      const aiTab = screen.getByRole("tab", { name: /ai/i })
      await user.click(aiTab)

      await waitFor(() => {
        expect(screen.getByText(/gemini/i)).toBeInTheDocument()
      })
    })

    it("should change AI provider", async () => {
      const user = userEvent.setup()
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /ai/i })).toBeInTheDocument()
      })

      const aiTab = screen.getByRole("tab", { name: /ai/i })
      await user.click(aiTab)

      const providerSelect = screen.getByRole("combobox", { name: /provider/i })
      await user.click(providerSelect)

      const openaiOption = screen.getByText(/openai/i)
      await user.click(openaiOption)

      expect(providerSelect).toHaveTextContent(/openai/i)
    })

    it("should update temperature setting", async () => {
      const user = userEvent.setup()
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /ai/i })).toBeInTheDocument()
      })

      const aiTab = screen.getByRole("tab", { name: /ai/i })
      await user.click(aiTab)

      const tempInput = screen.getByLabelText(/temperature/i) || 
                       screen.getByDisplayValue("0.7")
      await user.clear(tempInput)
      await user.type(tempInput, "0.9")

      expect(tempInput).toHaveValue("0.9")
    })

    it("should save AI settings", async () => {
      const user = userEvent.setup()
      vi.mocked(configClient.updateAISettings).mockResolvedValue(mockAISettings)

      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /ai/i })).toBeInTheDocument()
      })

      const aiTab = screen.getByRole("tab", { name: /ai/i })
      await user.click(aiTab)

      const saveButton = screen.getByRole("button", { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(configClient.updateAISettings).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: "gemini",
            temperature: 0.7,
          }),
          mockUser.email,
        )
      })
    })
  })

  describe("Authorization", () => {
    it("should only allow editors to access page", () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser as any,
        loading: false,
        isEditor: false,
        signOut: vi.fn(),
        signInWithGoogle: vi.fn(),
      } as any)

      render(<JobFinderConfigPage />)

      expect(screen.getByText(/unauthorized|access denied/i)).toBeInTheDocument()
    })

    it("should disable save buttons for non-editors", () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser as any,
        loading: false,
        isEditor: false,
        signOut: vi.fn(),
        signInWithGoogle: vi.fn(),
      } as any)

      render(<JobFinderConfigPage />)

      const saveButtons = screen.queryAllByRole("button", { name: /save/i })
      saveButtons.forEach((button) => {
        expect(button).toBeDisabled()
      })
    })
  })

  describe("Error Handling", () => {
    it("should handle save errors", async () => {
      const user = userEvent.setup()
      vi.mocked(configClient.updateStopList).mockRejectedValue(
        new Error("Save failed"),
      )

      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByText("Spam Corp")).toBeInTheDocument()
      })

      const saveButton = screen.getByRole("button", { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/failed to save/i)).toBeInTheDocument()
      })
    })

    it("should handle network errors gracefully", async () => {
      vi.mocked(configClient.getStopList).mockRejectedValue(
        new Error("Network error"),
      )

      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByText(/failed to load|error/i)).toBeInTheDocument()
      })
    })
  })

  describe("Form Validation", () => {
    it("should prevent adding empty company names", async () => {
      const user = userEvent.setup()
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByText("Spam Corp")).toBeInTheDocument()
      })

      const addButton = screen.getByRole("button", { name: /add/i })
      await user.click(addButton)

      // Should not add empty value
      expect(screen.queryByText("")).not.toBeInTheDocument()
    })

    it("should validate numeric inputs for queue settings", async () => {
      const user = userEvent.setup()
      render(<JobFinderConfigPage />)

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /queue/i })).toBeInTheDocument()
      })

      const queueTab = screen.getByRole("tab", { name: /queue/i })
      await user.click(queueTab)

      const retriesInput = screen.getByLabelText(/max retries/i) || 
                          screen.getByDisplayValue("3")
      
      // Should only accept numbers
      await user.clear(retriesInput)
      await user.type(retriesInput, "abc")

      expect(retriesInput).not.toHaveValue("abc")
    })
  })
})
