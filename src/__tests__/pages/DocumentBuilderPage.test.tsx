/**
 * DocumentBuilderPage Unit Tests
 * 
 * Comprehensive tests for the document builder page functionality
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
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useLocation: () => ({
      state: null,
    }),
  }
})

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
  {
    id: "match-2",
    userId: "test-user-123",
    queueItemId: "queue-2",
    jobTitle: "Frontend Developer",
    companyName: "Startup Inc",
    location: "Remote",
    salary: "$120,000 - $150,000",
    matchScore: 75,
    status: "new",
    linkedInUrl: "https://linkedin.com/jobs/456",
    jobDescription: "Join our growing frontend team...",
    requirements: ["3+ years experience", "React", "CSS"],
    responsibilities: ["Build user interfaces", "Collaborate with designers"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    analyzed: true,
    aiMatchReasoning: "Good frontend skills match",
    recommendedSkills: ["React", "CSS", "JavaScript"],
  },
]

const mockGenerationResponse = {
  success: true,
  data: {
    requestId: "gen-request-123",
    status: "pending",
    nextStep: "fetch_data",
  },
  requestId: "gen-request-123",
}

const mockStepResponse = {
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
}

const mockFinalResponse = {
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
    ],
  },
  requestId: "gen-request-123",
}

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe("DocumentBuilderPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    })
    
    mockJobMatchesClient.getMatches.mockResolvedValue(mockJobMatches)
    mockGeneratorClient.startGeneration.mockResolvedValue(mockGenerationResponse)
    mockGeneratorClient.executeStep.mockResolvedValue(mockStepResponse)
  })

  describe("Page Rendering", () => {
    it("should render the document builder page", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      expect(screen.getByText("Document Builder")).toBeInTheDocument()
      expect(screen.getByText("Generate custom resumes and cover letters with AI")).toBeInTheDocument()
    })

    it("should render both generate and history tabs", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      expect(screen.getByText("Generate New")).toBeInTheDocument()
      expect(screen.getByText("Document History")).toBeInTheDocument()
    })

    it("should show job matches loading state", async () => {
      mockJobMatchesClient.getMatches.mockImplementation(() => new Promise(() => {}))
      
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      expect(screen.getByText("Loading matches...")).toBeInTheDocument()
    })

    it("should show no job matches message when no matches found", async () => {
      mockJobMatchesClient.getMatches.mockResolvedValue([])
      
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText("No job matches found.")).toBeInTheDocument()
      })
    })
  })

  describe("Job Match Selection", () => {
    it("should display job matches in dropdown", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument()
        expect(screen.getByText("Frontend Developer")).toBeInTheDocument()
      })
    })

    it("should auto-populate form when job match is selected", async () => {
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

      // Check if form fields are populated
      const jobTitleInput = screen.getByDisplayValue("Senior Software Engineer")
      const companyInput = screen.getByDisplayValue("Tech Corp")
      
      expect(jobTitleInput).toBeInTheDocument()
      expect(companyInput).toBeInTheDocument()
    })

    it("should show match score and analysis date for selected job", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument()
      })

      const jobSelect = screen.getByRole("combobox")
      fireEvent.click(jobSelect)
      
      const firstOption = screen.getByText("Senior Software Engineer")
      fireEvent.click(firstOption)

      await waitFor(() => {
        expect(screen.getByText(/Match Score: 85%/)).toBeInTheDocument()
        expect(screen.getByText(/Analyzed/)).toBeInTheDocument()
      })
    })

    it("should handle job matches with different field name formats", async () => {
      // Mock job matches with snake_case fields
      const mockMatchesWithSnakeCase = [
        {
          id: "match-1",
          job_title: "Python Developer",
          company_name: "Data Corp",
          location: "San Francisco, CA",
          job_description: "Work with Python and data science",
          match_score: 85,
          analyzed_at: new Date("2024-01-15")
        }
      ]

      // Mock the API call to return snake_case data
      mockJobMatchesClient.getMatches.mockResolvedValueOnce(mockMatchesWithSnakeCase)

      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      // Wait for job matches to load
      await waitFor(() => {
        expect(screen.getByText("Python Developer")).toBeInTheDocument()
      })

      // Select job match
      const jobSelect = screen.getByRole("combobox")
      fireEvent.click(jobSelect)
      const firstOption = screen.getByText("Python Developer")
      fireEvent.click(firstOption)

      // Check that form is auto-populated with normalized data
      const jobTitleInput = screen.getByDisplayValue("Python Developer")
      const companyInput = screen.getByDisplayValue("Data Corp")
      
      expect(jobTitleInput).toBeInTheDocument()
      expect(companyInput).toBeInTheDocument()
    })
  })

  describe("Document Type Selection", () => {
    it("should allow switching between resume, cover letter, and both", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      const documentTypeSelect = screen.getByRole("combobox", { name: /document type/i })
      
      // Should default to resume
      expect(documentTypeSelect).toHaveValue("resume")
      
      // Switch to cover letter
      fireEvent.click(documentTypeSelect)
      const coverLetterOption = screen.getByText("Cover Letter")
      fireEvent.click(coverLetterOption)
      
      expect(documentTypeSelect).toHaveValue("cover_letter")
      
      // Switch to both
      fireEvent.click(documentTypeSelect)
      const bothOption = screen.getByText("Both Resume & Cover Letter")
      fireEvent.click(bothOption)
      
      expect(documentTypeSelect).toHaveValue("both")
    })
  })

  describe("Form Validation", () => {
    it("should require job title and company name", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      const generateButton = screen.getByRole("button", { name: /generate/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText("Job title and company name are required")).toBeInTheDocument()
      })
    })

    it("should require user authentication", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      })

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

      const generateButton = screen.getByRole("button", { name: /generate/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText("You must be logged in to generate documents")).toBeInTheDocument()
      })
    })
  })

  describe("Document Generation Flow", () => {
    beforeEach(() => {
      // Setup successful generation flow
      mockGeneratorClient.executeStep
        .mockResolvedValueOnce(mockStepResponse)
        .mockResolvedValueOnce(mockFinalResponse)
    })

    it("should start generation when form is submitted", async () => {
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
        expect(mockGeneratorClient.startGeneration).toHaveBeenCalledWith({
          generateType: "resume",
          job: {
            role: "Software Engineer",
            company: "Tech Corp",
            jobDescriptionText: undefined,
          },
          jobMatchId: undefined,
          date: expect.any(String),
          preferences: undefined,
        })
      })
    })

    it("should show loading state during generation", async () => {
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
        expect(screen.getByText("Generating...")).toBeInTheDocument()
      })
    })

    it("should show progress steps during generation", async () => {
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
        expect(screen.getByText("Loading your experience data")).toBeInTheDocument()
        expect(screen.getByText("AI is generating your resume content")).toBeInTheDocument()
      })
    })

    it("should show download buttons when generation completes", async () => {
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
        expect(screen.getByText("Download Resume")).toBeInTheDocument()
        expect(screen.getByText("Download Cover Letter")).toBeInTheDocument()
      })
    })

    it("should show success message when generation completes", async () => {
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
        expect(screen.getByText("Resume generated successfully!")).toBeInTheDocument()
      })
    })

    it("should clear form after successful generation", async () => {
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
        expect(screen.getByText("Resume generated successfully!")).toBeInTheDocument()
      })

      // Check that form is cleared
      const jobTitleInput = screen.getByLabelText(/job title/i) as HTMLInputElement
      const companyInput = screen.getByLabelText(/company name/i) as HTMLInputElement
      
      expect(jobTitleInput.value).toBe("")
      expect(companyInput.value).toBe("")
    })
  })

  describe("Error Handling", () => {
    it("should show error message when generation fails", async () => {
      mockGeneratorClient.startGeneration.mockRejectedValue(new Error("Generation failed"))
      
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

    it("should show error message when step execution fails", async () => {
      mockGeneratorClient.executeStep.mockRejectedValue(new Error("Step execution failed"))
      
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
  })

  describe("Customization Options", () => {
    it("should allow custom job description input", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      const jobDescriptionTextarea = screen.getByLabelText(/job description/i)
      fireEvent.change(jobDescriptionTextarea, {
        target: { value: "Custom job description for testing" },
      })

      expect(jobDescriptionTextarea).toHaveValue("Custom job description for testing")
    })

    it("should allow professional summary override", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      const summaryTextarea = screen.getByLabelText(/professional summary override/i)
      fireEvent.change(summaryTextarea, {
        target: { value: "Custom professional summary" },
      })

      expect(summaryTextarea).toHaveValue("Custom professional summary")
    })

    it("should include customization in generation request", async () => {
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
      fireEvent.change(screen.getByLabelText(/job description/i), {
        target: { value: "Custom job description" },
      })
      fireEvent.change(screen.getByLabelText(/professional summary override/i), {
        target: { value: "Custom summary" },
      })

      const generateButton = screen.getByRole("button", { name: /generate resume/i })
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(mockGeneratorClient.startGeneration).toHaveBeenCalledWith({
          generateType: "resume",
          job: {
            role: "Software Engineer",
            company: "Tech Corp",
            jobDescriptionText: "Custom job description",
          },
          jobMatchId: undefined,
          date: expect.any(String),
          preferences: {
            emphasize: ["Custom summary"],
          },
        })
      })
    })
  })

  describe("Both Documents Generation", () => {
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
  })

  describe("Form Reset", () => {
    it("should clear form when clear button is clicked", async () => {
      render(
        <TestWrapper>
          <DocumentBuilderPage />
        </TestWrapper>
      )

      // Fill in form fields
      fireEvent.change(screen.getByLabelText(/job title/i), {
        target: { value: "Software Engineer" },
      })
      fireEvent.change(screen.getByLabelText(/company name/i), {
        target: { value: "Tech Corp" },
      })

      // Click clear button
      const clearButton = screen.getByRole("button", { name: /clear form/i })
      fireEvent.click(clearButton)

      // Check that form is cleared
      const jobTitleInput = screen.getByLabelText(/job title/i) as HTMLInputElement
      const companyInput = screen.getByLabelText(/company name/i) as HTMLInputElement
      
      expect(jobTitleInput.value).toBe("")
      expect(companyInput.value).toBe("")
    })
  })
})
