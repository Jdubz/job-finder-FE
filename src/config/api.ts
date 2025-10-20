/**
 * API Configuration for job-finder-BE
 *
 * Provides centralized configuration for all backend API endpoints.
 * Supports environment-specific URLs for development, staging, and production.
 */

const isDevelopment = import.meta.env.MODE === "development"
const isStaging = import.meta.env.MODE === "staging"

/**
 * Get the base URL for the current environment
 */
const getBaseUrl = (): string => {
  if (isDevelopment) {
    // Local Firebase emulator or development backend
    return import.meta.env.VITE_USE_EMULATORS === "true"
      ? "http://localhost:5001/job-finder-dev/us-central1"
      : import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/job-finder-dev/us-central1"
  }
  if (isStaging) {
    return "https://us-central1-job-finder-staging.cloudfunctions.net"
  }
  // Production
  return "https://us-central1-job-finder-prod.cloudfunctions.net"
}

const BASE_URL = getBaseUrl()

/**
 * API Configuration
 */
export const API_CONFIG = {
  baseUrl: BASE_URL,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
}

/**
 * Firebase Cloud Functions endpoints
 */
export const api = {
  baseUrl: BASE_URL,

  // Firebase Functions endpoints
  functions: {
    // Document generation
    manageGenerator: `${BASE_URL}/manageGenerator`,

    // Content management
    manageContentItems: `${BASE_URL}/manageContentItems`,

    // Contact form
    handleContactForm: `${BASE_URL}/handleContactForm`,

    // Job queue management
    manageJobQueue: `${BASE_URL}/manageJobQueue`,

    // Settings management
    manageSettings: `${BASE_URL}/manageSettings`,
  },

  // Firestore collections (accessed via Firebase SDK, not REST)
  collections: {
    jobMatches: "job-matches",
    jobQueue: "job-queue",
    contentItems: "content-items",
    documents: "generated-documents",
    settings: "job-finder-config",
    prompts: "ai-prompts",
  },
}

/**
 * Helper function for authenticated requests
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  authToken: string
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  })
}

// Legacy exports for backward compatibility (deprecated)
export const FUNCTION_URLS = {
  jobQueue: api.functions.manageJobQueue,
  generator: api.functions.manageGenerator,
  contentItems: api.functions.manageContentItems,
  contact: api.functions.handleContactForm,
}

export const API_ENDPOINTS = {
  jobQueue: "/job-queue",
  jobMatches: "/job-matches",
  generator: "/generator",
  contentItems: "/content-items",
}
