import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { ROUTES } from "@/types/routes"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import { useState } from "react"

const publicLinks = [
  { to: ROUTES.HOME, label: "Home" },
  { to: ROUTES.HOW_IT_WORKS, label: "How It Works" },
  { to: ROUTES.CONTENT_ITEMS, label: "Content Items" },
  { to: ROUTES.DOCUMENT_BUILDER, label: "Document Builder" },
  { to: ROUTES.AI_PROMPTS, label: "AI Prompts" },
  { to: ROUTES.SETTINGS, label: "Settings" },
]

const editorLinks = [
  { to: ROUTES.DOCUMENT_HISTORY, label: "Document History" },
  { to: ROUTES.JOB_APPLICATIONS, label: "Job Applications" },
  { to: ROUTES.JOB_FINDER, label: "Job Finder" },
  { to: ROUTES.QUEUE_MANAGEMENT, label: "Queue Management" },
  { to: ROUTES.JOB_FINDER_CONFIG, label: "Config" },
  { to: ROUTES.SYSTEM_HEALTH, label: "System Health" },
]

export function Navigation() {
  const { user, isEditor, signOut } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
  }

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link to={ROUTES.HOME} className="text-lg font-semibold">
            Job Finder
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {publicLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive(link.to) ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}

            {isEditor && (
              <>
                <div className="h-6 w-px bg-border" />
                {editorLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive(link.to) ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}

            {user && (
              <>
                <div className="h-6 w-px bg-border" />
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t">
            {publicLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-4 py-2 text-sm font-medium transition-colors hover:bg-accent rounded-md",
                  isActive(link.to) ? "text-primary bg-accent" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}

            {isEditor && (
              <>
                <div className="h-px bg-border my-2" />
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                  Editor Tools
                </div>
                {editorLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block px-4 py-2 text-sm font-medium transition-colors hover:bg-accent rounded-md",
                      isActive(link.to) ? "text-primary bg-accent" : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}

            {user && (
              <>
                <div className="h-px bg-border my-2" />
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
