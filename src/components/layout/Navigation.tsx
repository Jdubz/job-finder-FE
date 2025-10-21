import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { ROUTES } from "@/types/routes"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { AuthIcon } from "@/components/auth/AuthIcon"
import { AuthModalDebug as AuthModal } from "@/components/auth/AuthModalDebug"

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
  const { isEditor } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

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

            <div className="h-6 w-px bg-border" />
            <AuthIcon onClick={() => setAuthModalOpen(true)} />
          </div>

          {/* Mobile Menu Button and Auth Icon */}
          <div className="md:hidden flex items-center gap-3">
            <AuthIcon onClick={() => setAuthModalOpen(true)} />
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
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
          </div>
        )}
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </nav>
  )
}
