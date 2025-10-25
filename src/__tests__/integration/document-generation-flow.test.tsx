/**
 * Document Generation Flow Integration Tests
 * 
 * Comprehensive integration tests for the complete document generation workflow
 */

import { describe, it, expect, beforeEach, vi, Mock } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { DocumentBuilderPage } from "@/pages/document-builder/DocumentBuilderPage"
import { useAuth } from "@/contexts/AuthContext"
import { jobMatchesClient } from "@/api/job-matches-client"
import { generatorClient } from "@/api/generator-client"
import type { JobMatch } from "@jsdubzw/job-finder-shared-types"

// Mock dependencies
vi.mock("@/contexts/AuthContext")
vi.mock("@/api/job-matches-client")
vi.mock("@/api/generator-client")

const mockUseAuth = useAuth as Mock
const mockJobMatchesClient = jobMatchesClient as any
const mockGeneratorClient = generatorClient as any

// Mock data
const mockUser = {
  uid: "test-user-123",
  email: "test@example.com",
  displayName: "Test User",
}

const mockJobMatches: JobMatch[] = [
  {
    id: "match-1",
    userId: "test-user-123",
    queueItemId: "queue-1",
    jobTitle: "Senior Software Engineer",
    companyName: "Tech Corp",
    location: "San Francisco, CA",
    salary: "$150,000 - $200,000",
    matchScore: 85,
    status: "new",
    linkedInUrl: "https://linkedin.com/jobs/123",
    jobDescription: "We are looking for an experienced software engineer...",
    requirements: ["5+ years experience", "React", "TypeScript"],
    responsibilities: ["Build web applications", "Mentor team members"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    analyzed: true,
    aiMatchReasoning: "Strong technical match",
    recommendedSkills: ["React", "TypeScript", "Node.js"],
  },
]

const mockStartGenerationResponse = {
  success: true,
  data: {
    requestId: "gen-request-123",
    status: "pending",
    nextStep: "fetch_data",
  },
  requestId: "gen-request-123",
}

const mockStepResponses = [
  {
    success: true,
    data: {
      stepCompleted: "fetch_data",
      nextStep: "generate_resume",
      status: "processing",
      steps: [
        {
          id: "fetch_data",
          name: "Fetch Data",
          description: "Loading your experience data",
          status: "completed",
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 1000,
        },
        {
          id: "generate_resume",
          name: "Generate Resume",
          description: "AI is generating your resume content",
          status: "in_progress",
          startedAt: new Date(),
        },
      ],
    },
    requestId: "gen-request-123",
  },
  {
    success: true,
    data: {
      stepCompleted: "generate_resume",
      nextStep: "create_resume_pdf",
      status: "processing",
      steps: [
        {
          id: "fetch_data",
          name: "Fetch Data",
          description: "Loading your experience data",
          status: "completed",
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 1000,
        },
        {
          id: "generate_resume",
          name: "Generate Resume",
          description: "AI is generating your resume content",
          status: "completed",
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 5000,
        },
        {
          id: "create_resume_pdf",
          name: "Create Resume PDF",
          description: "Creating your resume PDF",
          status: "in_progress",
          startedAt: new Date(),
        },
      ],
    },
    requestId: "gen-request-123",
  },
  {
    success: true,
    data: {
      stepCompleted: "create_resume_pdf",
      nextStep: "upload_documents",
      status: "processing",
      steps: [
        {
          id: "fetch_data",
          name: "Fetch Data",
          description: "Loading your experience data",
          status: "completed",
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 1000,
        },
        {
          id: "generate_resume",
          name: "Generate Resume",
          description: "AI is generating your resume content",
          status: "completed",
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 5000,
        },
        {
          id: "create_resume_pdf",
          name: "Create Resume PDF",
          description: "Creating your resume PDF",
          status: "completed",
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 2000,
          result: {
            resumeUrl: "https://storage.example.com/resume.pdf",
          },
        },
        {
          id: "upload_documents",
          name: "Upload Documents",
          description: "Uploading documents to cloud storage",
          status: "in_progress",
          startedAt: new Date(),
        },
      ],
    },
    requestId: "gen-request-123",
  },
  {
    success: true,
    data: {
      stepCompleted: "upload_documents",
      status: "completed",
      resumeUrl: "https://storage.example.com/resume.pdf",
      coverLetterUrl: "https://storage.example.com/cover-letter.pdf",
      steps: [
        {
          id: "fetch_data",
          name: "Fetch Data",
          description: "Loading your experience data",
          status: "completed",
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 1000,
        },
        {
          id: "generate_resume",
          name: "Generate Resume",
          description: "AI is generating your resume content",
          status: "completed",
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 5000,
        },
        {
          id: "create_resume_pdf",
          name: "Create Resume PDF",
          description: "Creating your resume PDF",
          status: "completed",
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 2000,
          result: {
            resumeUrl: "https://storage.example.com/resume.pdf",
          },
        },
        {
          id: "upload_documents",
          name: "Upload Documents",
          description: "Uploading documents to cloud storage",
          status: "completed",
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 1000,
          result: {
            resumeUrl: "https://storage.example.com/resume.pdf",
            coverLetterUrl: "https://storage.example.com/cover-letter.pdf",
          },
        },
      ],
    },
    requestId: "gen-request-123",
  },
]

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe("Document Generation Flow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    })
    
    mockJobMatchesClient.getMatches.mockResolvedValue(mockJobMatches)
    mockGeneratorClient.startGeneration.mockResolvedValue(mockStartGenerationResponse)
    
    // Setup step execution responses
    mockGeneratorClient.executeStep
      .mockResolvedValueOnce(mockStepResponses[0])
      .mockResolvedValueOnce(mockStepResponses[1])
      .mockResolvedValueOnce(mockStepResponses[2])
      .mockResolvedValueOnce(mockStepResponses[3])
  })

  describe("Complete Resume Generation Flow", () => {
    it("should complete full resume generation workflow", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      // Wait for job matches to load
      await waitFor(() => {
        expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument()
      })

      // Select a job match
      const jobSelect = screen.getByRole("combobox")
      fireEvent.click(jobSelect)
      
      const firstOption = screen.getByText("Senior Software Engineer")
      fireEvent.click(firstOption)

      // Verify form is populated
      await waitFor(() => {
        expect(screen.getByDisplayValue("Senior Software Engineer")).toBeInTheDocument()
        expect(screen.getByDisplayValue("Tech Corp")).toBeInTheDocument()
      })

      // Start generation
      const generateButton = screen.getByRole("button", { name: /generate resume/i })
      fireEvent.click(generateButton)

      // Verify generation started
      await waitFor(() => {
        expect(mockGeneratorClient.startGeneration).toHaveBeenCalledWith({
          generateType: "resume",
          job: {
            role: "Senior Software Engineer",
            company: "Tech Corp",
            jobDescriptionText: undefined,
          },
          jobMatchId: "match-1",
          date: expect.any(String),
          preferences: undefined,
        })
      })

      // Verify progress steps are shown
      await waitFor(() => {
        expect(screen.getByText("Loading your experience data")).toBeInTheDocument()
      })

      // Wait for all steps to complete
      await waitFor(() => {
        expect(screen.getByText("AI is generating your resume content")).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText("Creating your resume PDF")).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText("Uploading documents to cloud storage")).toBeInTheDocument()
      })

      // Verify final success state
      await waitFor(() => {
        expect(screen.getByText("Resume generated successfully!")).toBeInTheDocument()
        expect(screen.getByText("Download Resume")).toBeInTheDocument()
        expect(screen.getByText("Download Cover Letter")).toBeInTheDocument()
      })

      // Verify all API calls were made
      expect(mockGeneratorClient.startGeneration).toHaveBeenCalledTimes(1)
      expect(mockGeneratorClient.executeStep).toHaveBeenCalledTimes(4)
    })

    it("should handle cover letter generation workflow", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      // Wait for job matches to load
      await waitFor(() => {
        expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument()
      })

      // Switch to cover letter
      const documentTypeSelect = screen.getByRole("combobox", { name: /document type/i })
      fireEvent.click(documentTypeSelect)
      const coverLetterOption = screen.getByText("Cover Letter")
      fireEvent.click(coverLetterOption)

      // Select job match
      const jobSelect = screen.getByRole("combobox")
      fireEvent.click(jobSelect)
      const firstOption = screen.getByText("Senior Software Engineer")
      fireEvent.click(firstOption)

      // Start generation
      const generateButton = screen.getByRole("button", { name: /generate cover letter/i })
      fireEvent.click(generateButton)

      // Verify cover letter generation request
      await waitFor(() => {
        expect(mockGeneratorClient.startGeneration).toHaveBeenCalledWith({
          generateType: "coverLetter",
          job: {
            role: "Senior Software Engineer",
            company: "Tech Corp",
            jobDescriptionText: undefined,
          },
          jobMatchId: "match-1",
          date: expect.any(String),
          preferences: undefined,
        })
      })
    })

    it("should handle both documents generation workflow", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      // Wait for job matches to load
      await waitFor(() => {
        expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument()
      })

      // Switch to both documents
      const documentTypeSelect = screen.getByRole("combobox", { name: /document type/i })
      fireEvent.click(documentTypeSelect)
      const bothOption = screen.getByText("Both Resume & Cover Letter")
      fireEvent.click(bothOption)

      // Select job match
      const jobSelect = screen.getByRole("combobox")
      fireEvent.click(jobSelect)
      const firstOption = screen.getByText("Senior Software Engineer")
      fireEvent.click(firstOption)

      // Start generation
      const generateButton = screen.getByRole("button", { name: /generate both documents/i })
      fireEvent.click(generateButton)

      // Verify both documents generation request
      await waitFor(() => {
        expect(mockGeneratorClient.startGeneration).toHaveBeenCalledWith({
          generateType: "both",
          job: {
            role: "Senior Software Engineer",
            company: "Tech Corp",
            jobDescriptionText: undefined,
          },
          jobMatchId: "match-1",
          date: expect.any(String),
          preferences: undefined,
        })
      })
    })

    it("should handle custom job details workflow", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      // Fill in custom job details
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: "Custom Software Engineer" },
      })
      fireEvent.change(screen.getByLabelText(/company name/i), {
        target: { value: "Custom Corp" },
      })
      fireEvent.change(screen.getByLabelText(/job description/i), {
        target: { value: "Custom job description for testing" },
      })

      // Start generation
      const generateButton = screen.getByRole("button", { name: /generate resume/i })
      fireEvent.click(generateButton)

      // Verify custom job details are included
      await waitFor(() => {
        expect(mockGeneratorClient.startGeneration).toHaveBeenCalledWith({
          generateType: "resume",
          job: {
            role: "Custom Software Engineer",
            company: "Custom Corp",
            jobDescriptionText: "Custom job description for testing",
          },
          jobMatchId: undefined,
          date: expect.any(String),
          preferences: undefined,
        })
      })
    })

    it("should handle professional summary override", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      // Fill in custom job details
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: "Software Engineer" },
      })
      fireEvent.change(screen.getByLabelText(/company name/i), {
        target: { value: "Tech Corp" },
      })
      fireEvent.change(screen.getByLabelText(/professional summary override/i), {
        target: { value: "Custom professional summary" },
      })

      // Start generation
      const generateButton = screen.getByRole("button", { name: /generate resume/i })
      fireEvent.click(generateButton)

      // Verify preferences are included
      await waitFor(() => {
        expect(mockGeneratorClient.startGeneration).toHaveBeenCalledWith({
          generateType: "resume",
          job: {
            role: "Software Engineer",
            company: "Tech Corp",
            jobDescriptionText: undefined,
          },
          jobMatchId: undefined,
          date: expect.any(String),
          preferences: {
            emphasize: ["Custom professional summary"],
          },
        })
      })
    })
  })

  describe("Error Handling in Generation Flow", () => {
    it("should handle start generation failure", async () => {
      mockGeneratorClient.startGeneration.mockRejectedValue(new Error("Start generation failed"))
      
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: "Software Engineer" },
      })
      fireEvent.change(screen.getByLabelText(/company name/i), {
        target: { value: "Tech Corp" },
      })

      const generateButton = screen.getByRole("button", { name: /generate resume/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText("Generation failed")).toBeInTheDocument()
      })
    })

    it("should handle step execution failure", async () => {
      mockGeneratorClient.executeStep
        .mockResolvedValueOnce(mockStepResponses[0])
        .mockRejectedValueOnce(new Error("Step execution failed"))
      
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: "Software Engineer" },
      })
      fireEvent.change(screen.getByLabelText(/company name/i), {
        target: { value: "Tech Corp" },
      })

      const generateButton = screen.getByRole("button", { name: /generate resume/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText("Generation failed during step execution")).toBeInTheDocument()
      })
    })

    it("should handle network errors gracefully", async () => {
      mockGeneratorClient.startGeneration.mockRejectedValue(new Error("Network error"))
      
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: "Software Engineer" },
      })
      fireEvent.change(screen.getByLabelText(/company name/i), {
        target: { value: "Tech Corp" },
      })

      const generateButton = screen.getByRole("button", { name: /generate resume/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText("Generation failed")).toBeInTheDocument()
      })
    })
  })

  describe("Form State Management", () => {
    it("should clear form after successful generation", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      // Fill in form
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: "Software Engineer" },
      })
      fireEvent.change(screen.getByLabelText(/company name/i), {
        target: { value: "Tech Corp" },
      })

      const generateButton = screen.getByRole("button", { name: /generate resume/i })
      fireEvent.click(generateButton)

      // Wait for generation to complete
      await waitFor(() => {
        expect(screen.getByText("Resume generated successfully!")).toBeInTheDocument()
      })

      // Check that form is cleared
      const jobTitleInput = screen.getByLabelText(/job title/i) as HTMLInputElement
      const companyInput = screen.getByLabelText(/company name/i) as HTMLInputElement
      
      expect(jobTitleInput.value).toBe("")
      expect(companyInput.value).toBe("")
    })

    it("should maintain form state during generation", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      // Fill in form
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: "Software Engineer" },
      })
      fireEvent.change(screen.getByLabelText(/company name/i), {
        target: { value: "Tech Corp" },
      })

      const generateButton = screen.getByRole("button", { name: /generate resume/i })
      fireEvent.click(generateButton)

      // During generation, form should be disabled but values should remain
      await waitFor(() => {
        expect(screen.getByText("Generating...")).toBeInTheDocument()
      })

      const jobTitleInput = screen.getByLabelText(/job title/i) as HTMLInputElement
      const companyInput = screen.getByLabelText(/company name/i) as HTMLInputElement
      
      expect(jobTitleInput.value).toBe("Software Engineer")
      expect(companyInput.value).toBe("Tech Corp")
      expect(jobTitleInput).toBeDisabled()
      expect(companyInput).toBeDisabled()
    })
  })

  describe("Progress Tracking", () => {
    it("should show all progress steps in correct order", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      // Fill in form and start generation
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: "Software Engineer" },
      })
      fireEvent.change(screen.getByLabelText(/company name/i), {
        target: { value: "Tech Corp" },
      })

      const generateButton = screen.getByRole("button", { name: /generate resume/i })
      fireEvent.click(generateButton)

      // Verify all steps are shown in order
      await waitFor(() => {
        expect(screen.getByText("Loading your experience data")).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText("AI is generating your resume content")).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText("Creating your resume PDF")).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText("Uploading documents to cloud storage")).toBeInTheDocument()
      })
    })

    it("should show completion status for finished steps", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      // Fill in form and start generation
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: "Software Engineer" },
      })
      fireEvent.change(screen.getByLabelText(/company name/i), {
        target: { value: "Tech Corp" },
      })

      const generateButton = screen.getByRole("button", { name: /generate resume/i })
      fireEvent.click(generateButton)

      // Wait for final completion
      await waitFor(() => {
        expect(screen.getByText("Resume generated successfully!")).toBeInTheDocument()
      })

      // All steps should show as completed
      expect(screen.getByText("Loading your experience data")).toBeInTheDocument()
      expect(screen.getByText("AI is generating your resume content")).toBeInTheDocument()
      expect(screen.getByText("Creating your resume PDF")).toBeInTheDocument()
      expect(screen.getByText("Uploading documents to cloud storage")).toBeInTheDocument()
    })
  })

  describe("Download Functionality", () => {
    it("should provide download links for generated documents", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      // Complete generation flow
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: "Software Engineer" },
      })
      fireEvent.change(screen.getByLabelText(/company name/i), {
        target: { value: "Tech Corp" },
      })

      const generateButton = screen.getByRole("button", { name: /generate resume/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText("Resume generated successfully!")).toBeInTheDocument()
      })

      // Verify download buttons are present
      const resumeDownloadButton = screen.getByText("Download Resume")
      const coverLetterDownloadButton = screen.getByText("Download Cover Letter")

      expect(resumeDownloadButton).toBeInTheDocument()
      expect(coverLetterDownloadButton).toBeInTheDocument()

      // Verify download URLs
      expect(resumeDownloadButton.closest("a")).toHaveAttribute(
        "href",
        "https://storage.example.com/resume.pdf"
      )
      expect(coverLetterDownloadButton.closest("a")).toHaveAttribute(
        "href",
        "https://storage.example.com/cover-letter.pdf"
      )
    })
  })
})
