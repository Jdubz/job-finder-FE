export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
}

// Cloud Function URLs
export const FUNCTION_URLS = {
  jobQueue: import.meta.env.VITE_JOB_QUEUE_API_URL || "",
  generator: import.meta.env.VITE_GENERATOR_API_URL || "",
  experience: import.meta.env.VITE_EXPERIENCE_API_URL || "",
  contentItems: import.meta.env.VITE_CONTENT_ITEMS_API_URL || "",
  contact: import.meta.env.VITE_CONTACT_FUNCTION_URL || "",
}

export const API_ENDPOINTS = {
  jobQueue: "/job-queue",
  jobMatches: "/job-matches",
  generator: "/generator",
  experience: "/experience",
  contentItems: "/content-items",
}
