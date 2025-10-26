import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { JobFinderPage } from "../JobFinderPage"
import { useAuth } from "@/contexts/AuthContext"
import { jobQueueClient } from "@/api"

vi.mock("@/contexts/AuthContext")
vi.mock("@/api")
vi.mock("../components/QueueStatusTable", () => ({
  QueueStatusTable: () => <div data-testid="queue-status-table">Queue Status Table</div>,
}))

describe("JobFinderPage", () => {
  const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Access Control", () => {
    it("should show access denied message when user is not an editor", () => {
      mockUseAuth.mockReturnValue({
        user: { uid: "test-user", email: "test@example.com" },
        isEditor: false,
        isAdmin: false,
      })

      render(<JobFinderPage />)

      expect(screen.getByText(/editor permissions/i)).toBeInTheDocument()
      expect(screen.getByText("Job Finder")).toBeInTheDocument()
    })

    it("should show job submission form when user is an editor", () => {
      mockUseAuth.mockReturnValue({
        user: { uid: "test-user", email: "test@example.com" },
        isEditor: true,
        isAdmin: false,
      })

      render(<JobFinderPage />)

      expect(screen.getByText(/Submit Job for Analysis/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Job URL/i)).toBeInTheDocument()
    })
  })

  describe("Form Validation", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { uid: "test-user", email: "test@example.com" },
        isEditor: true,
        isAdmin: false,
      })
    })

    it("should show error when submitting empty job URL", async () => {
      render(<JobFinderPage />)

      const submitButton = screen.getByRole("button", { name: /submit/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Job URL is required/i)).toBeInTheDocument()
      })
    })

    it("should not call API when validation fails", async () => {
      render(<JobFinderPage />)

      const submitButton = screen.getByRole("button", { name: /submit/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(jobQueueClient.submitJob).not.toHaveBeenCalled()
      })
    })
  })

  describe("Job Submission", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { uid: "test-user", email: "test@example.com" },
        isEditor: true,
        isAdmin: false,
      })
    })

    it("should submit job successfully", async () => {
      const mockSubmitJob = vi.fn().mockResolvedValue({
        status: "success",
        message: "Job submitted successfully!",
      })
      ;(jobQueueClient.submitJob as any) = mockSubmitJob

      render(<JobFinderPage />)

      const jobUrlInput = screen.getByLabelText(/Job URL/i)
      fireEvent.change(jobUrlInput, {
        target: { value: "https://linkedin.com/jobs/123" },
      })

      const submitButton = screen.getByRole("button", { name: /submit/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSubmitJob).toHaveBeenCalledWith({
          url: "https://linkedin.com/jobs/123",
          companyName: undefined,
          companyUrl: undefined,
        })
      })

      expect(screen.getByText(/Job submitted successfully/i)).toBeInTheDocument()
    })

    it("should submit job with company information", async () => {
      const mockSubmitJob = vi.fn().mockResolvedValue({
        status: "success",
        message: "Job submitted successfully!",
      })
      ;(jobQueueClient.submitJob as any) = mockSubmitJob

      render(<JobFinderPage />)

      const jobUrlInput = screen.getByLabelText(/Job URL/i)
      const companyNameInput = screen.getByLabelText(/Company Name/i)
      const companyUrlInput = screen.getByLabelText(/Company URL/i)

      fireEvent.change(jobUrlInput, {
        target: { value: "https://linkedin.com/jobs/123" },
      })
      fireEvent.change(companyNameInput, {
        target: { value: "Tech Corp" },
      })
      fireEvent.change(companyUrlInput, {
        target: { value: "https://techcorp.com" },
      })

      const submitButton = screen.getByRole("button", { name: /submit/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSubmitJob).toHaveBeenCalledWith({
          url: "https://linkedin.com/jobs/123",
          companyName: "Tech Corp",
          companyUrl: "https://techcorp.com",
        })
      })
    })

    it("should clear form after successful submission", async () => {
      const mockSubmitJob = vi.fn().mockResolvedValue({
        status: "success",
        message: "Job submitted successfully!",
      })
      ;(jobQueueClient.submitJob as any) = mockSubmitJob

      render(<JobFinderPage />)

      const jobUrlInput = screen.getByLabelText(/Job URL/i) as HTMLInputElement
      fireEvent.change(jobUrlInput, {
        target: { value: "https://linkedin.com/jobs/123" },
      })

      const submitButton = screen.getByRole("button", { name: /submit/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(jobUrlInput.value).toBe("")
      })
    })

    it("should show skip message when job is skipped", async () => {
      const mockSubmitJob = vi.fn().mockResolvedValue({
        status: "skipped",
        message: "Job was skipped (duplicate)",
      })
      ;(jobQueueClient.submitJob as any) = mockSubmitJob

      render(<JobFinderPage />)

      const jobUrlInput = screen.getByLabelText(/Job URL/i)
      fireEvent.change(jobUrlInput, {
        target: { value: "https://linkedin.com/jobs/123" },
      })

      const submitButton = screen.getByRole("button", { name: /submit/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/skipped.*duplicate/i)).toBeInTheDocument()
      })
    })

    it("should show error message on submission failure", async () => {
      const mockSubmitJob = vi.fn().mockRejectedValue(new Error("Network error"))
      ;(jobQueueClient.submitJob as any) = mockSubmitJob

      render(<JobFinderPage />)

      const jobUrlInput = screen.getByLabelText(/Job URL/i)
      fireEvent.change(jobUrlInput, {
        target: { value: "https://linkedin.com/jobs/123" },
      })

      const submitButton = screen.getByRole("button", { name: /submit/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument()
      })
    })

    it("should disable submit button while submitting", async () => {
      const mockSubmitJob = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ status: "success" }), 100))
      )
      ;(jobQueueClient.submitJob as any) = mockSubmitJob

      render(<JobFinderPage />)

      const jobUrlInput = screen.getByLabelText(/Job URL/i)
      fireEvent.change(jobUrlInput, {
        target: { value: "https://linkedin.com/jobs/123" },
      })

      const submitButton = screen.getByRole("button", { name: /submit/i })
      fireEvent.click(submitButton)

      expect(submitButton).toBeDisabled()

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  describe("Queue Status Display", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { uid: "test-user", email: "test@example.com" },
        isEditor: true,
        isAdmin: false,
      })
    })

    it("should render queue status table", () => {
      render(<JobFinderPage />)

      expect(screen.getByTestId("queue-status-table")).toBeInTheDocument()
    })
  })
})
