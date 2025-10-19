export const ROUTES = {
  HOME: "/",
  HOW_IT_WORKS: "/how-it-works",
  CONTENT_ITEMS: "/content-items",
  DOCUMENT_BUILDER: "/document-builder",
  AI_PROMPTS: "/ai-prompts",
  SETTINGS: "/settings",
  // Editor-only routes
  DOCUMENT_HISTORY: "/document-history",
  JOB_APPLICATIONS: "/job-applications",
  JOB_FINDER: "/job-finder",
  QUEUE_MANAGEMENT: "/queue-management",
  JOB_FINDER_CONFIG: "/job-finder-config",
  // Auth
  LOGIN: "/login",
  UNAUTHORIZED: "/unauthorized",
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]

// Editor-only routes that require authentication
export const EDITOR_ROUTES: RoutePath[] = [
  ROUTES.DOCUMENT_HISTORY,
  ROUTES.JOB_APPLICATIONS,
  ROUTES.JOB_FINDER,
  ROUTES.QUEUE_MANAGEMENT,
  ROUTES.JOB_FINDER_CONFIG,
]

// Public routes that anyone can access
export const PUBLIC_ROUTES: RoutePath[] = [
  ROUTES.HOME,
  ROUTES.HOW_IT_WORKS,
  ROUTES.CONTENT_ITEMS,
  ROUTES.DOCUMENT_BUILDER,
  ROUTES.AI_PROMPTS,
  ROUTES.SETTINGS,
  ROUTES.LOGIN,
  ROUTES.UNAUTHORIZED,
]
