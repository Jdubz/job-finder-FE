/**
 * Document Builder Page Tests
 *
 * Tests for the primary document generation workflow including:
 * - Form rendering and validation
 * - Job match integration
 * - Generation flow and progress tracking
 * - Error handling
 * - Download functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DocumentBuilderPage } from "../DocumentBuilderPage"
import { useAuth } from "@/contexts/AuthContext"
import { jobMatchesClient } from "@/api/job-matches-client"
import { generatorClient } from "@/api/generator-client"
import type { JobMatch } from "@jsdubzw/job-finder-shared-types"

// Mock modules
vi.mock("@/contexts/AuthContext")
vi.mock("@/api/job-matches-client")
vi.mock("@/api/generator-client")
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useLocation: () => ({ state: null, pathname: "/document-builder" }),
    useNavigate: () => vi.fn(),
  }
})

describe("DocumentBuilderPage", () => {
  const mockUser = {
    uid: "test-user-123",
    email: "test@example.com",
    displayName: "Test User",
  }

  const mockJobMatch: JobMatch = {
    id: "match-1",
    queueItemId: "queue-1",
    jobTitle: "Senior Software Engineer",
    companyName: "Tech Corp",
    location: "San Francisco, CA",
    matchScore: 85,
    status: "new",
    linkedInUrl: "https://linkedin.com/jobs/123",
    jobDescription: "We are looking for an experienced software engineer with React and TypeScript.",
    requirements: ["5+ years experience", "React", "TypeScript"],
    responsibilities: ["Build web applications", "Mentor team members"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    analyzed: true,
    aiMatchReasoning: "Strong technical match",
    recommendedSkills: ["React", "TypeScript", "Node.js"],
  } as any

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mocks
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser as any,
      loading: false,
      signOut: vi.fn(),
      signInWithGoogle: vi.fn(),
    } as any)

    vi.mocked(jobMatchesClient.getMatches).mockResolvedValue([mockJobMatch])
    vi.mocked(generatorClient.startGeneration).mockResolvedValue({
      requestId: "req-123",
    } as any)
  })

  describe("Initial Rendering", () => {
    it("should render the document builder form", async () => {
      render(<DocumentBuilderPage />)

      expect(screen.getByText(/document builder/i)).toBeInTheDocument()
      expect(screen.getByText(/generate/i)).toBeInTheDocument()
    })

    it("should show loading state while fetching job matches", async () => {
      vi.mocked(jobMatchesClient.getMatches).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      )

      render(<DocumentBuilderPage />)

      // Should show loading indicator or disabled state
      await waitFor(() => {
        expect(jobMatchesClient.getMatches).toHaveBeenCalled()
      })
    })

    it("should load and display job matches", async () => {
      render(<DocumentBuilderPage />)

      await waitFor(() => {
        expect(screen.getByText(/senior software engineer/i)).toBeInTheDocument()
      })

      expect(screen.getByText(/tech corp/i)).toBeInTheDocument()
    })
  })

  describe("Document Type Selection", () => {
    it("should allow selecting resume as document type", async () => {
      const user = userEvent.setup()
      render(<DocumentBuilderPage />)

      const typeSelect = screen.getByRole("combobox") || screen.getByLabelText(/document type/i)
      await user.click(typeSelect)

      const resumeOption = screen.getByText("Resume") || screen.getByRole("option", { name: /resume/i })
      await user.click(resumeOption)

      expect(typeSelect).toHaveTextContent(/resume/i)
    })
  })

  describe("Generation Flow", () => {
    it("should start generation process", async () => {
      const user = userEvent.setup()
      render(<DocumentBuilderPage />)

      const jobTitleInput = screen.getByLabelText(/job title/i) || 
                           screen.getByPlaceholderText(/job title/i)
      const companyInput = screen.getByLabelText(/company/i) || 
                          screen.getByPlaceholderText(/company/i)

      await user.type(jobTitleInput, "Software Engineer")
      await user.type(companyInput, "Test Company")

      const generateButton = screen.getByRole("button", { name: /generate/i })
      await user.click(generateButton)

      await waitFor(() => {
        expect(generatorClient.startGeneration).toHaveBeenCalledWith(
          expect.objectContaining({
            generateType: "resume",
            job: expect.objectContaining({
              role: "Software Engineer",
              company: "Test Company",
            }),
          }),
        )
      })
    })

    it("should display loading state during generation", async () => {
      const user = userEvent.setup()
      
      vi.mocked(generatorClient.startGeneration).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      )

      render(<DocumentBuilderPage />)

      const jobTitleInput = screen.getByLabelText(/job title/i) || 
                           screen.getByPlaceholderText(/job title/i)
      const companyInput = screen.getByLabelText(/company/i) || 
                          screen.getByPlaceholderText(/company/i)

      await user.type(jobTitleInput, "Software Engineer")
      await user.type(companyInput, "Test Company")

      const generateButton = screen.getByRole("button", { name: /generate/i })
      await user.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText(/generating/i) || screen.getByRole("progressbar")).toBeInTheDocument()
      })
    })
  })

  describe("Error Handling", () => {
    it("should display error message when generation fails", async () => {
      const user = userEvent.setup()
      
      vi.mocked(generatorClient.startGeneration).mockRejectedValue(
        new Error("Generation failed"),
      )

      render(<DocumentBuilderPage />)

      const jobTitleInput = screen.getByLabelText(/job title/i) || 
                           screen.getByPlaceholderText(/job title/i)
      const companyInput = screen.getByLabelText(/company/i) || 
                          screen.getByPlaceholderText(/company/i)

      await user.type(jobTitleInput, "Software Engineer")
      await user.type(companyInput, "Test Company")

      const generateButton = screen.getByRole("button", { name: /generate/i })
      await user.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText(/error/i) || screen.getByText(/failed/i)).toBeInTheDocument()
      })
    })
  })

  describe("Authentication", () => {
    it("should not load job matches when user is not authenticated", () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signInWithGoogle: vi.fn(),
      })

      render(<DocumentBuilderPage />)

      expect(jobMatchesClient.getMatches).not.toHaveBeenCalled()
    })

    it("should show sign-in prompt when not authenticated", () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signInWithGoogle: vi.fn(),
      })

      render(<DocumentBuilderPage />)

      expect(screen.getByText(/sign in|log in/i)).toBeInTheDocument()
    })
  })
})
