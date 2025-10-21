/**
 * API Configuration for job-finder-BE
 *
 * Provides centralized configuration for all backend API endpoints.
 * Backend (job-finder-BE) is deployed to static-sites-257923 Firebase project.
 * Supports environment-specific URLs for development, staging, and production.
 */

const isDevelopment = import.meta.env.MODE === "development"
const isStaging = import.meta.env.MODE === "staging"

/**
 * Get the base URL for the current environment
 *
 * Development: Uses Firebase emulators (job-finder-dev) or local backend
 * Staging/Production: Uses static-sites-257923 Firebase project
 *   - Staging functions: manageGenerator-staging, manageContentItems-staging, etc.
 *   - Production functions: manageGenerator, manageContentItems, etc. (no suffix)
 */
const getBaseUrl = (): string => {
  if (isDevelopment) {
    // Local Firebase emulator or development backend
    return import.meta.env.VITE_USE_EMULATORS === "true"
      ? "http://localhost:5001/job-finder-dev/us-central1"
      : import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/job-finder-dev/us-central1"
  }
  // Both staging and production use static-sites-257923 project (job-finder-BE deployment)
  // Function names are differentiated by suffix (-staging for staging, none for production)
  return (
    import.meta.env.VITE_API_BASE_URL ||
    "https://us-central1-static-sites-257923.cloudfunctions.net"
  )
}

const BASE_URL = getBaseUrl()

/**
 * Function name suffix for environment-specific functions
 * Staging functions have -staging suffix (e.g., manageJobQueue-staging)
 * Production functions have no suffix (e.g., manageJobQueue)
 */
const FUNCTION_SUFFIX = isStaging ? "-staging" : ""

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
 * Note: Staging functions use -staging suffix, production has no suffix
 */
export const api = {
  baseUrl: BASE_URL,

  // Firebase Functions endpoints
  functions: {
    // Document generation
    manageGenerator: `${BASE_URL}/manageGenerator${FUNCTION_SUFFIX}`,

    // Content management
    manageContentItems: `${BASE_URL}/manageContentItems${FUNCTION_SUFFIX}`,

    // Contact form
    handleContactForm: `${BASE_URL}/contact-form${FUNCTION_SUFFIX}`,

    // Job queue management
    manageJobQueue: `${BASE_URL}/manageJobQueue${FUNCTION_SUFFIX}`,

    // Settings management (if exists)
    manageSettings: `${BASE_URL}/manageSettings${FUNCTION_SUFFIX}`,

    // Experience management
    manageExperience: `${BASE_URL}/manageExperience${FUNCTION_SUFFIX}`,
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
