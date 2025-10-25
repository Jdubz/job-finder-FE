/**
 * Test Utilities and Helpers
 * 
 * Reusable test utilities for document builder tests
 */

import { render, type RenderOptions } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { vi, type Mock } from "vitest"
import type { JobMatch } from "@jsdubzw/job-finder-shared-types"

// Mock data factories
export const createMockUser = (overrides = {}) => ({
  uid: "test-user-123",
  email: "test@example.com",
  displayName: "Test User",
  ...overrides,
})

export const createMockJobMatch = (overrides = {}): JobMatch => ({
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
  ...overrides,
})

export const createMockGenerationStep = (overrides = {}) => ({
  id: "fetch_data",
  name: "Fetch Data",
  description: "Loading your experience data",
  status: "completed" as const,
  startedAt: new Date(),
  completedAt: new Date(),
  duration: 1000,
  ...overrides,
})

export const createMockDocumentHistoryItem = (overrides = {}) => ({
  id: "doc-1",
  type: "resume" as const,
  jobTitle: "Software Engineer",
  companyName: "Tech Corp",
  documentUrl: "https://storage.example.com/resume.pdf",
  createdAt: new Date(),
  status: "completed" as const,
  jobMatchId: "match-1",
  ...overrides,
})

export const createMockGenerationRequest = (overrides = {}) => ({
  generateType: "resume" as const,
  job: {
    role: "Software Engineer",
    company: "Tech Corp",
    jobDescriptionText: "Build amazing software",
  },
  preferences: {
    emphasize: ["React", "TypeScript"],
  },
  date: "2024-01-15",
  ...overrides,
})

export const createMockStartGenerationResponse = (overrides = {}) => ({
  success: true,
  data: {
    requestId: "gen-request-123",
    status: "pending",
    nextStep: "fetch_data",
  },
  requestId: "gen-request-123",
  ...overrides,
})

export const createMockStepResponse = (overrides = {}) => ({
  success: true,
  data: {
    stepCompleted: "fetch_data",
    nextStep: "generate_resume",
    status: "processing",
    steps: [
      createMockGenerationStep(),
      createMockGenerationStep({
        id: "generate_resume",
        name: "Generate Resume",
        description: "AI is generating your resume content",
        status: "in_progress",
        completedAt: undefined,
        duration: undefined,
      }),
    ],
  },
  requestId: "gen-request-123",
  ...overrides,
})

export const createMockFinalResponse = (overrides = {}) => ({
  success: true,
  data: {
    stepCompleted: "upload_documents",
    status: "completed",
    resumeUrl: "https://storage.example.com/resume.pdf",
    coverLetterUrl: "https://storage.example.com/cover-letter.pdf",
    steps: [
      createMockGenerationStep(),
      createMockGenerationStep({
        id: "generate_resume",
        name: "Generate Resume",
        description: "AI is generating your resume content",
      }),
      createMockGenerationStep({
        id: "create_resume_pdf",
        name: "Create Resume PDF",
        description: "Creating your resume PDF",
      }),
      createMockGenerationStep({
        id: "upload_documents",
        name: "Upload Documents",
        description: "Uploading documents to cloud storage",
      }),
    ],
  },
  requestId: "gen-request-123",
  ...overrides,
})

// Test wrapper components
export const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

// Custom render function with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => {
  return render(ui, { wrapper: TestWrapper, ...options })
}

// Mock setup utilities
export const setupMockAuth = (user = createMockUser()) => {
  const mockUseAuth = vi.fn().mockReturnValue({
    user,
    loading: false,
  })
  
  vi.doMock("@/contexts/AuthContext", () => ({
    useAuth: mockUseAuth,
  }))
  
  return mockUseAuth
}

export const setupMockJobMatches = (matches = [createMockJobMatch()]) => {
  const mockGetMatches = vi.fn().mockResolvedValue(matches)
  
  vi.doMock("@/api/job-matches-client", () => ({
    jobMatchesClient: {
      getMatches: mockGetMatches,
      getMatch: vi.fn(),
      updateMatch: vi.fn(),
      deleteMatch: vi.fn(),
    },
  }))
  
  return mockGetMatches
}

export const setupMockGeneratorClient = () => {
  const mockStartGeneration = vi.fn()
  const mockExecuteStep = vi.fn()
  const mockGetHistory = vi.fn()
  const mockDeleteDocument = vi.fn()
  
  vi.doMock("@/api/generator-client", () => ({
    generatorClient: {
      startGeneration: mockStartGeneration,
      executeStep: mockExecuteStep,
      getHistory: mockGetHistory,
      deleteDocument: mockDeleteDocument,
      generateDocument: vi.fn(),
      getUserDefaults: vi.fn(),
      updateUserDefaults: vi.fn(),
    },
  }))
  
  return {
    mockStartGeneration,
    mockExecuteStep,
    mockGetHistory,
    mockDeleteDocument,
  }
}

export const setupMockFirestore = () => {
  const mockDeleteDocument = vi.fn()
  const mockGetDocuments = vi.fn()
  
  vi.doMock("@/contexts/FirestoreContext", () => ({
    useFirestore: vi.fn().mockReturnValue({
      service: {
        deleteDocument: mockDeleteDocument,
        getDocuments: mockGetDocuments,
      },
    }),
  }))
  
  return {
    mockDeleteDocument,
    mockGetDocuments,
  }
}

// Form interaction utilities
export const fillJobForm = async (
  jobTitle: string,
  companyName: string,
  jobDescription?: string,
  professionalSummary?: string
) => {
  const jobTitleInput = screen.getByLabelText(/job title/i)
  const companyInput = screen.getByLabelText(/company name/i)
  
  fireEvent.change(jobTitleInput, { target: { value: jobTitle } })
  fireEvent.change(companyInput, { target: { value: companyName } })
  
  if (jobDescription) {
    const jobDescriptionTextarea = screen.getByLabelText(/job description/i)
    fireEvent.change(jobDescriptionTextarea, { target: { value: jobDescription } })
  }
  
  if (professionalSummary) {
    const summaryTextarea = screen.getByLabelText(/professional summary override/i)
    fireEvent.change(summaryTextarea, { target: { value: professionalSummary } })
  }
}

export const selectJobMatch = async (jobTitle: string) => {
  const jobSelect = screen.getByRole("combobox")
  fireEvent.click(jobSelect)
  
  const option = screen.getByText(jobTitle)
  fireEvent.click(option)
}

export const selectDocumentType = (type: "resume" | "cover_letter") => {
  const documentTypeSelect = screen.getByRole("combobox", { name: /document type/i })
  fireEvent.click(documentTypeSelect)
  
  const option = screen.getByText(type === "resume" ? "Resume" : "Cover Letter")
  fireEvent.click(option)
}

export const startGeneration = () => {
  const generateButton = screen.getByRole("button", { name: /generate/i })
  fireEvent.click(generateButton)
}

export const clearForm = () => {
  const clearButton = screen.getByRole("button", { name: /clear form/i })
  fireEvent.click(clearButton)
}

// Assertion utilities
export const expectFormToBeCleared = () => {
  const jobTitleInput = screen.getByLabelText(/job title/i) as HTMLInputElement
  const companyInput = screen.getByLabelText(/company name/i) as HTMLInputElement
  
  expect(jobTitleInput.value).toBe("")
  expect(companyInput.value).toBe("")
}

export const expectFormToBePopulated = (jobTitle: string, companyName: string) => {
  const jobTitleInput = screen.getByLabelText(/job title/i) as HTMLInputElement
  const companyInput = screen.getByLabelText(/company name/i) as HTMLInputElement
  
  expect(jobTitleInput.value).toBe(jobTitle)
  expect(companyInput.value).toBe(companyName)
}

export const expectGenerationToStart = (mockStartGeneration: Mock) => {
  expect(mockStartGeneration).toHaveBeenCalledWith(
    expect.objectContaining({
      generateType: expect.any(String),
      job: expect.objectContaining({
        role: expect.any(String),
        company: expect.any(String),
      }),
    })
  )
}

export const expectProgressSteps = (steps: string[]) => {
  steps.forEach(step => {
    expect(screen.getByText(step)).toBeInTheDocument()
  })
}

export const expectDownloadButtons = () => {
  expect(screen.getByText("Download Resume")).toBeInTheDocument()
  expect(screen.getByText("Download Cover Letter")).toBeInTheDocument()
}

export const expectSuccessMessage = () => {
  expect(screen.getByText(/generated successfully/)).toBeInTheDocument()
}

export const expectErrorMessage = (message: string) => {
  expect(screen.getByText(message)).toBeInTheDocument()
}

// Wait utilities
export const waitForGenerationToStart = async () => {
  await waitFor(() => {
    expect(screen.getByText("Generating...")).toBeInTheDocument()
  })
}

export const waitForGenerationToComplete = async () => {
  await waitFor(() => {
    expect(screen.getByText(/generated successfully/)).toBeInTheDocument()
  })
}

export const waitForError = async (message: string) => {
  await waitFor(() => {
    expect(screen.getByText(message)).toBeInTheDocument()
  })
}

// Mock window utilities
export const mockWindowOpen = () => {
  const mockOpen = vi.fn()
  Object.defineProperty(window, "open", {
    writable: true,
    value: mockOpen,
  })
  return mockOpen
}

export const mockWindowConfirm = (returnValue: boolean) => {
  const mockConfirm = vi.fn().mockReturnValue(returnValue)
  Object.defineProperty(window, "confirm", {
    writable: true,
    value: mockConfirm,
  })
  return mockConfirm
}

export const mockWindowAlert = () => {
  const mockAlert = vi.fn()
  Object.defineProperty(window, "alert", {
    writable: true,
    value: mockAlert,
  })
  return mockAlert
}

// Test data generators
export const generateMockJobMatches = (count: number) => {
  return Array.from({ length: count }, (_, i) => 
    createMockJobMatch({
      id: `match-${i + 1}`,
      jobTitle: `Job ${i + 1}`,
      companyName: `Company ${i + 1}`,
    })
  )
}

export const generateMockDocuments = (count: number) => {
  return Array.from({ length: count }, (_, i) => 
    createMockDocumentHistoryItem({
      id: `doc-${i + 1}`,
      jobTitle: `Job ${i + 1}`,
      companyName: `Company ${i + 1}`,
    })
  )
}

// Performance testing utilities
export const measureRenderTime = (renderFn: () => void) => {
  const start = performance.now()
  renderFn()
  const end = performance.now()
  return end - start
}

export const measureAsyncOperation = async (operation: () => Promise<void>) => {
  const start = performance.now()
  await operation()
  const end = performance.now()
  return end - start
}

// Accessibility testing utilities
export const checkA11y = (container: HTMLElement) => {
  // Check for proper heading hierarchy
  const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6")
  const headingLevels = Array.from(headings).map(h => parseInt(h.tagName[1]))
  
  // Check for proper ARIA labels
  const interactiveElements = container.querySelectorAll("button, input, select, textarea")
  const elementsWithLabels = Array.from(interactiveElements).filter(el => 
    el.hasAttribute("aria-label") || 
    el.hasAttribute("aria-labelledby") ||
    el.closest("label")
  )
  
  return {
    hasProperHeadingHierarchy: headingLevels.every((level, i) => 
      i === 0 || level <= headingLevels[i - 1] + 1
    ),
    allInteractiveElementsHaveLabels: elementsWithLabels.length === interactiveElements.length,
  }
}
