/**
 * Mock Data Fixtures
 *
 * Test data for integration and E2E tests
 */

import type {
  QueueItem,
  JobMatch,
  QueueSettings,
  AISettings,
} from "@jsdubzw/job-finder-shared-types"

/**
 * Mock Queue Items
 */
export const mockQueueItem: QueueItem = {
  id: "queue-test-123",
  userId: "test-user-123",
  linkedInUrl: "https://www.linkedin.com/jobs/view/123456789",
  jobTitle: "Senior Software Engineer",
  company: "Test Company Inc",
  status: "pending",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  stage: "queued",
  priority: 0,
}

export const mockProcessingQueueItem: QueueItem = {
  ...mockQueueItem,
  id: "queue-test-processing",
  status: "processing",
  stage: "scraping",
  startedAt: new Date().toISOString(),
}

export const mockCompletedQueueItem: QueueItem = {
  ...mockQueueItem,
  id: "queue-test-completed",
  status: "completed",
  stage: "completed",
  completedAt: new Date().toISOString(),
  matchScore: 85,
}

export const mockFailedQueueItem: QueueItem = {
  ...mockQueueItem,
  id: "queue-test-failed",
  status: "failed",
  stage: "failed",
  error: "Failed to scrape job details",
  failedAt: new Date().toISOString(),
}

/**
 * Mock Job Matches
 */
export const mockJobMatch: JobMatch = {
  id: "match-test-123",
  userId: "test-user-123",
  queueItemId: "queue-test-123",
  jobTitle: "Senior Software Engineer",
  company: "Test Company Inc",
  location: "San Francisco, CA",
  salary: "$150,000 - $200,000",
  matchScore: 85,
  status: "new",
  linkedInUrl: "https://www.linkedin.com/jobs/view/123456789",
  jobDescription: "We are looking for an experienced software engineer to join our team...",
  requirements: [
    "5+ years of software development experience",
    "Strong proficiency in React and TypeScript",
    "Experience with cloud platforms (AWS, GCP, or Azure)",
    "Excellent problem-solving skills",
  ],
  responsibilities: [
    "Design and implement scalable web applications",
    "Collaborate with cross-functional teams",
    "Mentor junior developers",
    "Participate in code reviews",
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  analyzed: true,
  aiMatchReasoning: "Strong match based on technical skills and experience level",
  recommendedSkills: ["React", "TypeScript", "Node.js", "AWS"],
}

export const mockHighScoreJobMatch: JobMatch = {
  ...mockJobMatch,
  id: "match-test-high-score",
  matchScore: 95,
  status: "viewed",
}

export const mockLowScoreJobMatch: JobMatch = {
  ...mockJobMatch,
  id: "match-test-low-score",
  matchScore: 65,
  jobTitle: "Junior Developer",
  company: "Startup Inc",
}

export const mockAppliedJobMatch: JobMatch = {
  ...mockJobMatch,
  id: "match-test-applied",
  status: "applied",
  appliedAt: new Date().toISOString(),
}

/**
 * Mock Content Items
 */
export const mockExperienceItem = {
  id: "exp-test-123",
  type: "experience" as const,
  title: "Senior Software Engineer",
  company: "Tech Corp",
  location: "San Francisco, CA",
  startDate: "2020-01-01",
  endDate: "2023-12-31",
  current: false,
  description: "Led development of multiple high-impact features",
  achievements: [
    "Improved application performance by 40%",
    "Mentored 5 junior developers",
    "Architected microservices migration",
  ],
  skills: ["React", "TypeScript", "Node.js", "AWS"],
  visibility: "public" as const,
  order: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const mockProjectItem = {
  id: "proj-test-123",
  type: "project" as const,
  title: "E-commerce Platform",
  description: "Built a scalable e-commerce platform serving 1M+ users",
  technologies: ["React", "Node.js", "PostgreSQL", "Redis"],
  url: "https://github.com/user/project",
  startDate: "2022-01-01",
  endDate: "2022-12-31",
  highlights: [
    "Implemented real-time inventory management",
    "Achieved 99.9% uptime",
    "Reduced page load time by 50%",
  ],
  visibility: "public" as const,
  order: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const mockSkillItem = {
  id: "skill-test-123",
  type: "skill" as const,
  name: "React",
  category: "Frontend",
  proficiency: "expert" as const,
  yearsOfExperience: 5,
  description: "Expert-level React development with hooks and context",
  visibility: "public" as const,
  order: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

/**
 * Mock Document Generation Request
 */
export const mockGenerateResumeRequest = {
  type: "resume" as const,
  jobMatchId: "match-test-123",
  jobUrl: "https://www.linkedin.com/jobs/view/123456789",
  jobTitle: "Senior Software Engineer",
  companyName: "Test Company Inc",
  jobDescription: "We are looking for an experienced software engineer...",
  customization: {
    targetSummary: "Experienced software engineer specializing in React and TypeScript",
    skillsPriority: ["React", "TypeScript", "Node.js"],
    experienceHighlights: [
      {
        company: "Tech Corp",
        title: "Senior Software Engineer",
        pointsToEmphasize: [
          "Led development of multiple high-impact features",
          "Improved application performance by 40%",
        ],
      },
    ],
  },
  preferences: {
    provider: "openai" as const,
    tone: "professional",
    includeProjects: true,
  },
}

export const mockGenerateCoverLetterRequest = {
  type: "cover_letter" as const,
  jobMatchId: "match-test-123",
  jobUrl: "https://www.linkedin.com/jobs/view/123456789",
  jobTitle: "Senior Software Engineer",
  companyName: "Test Company Inc",
  jobDescription: "We are looking for an experienced software engineer...",
  preferences: {
    provider: "openai" as const,
    tone: "enthusiastic",
  },
}

/**
 * Mock Document Response
 */
export const mockDocumentResponse = {
  success: true,
  message: "Document generated successfully",
  documentId: "doc-test-123",
  documentUrl: "https://storage.example.com/documents/doc-test-123.pdf",
  generationId: "gen-test-123",
}

/**
 * Mock Document History Items
 */
export const mockDocumentHistoryItem = {
  id: "doc-test-123",
  type: "resume" as const,
  jobTitle: "Senior Software Engineer",
  companyName: "Test Company Inc",
  documentUrl: "https://storage.example.com/documents/doc-test-123.pdf",
  createdAt: new Date(),
  jobMatchId: "match-test-123",
}

/**
 * Mock User Defaults
 */
export const mockUserDefaults = {
  name: "Test User",
  email: "test@example.com",
  phone: "+1-555-0123",
  location: "San Francisco, CA",
  linkedin: "https://www.linkedin.com/in/testuser",
  github: "https://github.com/testuser",
  portfolio: "https://testuser.dev",
  summary: "Experienced software engineer with a passion for building scalable applications",
}

/**
 * Mock Configuration Settings
 */
export const mockStopList = {
  companies: ["Bad Company Inc", "Unethical Corp"],
  keywords: ["unpaid", "intern", "no salary"],
  domains: ["badcompany.com"],
}

export const mockQueueSettings: QueueSettings = {
  max_concurrent_jobs: 5,
  retry_attempts: 3,
  retry_delay_seconds: 60,
  job_timeout_seconds: 300,
}

export const mockAISettings: AISettings = {
  model: "gpt-4",
  temperature: 0.7,
  max_tokens: 2000,
  top_p: 1.0,
}

/**
 * Mock AI Prompts
 */
export const mockPromptConfig = {
  resume_generation: `Generate a professional resume for {{candidate_name}} applying for {{job_title}} at {{company}}.

Job Description:
{{job_description}}

Requirements:
{{job_requirements}}

Candidate Experience:
{{candidate_experience}}

Include a compelling summary, relevant skills, and tailored experience descriptions.`,

  cover_letter_generation: `Generate an enthusiastic cover letter for {{candidate_name}} applying for {{job_title}} at {{company}}.

Job Description:
{{job_description}}

Candidate Background:
{{candidate_summary}}

Express genuine interest in the role and company, highlight relevant experience, and explain why the candidate is a great fit.`,

  job_matching: `Analyze the following job posting and determine match score (0-100) for the candidate.

Job Title: {{job_title}}
Company: {{company}}
Description: {{job_description}}
Requirements: {{job_requirements}}

Candidate Skills: {{candidate_skills}}
Candidate Experience: {{candidate_experience}}

Provide a match score and explain the reasoning.`,
}

/**
 * Mock API Error Responses
 */
export const mockErrorResponses = {
  unauthorized: {
    error: "Unauthorized",
    message: "Authentication required",
    statusCode: 401,
  },
  forbidden: {
    error: "Forbidden",
    message: "Insufficient permissions",
    statusCode: 403,
  },
  badRequest: {
    error: "Bad Request",
    message: "Invalid request parameters",
    statusCode: 400,
  },
  notFound: {
    error: "Not Found",
    message: "Resource not found",
    statusCode: 404,
  },
  rateLimited: {
    error: "Too Many Requests",
    message: "Rate limit exceeded. Please try again later.",
    statusCode: 429,
  },
  serverError: {
    error: "Internal Server Error",
    message: "An unexpected error occurred",
    statusCode: 500,
  },
}

/**
 * Mock Queue Stats
 */
export const mockQueueStats = {
  total: 100,
  pending: 10,
  processing: 5,
  completed: 75,
  failed: 8,
  skipped: 2,
}

/**
 * Mock System Health
 */
export const mockSystemHealth = {
  status: "healthy" as const,
  timestamp: new Date().toISOString(),
  services: {
    database: { status: "healthy", latency: 15 },
    queue: { status: "healthy", latency: 20 },
    ai: { status: "healthy", latency: 250 },
  },
  metrics: {
    activeJobs: 5,
    queueLength: 10,
    avgProcessingTime: 45000,
  },
}
