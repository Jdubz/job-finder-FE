import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, User, Shield, Bell } from "lucide-react"
import { generatorClient, type UserDefaults } from "@/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SettingsPage() {
  const { user, isEditor } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // User defaults state
  const [userDefaults, setUserDefaults] = useState<UserDefaults>({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
  })
  const [originalDefaults, setOriginalDefaults] = useState<UserDefaults>({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
  })

  // Theme preference (stored in localStorage)
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const defaults = await generatorClient.getUserDefaults()
      setUserDefaults(defaults)
      setOriginalDefaults(defaults)
    } catch (err) {
      console.error("Error loading settings:", err)
      // It's OK if defaults don't exist yet
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDefaults = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await generatorClient.updateUserDefaults(userDefaults)
      setOriginalDefaults(userDefaults)
      setSuccess("Settings saved successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError("Failed to save settings")
      console.error("Error saving settings:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetDefaults = () => {
    setUserDefaults(originalDefaults)
    setError(null)
    setSuccess(null)
  }

  const applyTheme = (newTheme: "light" | "dark" | "system") => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(newTheme)
    }
  }

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    applyTheme(newTheme)
    setSuccess("Theme preference saved!")
    setTimeout(() => setSuccess(null), 3000)
  }

  const hasChanges = JSON.stringify(userDefaults) !== JSON.stringify(originalDefaults)

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account preferences and default information
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Account Information */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Account Information</CardTitle>
          </div>
          <CardDescription>Your account details and authentication status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600">Email</Label>
              <p className="font-medium">{user?.email || "Not available"}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Email Verified</Label>
              <div>
                {user?.emailVerified ? (
                  <Badge variant="default" className="bg-green-500">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not Verified</Badge>
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-600">User ID</Label>
              <p className="font-mono text-xs text-gray-600">{user?.uid || "Not available"}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Role</Label>
              <div>
                {isEditor ? (
                  <Badge variant="default" className="bg-blue-500">
                    <Shield className="h-3 w-3 mr-1" />
                    Editor
                  </Badge>
                ) : (
                  <Badge variant="secondary">User</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the application looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={theme}
              onValueChange={(value: "light" | "dark" | "system") => handleThemeChange(value)}
            >
              <SelectTrigger id="theme" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Choose your preferred color theme or use system preference
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Default Information */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Default Document Information</CardTitle>
              <CardDescription>
                Information used to pre-fill resume and cover letter generation
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetDefaults}
                disabled={!hasChanges || isSaving}
              >
                Reset
              </Button>
              <Button onClick={handleSaveDefaults} size="sm" disabled={!hasChanges || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={userDefaults.name}
                onChange={(e) => setUserDefaults((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userDefaults.email}
                onChange={(e) => setUserDefaults((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={userDefaults.phone || ""}
                onChange={(e) => setUserDefaults((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="(123) 456-7890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={userDefaults.location || ""}
                onChange={(e) => setUserDefaults((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="San Francisco, CA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={userDefaults.linkedin || ""}
                onChange={(e) => setUserDefaults((prev) => ({ ...prev, linkedin: e.target.value }))}
                placeholder="linkedin.com/in/johndoe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                value={userDefaults.github || ""}
                onChange={(e) => setUserDefaults((prev) => ({ ...prev, github: e.target.value }))}
                placeholder="github.com/johndoe"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="portfolio">Portfolio Website</Label>
              <Input
                id="portfolio"
                value={userDefaults.portfolio || ""}
                onChange={(e) =>
                  setUserDefaults((prev) => ({ ...prev, portfolio: e.target.value }))
                }
                placeholder="https://johndoe.com"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="summary">Professional Summary</Label>
              <Input
                id="summary"
                value={userDefaults.summary || ""}
                onChange={(e) => setUserDefaults((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="Experienced software engineer specializing in..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications (Placeholder for future) */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Manage your notification preferences (Coming soon)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Email and in-app notification settings will be available in a future update.
          </p>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions that affect your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Delete Account</h4>
                <p className="text-sm text-gray-600">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive" disabled>
                Delete Account
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Account deletion is not yet available. Please contact support if you need to delete
              your account.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
