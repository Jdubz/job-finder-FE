/**
 * GenerationProgress Component Tests
 * 
 * Tests for the GenerationProgress component functionality
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { GenerationProgress } from "@/components/GenerationProgress"
import type { GenerationStep } from "@/types/generator"

// Mock data
const mockSteps: GenerationStep[] = [
  {
    id: "fetch_data",
    name: "Fetch Data",
    description: "Loading your experience data",
    status: "completed",
    startedAt: new Date("2024-01-15T10:00:00Z"),
    completedAt: new Date("2024-01-15T10:00:01Z"),
    duration: 1000,
  },
  {
    id: "generate_resume",
    name: "Generate Resume",
    description: "AI is generating your resume content",
    status: "in_progress",
    startedAt: new Date("2024-01-15T10:00:01Z"),
  },
  {
    id: "create_resume_pdf",
    name: "Create Resume PDF",
    description: "Creating your resume PDF",
    status: "pending",
  },
  {
    id: "upload_documents",
    name: "Upload Documents",
    description: "Uploading documents to cloud storage",
    status: "pending",
  },
]

describe("GenerationProgress", () => {
  describe("rendering", () => {
    it("should render all steps", () => {
      render(<GenerationProgress steps={mockSteps} />)

      expect(screen.getByText("Fetch Data")).toBeInTheDocument()
      expect(screen.getByText("Generate Resume")).toBeInTheDocument()
      expect(screen.getByText("Create Resume PDF")).toBeInTheDocument()
      expect(screen.getByText("Upload Documents")).toBeInTheDocument()
    })

    it("should render step descriptions", () => {
      render(<GenerationProgress steps={mockSteps} />)

      expect(screen.getByText("Loading your experience data")).toBeInTheDocument()
      expect(screen.getByText("AI is generating your resume content")).toBeInTheDocument()
      expect(screen.getByText("Creating your resume PDF")).toBeInTheDocument()
      expect(screen.getByText("Uploading documents to cloud storage")).toBeInTheDocument()
    })

    it("should render with empty steps array", () => {
      render(<GenerationProgress steps={[]} />)

      // Should render without errors
      expect(screen.getByTestId("generation-progress")).toBeInTheDocument()
    })
  })

  describe("step status indicators", () => {
    it("should show completed status for completed steps", () => {
      render(<GenerationProgress steps={mockSteps} />)

      const completedStep = screen.getByText("Fetch Data").closest("[data-testid='step-item']")
      expect(completedStep).toHaveClass("completed")
    })

    it("should show in-progress status for current step", () => {
      render(<GenerationProgress steps={mockSteps} />)

      const inProgressStep = screen.getByText("Generate Resume").closest("[data-testid='step-item']")
      expect(inProgressStep).toHaveClass("in-progress")
    })

    it("should show pending status for future steps", () => {
      render(<GenerationProgress steps={mockSteps} />)

      const pendingStep = screen.getByText("Create Resume PDF").closest("[data-testid='step-item']")
      expect(pendingStep).toHaveClass("pending")
    })
  })

  describe("step icons", () => {
    it("should show check icon for completed steps", () => {
      render(<GenerationProgress steps={mockSteps} />)

      const completedStep = screen.getByText("Fetch Data").closest("[data-testid='step-item']")
      expect(completedStep?.querySelector("[data-testid='check-icon']")).toBeInTheDocument()
    })

    it("should show spinner icon for in-progress steps", () => {
      render(<GenerationProgress steps={mockSteps} />)

      const inProgressStep = screen.getByText("Generate Resume").closest("[data-testid='step-item']")
      expect(inProgressStep?.querySelector("[data-testid='spinner-icon']")).toBeInTheDocument()
    })

    it("should show clock icon for pending steps", () => {
      render(<GenerationProgress steps={mockSteps} />)

      const pendingStep = screen.getByText("Create Resume PDF").closest("[data-testid='step-item']")
      expect(pendingStep?.querySelector("[data-testid='clock-icon']")).toBeInTheDocument()
    })
  })

  describe("duration display", () => {
    it("should show duration for completed steps", () => {
      render(<GenerationProgress steps={mockSteps} />)

      const completedStep = screen.getByText("Fetch Data").closest("[data-testid='step-item']")
      expect(completedStep).toHaveTextContent("1.0s")
    })

    it("should not show duration for in-progress steps", () => {
      render(<GenerationProgress steps={mockSteps} />)

      const inProgressStep = screen.getByText("Generate Resume").closest("[data-testid='step-item']")
      expect(inProgressStep).not.toHaveTextContent(/s$/)
    })

    it("should not show duration for pending steps", () => {
      render(<GenerationProgress steps={mockSteps} />)

      const pendingStep = screen.getByText("Create Resume PDF").closest("[data-testid='step-item']")
      expect(pendingStep).not.toHaveTextContent(/s$/)
    })
  })

  describe("accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<GenerationProgress steps={mockSteps} />)

      const stepItems = screen.getAllByTestId("step-item")
      stepItems.forEach(step => {
        expect(step).toHaveAttribute("aria-label")
      })
    })

    it("should have proper role attributes", () => {
      render(<GenerationProgress steps={mockSteps} />)

      const progressContainer = screen.getByTestId("generation-progress")
      expect(progressContainer).toHaveAttribute("role", "progressbar")
    })

    it("should have proper aria-valuenow for progress", () => {
      render(<GenerationProgress steps={mockSteps} />)

      const progressContainer = screen.getByTestId("generation-progress")
      expect(progressContainer).toHaveAttribute("aria-valuenow", "25") // 1 of 4 steps completed
    })
  })

  describe("responsive design", () => {
    it("should handle different screen sizes", () => {
      render(<GenerationProgress steps={mockSteps} />)

      // Should render without errors on different screen sizes
      expect(screen.getByTestId("generation-progress")).toBeInTheDocument()
    })

    it("should handle long step names", () => {
      const longStepName = "This is a very long step name that might cause layout issues"
      const stepsWithLongName = [
        {
          ...mockSteps[0],
          name: longStepName,
        },
      ]

      render(<GenerationProgress steps={stepsWithLongName} />)

      expect(screen.getByText(longStepName)).toBeInTheDocument()
    })
  })

  describe("edge cases", () => {
    it("should handle steps with missing timestamps", () => {
      const stepsWithMissingTimestamps = [
        {
          id: "fetch_data",
          name: "Fetch Data",
          description: "Loading your experience data",
          status: "completed" as const,
        },
      ]

      render(<GenerationProgress steps={stepsWithMissingTimestamps} />)

      expect(screen.getByText("Fetch Data")).toBeInTheDocument()
    })

    it("should handle steps with zero duration", () => {
      const stepsWithZeroDuration = [
        {
          ...mockSteps[0],
          duration: 0,
        },
      ]

      render(<GenerationProgress steps={stepsWithZeroDuration} />)

      const completedStep = screen.getByText("Fetch Data").closest("[data-testid='step-item']")
      expect(completedStep).toHaveTextContent("0.0s")
    })

    it("should handle steps with very long duration", () => {
      const stepsWithLongDuration = [
        {
          ...mockSteps[0],
          duration: 125000, // 2 minutes 5 seconds
        },
      ]

      render(<GenerationProgress steps={stepsWithLongDuration} />)

      const completedStep = screen.getByText("Fetch Data").closest("[data-testid='step-item']")
      expect(completedStep).toHaveTextContent("2m 5.0s")
    })
  })
})
