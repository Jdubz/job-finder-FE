import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { ROUTES } from "@/types/routes"

interface ProtectedRouteProps {
  requireEditor?: boolean
  redirectTo?: string
}

export function ProtectedRoute({
  requireEditor = false,
  redirectTo = ROUTES.HOME,
}: ProtectedRouteProps) {
  const { user, loading, isEditor } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    // Redirect to home instead of login page (auth modal handles login)
    return <Navigate to={redirectTo} replace />
  }

  if (requireEditor && !isEditor) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />
  }

  return <Outlet />
}
