import { createBrowserRouter, Navigate } from "react-router-dom"
import { lazy, Suspense } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { ROUTES } from "@/types/routes"

// Lazy load pages for code splitting
const HomePage = lazy(() => import("@/pages/HomePage").then((m) => ({ default: m.HomePage })))
const HowItWorksPage = lazy(() =>
  import("@/pages/how-it-works/HowItWorksPage").then((m) => ({
    default: m.HowItWorksPage,
  }))
)
const ContentItemsPage = lazy(() =>
  import("@/pages/content-items/ContentItemsPage").then((m) => ({
    default: m.ContentItemsPage,
  }))
)
const DocumentBuilderPage = lazy(() =>
  import("@/pages/document-builder/DocumentBuilderPage").then((m) => ({
    default: m.DocumentBuilderPage,
  }))
)
const AIPromptsPage = lazy(() =>
  import("@/pages/ai-prompts/AIPromptsPage").then((m) => ({
    default: m.AIPromptsPage,
  }))
)
const SettingsPage = lazy(() =>
  import("@/pages/settings/SettingsPage").then((m) => ({ default: m.SettingsPage }))
)
const DocumentHistoryPage = lazy(() =>
  import("@/pages/document-history/DocumentHistoryPage").then((m) => ({
    default: m.DocumentHistoryPage,
  }))
)
const JobApplicationsPage = lazy(() =>
  import("@/pages/job-applications/JobApplicationsPage").then((m) => ({
    default: m.JobApplicationsPage,
  }))
)
const JobFinderPage = lazy(() =>
  import("@/pages/job-finder/JobFinderPage").then((m) => ({ default: m.JobFinderPage }))
)
const QueueManagementPage = lazy(() =>
  import("@/pages/queue-management/QueueManagementPage").then((m) => ({
    default: m.QueueManagementPage,
  }))
)
const JobFinderConfigPage = lazy(() =>
  import("@/pages/job-finder-config/JobFinderConfigPage").then((m) => ({
    default: m.JobFinderConfigPage,
  }))
)
const UnauthorizedPage = lazy(() =>
  import("@/pages/auth/UnauthorizedPage").then((m) => ({ default: m.UnauthorizedPage }))
)

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  )
}

// Wrapper for lazy loaded components with Suspense
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // Public routes
      {
        path: ROUTES.HOME,
        element: (
          <LazyPage>
            <HomePage />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.HOW_IT_WORKS,
        element: (
          <LazyPage>
            <HowItWorksPage />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.UNAUTHORIZED,
        element: (
          <LazyPage>
            <UnauthorizedPage />
          </LazyPage>
        ),
      },

      // Protected routes (require authentication)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: ROUTES.CONTENT_ITEMS,
            element: (
              <LazyPage>
                <ContentItemsPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.DOCUMENT_BUILDER,
            element: (
              <LazyPage>
                <DocumentBuilderPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.DOCUMENT_HISTORY,
            element: (
              <LazyPage>
                <DocumentHistoryPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.SETTINGS,
            element: (
              <LazyPage>
                <SettingsPage />
              </LazyPage>
            ),
          },
        ],
      },

      // Editor-only protected routes (require editor role)
      {
        element: <ProtectedRoute requireEditor />,
        children: [
          {
            path: ROUTES.AI_PROMPTS,
            element: (
              <LazyPage>
                <AIPromptsPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.JOB_APPLICATIONS,
            element: (
              <LazyPage>
                <JobApplicationsPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.JOB_FINDER,
            element: (
              <LazyPage>
                <JobFinderPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.QUEUE_MANAGEMENT,
            element: (
              <LazyPage>
                <QueueManagementPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.JOB_FINDER_CONFIG,
            element: (
              <LazyPage>
                <JobFinderConfigPage />
              </LazyPage>
            ),
          },
        ],
      },

      // Catch-all redirect
      {
        path: "*",
        element: <Navigate to={ROUTES.HOME} replace />,
      },
    ],
  },
])
