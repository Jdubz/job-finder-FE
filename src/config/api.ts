export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
}

export const API_ENDPOINTS = {
  jobQueue: "/job-queue",
  jobMatches: "/job-matches",
  generator: "/generator",
  experience: "/experience",
  contentItems: "/content-items",
}
