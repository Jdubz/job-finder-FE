import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, RotateCcw, Eye } from "lucide-react"
import { promptsClient, type PromptConfig, DEFAULT_PROMPTS } from "@/api"

export function AIPromptsPage() {
  const { isEditor, user } = useAuth()
  const [prompts, setPrompts] = useState<PromptConfig>(DEFAULT_PROMPTS)
  const [originalPrompts, setOriginalPrompts] = useState<PromptConfig>(DEFAULT_PROMPTS)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<keyof PromptConfig>("resumeGeneration")
  const [showPreview, setShowPreview] = useState(false)

  // Load prompts from Firestore on mount
  useEffect(() => {
    loadPrompts()
  }, [])

  const loadPrompts = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const loadedPrompts = await promptsClient.getPrompts()
      setPrompts(loadedPrompts)
      setOriginalPrompts(loadedPrompts)
    } catch (err) {
      setError("Failed to load AI prompts")
      console.error("Error loading prompts:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user?.email) {
      setError("User email not found")
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await promptsClient.savePrompts(prompts, user.email)

      setOriginalPrompts(prompts)
      setSuccess("AI prompts saved successfully!")

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError("Failed to save AI prompts")
      console.error("Error saving prompts:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setPrompts(originalPrompts)
    setSuccess(null)
    setError(null)
  }

  const handleResetToDefaults = () => {
    setPrompts(DEFAULT_PROMPTS)
    setSuccess(null)
    setError(null)
  }

  const handlePromptChange = (key: keyof PromptConfig, value: string) => {
    setPrompts((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const extractVariables = (prompt: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g
    const variables: string[] = []
    let match

    while ((match = regex.exec(prompt)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }

    return variables
  }

  const renderVariablePreview = (prompt: string) => {
    const variables = extractVariables(prompt)

    if (variables.length === 0) {
      return <p className="text-sm text-gray-500">No variables detected in this prompt.</p>
    }

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Detected Variables:</h4>
        <div className="flex flex-wrap gap-2">
          {variables.map((variable) => (
            <span
              key={variable}
              className="px-2 py-1 text-xs font-mono bg-blue-100 text-blue-800 rounded"
            >
              {`{{${variable}}}`}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const hasChanges = JSON.stringify(prompts) !== JSON.stringify(originalPrompts)

  if (!isEditor) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            You do not have permission to access AI prompt configuration. Editor role required.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading AI prompts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Prompts Configuration</h1>
        <p className="text-gray-600 mt-2">
          Customize the AI prompts used for resume generation, cover letters, job scraping, and
          matching.
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prompt Templates</CardTitle>
              <CardDescription>
                Edit AI prompts with variable interpolation support using{" "}
                <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">{`{{variableName}}`}</code>{" "}
                syntax
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Hide" : "Show"} Variables
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToDefaults}
                disabled={isSaving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Discard Changes
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Prompts
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as keyof PromptConfig)}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resumeGeneration">Resume</TabsTrigger>
              <TabsTrigger value="coverLetterGeneration">Cover Letter</TabsTrigger>
              <TabsTrigger value="jobScraping">Job Scraping</TabsTrigger>
              <TabsTrigger value="jobMatching">Job Matching</TabsTrigger>
            </TabsList>

            <TabsContent value="resumeGeneration" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="resumePrompt">Resume Generation Prompt</Label>
                <Textarea
                  id="resumePrompt"
                  value={prompts.resumeGeneration}
                  onChange={(e) => handlePromptChange("resumeGeneration", e.target.value)}
                  rows={15}
                  className="mt-2 font-mono text-sm"
                  placeholder="Enter the AI prompt for resume generation..."
                />
              </div>
              {showPreview && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  {renderVariablePreview(prompts.resumeGeneration)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="coverLetterGeneration" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="coverLetterPrompt">Cover Letter Generation Prompt</Label>
                <Textarea
                  id="coverLetterPrompt"
                  value={prompts.coverLetterGeneration}
                  onChange={(e) => handlePromptChange("coverLetterGeneration", e.target.value)}
                  rows={15}
                  className="mt-2 font-mono text-sm"
                  placeholder="Enter the AI prompt for cover letter generation..."
                />
              </div>
              {showPreview && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  {renderVariablePreview(prompts.coverLetterGeneration)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="jobScraping" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="jobScrapingPrompt">Job Scraping Prompt</Label>
                <Textarea
                  id="jobScrapingPrompt"
                  value={prompts.jobScraping}
                  onChange={(e) => handlePromptChange("jobScraping", e.target.value)}
                  rows={15}
                  className="mt-2 font-mono text-sm"
                  placeholder="Enter the AI prompt for job scraping..."
                />
              </div>
              {showPreview && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  {renderVariablePreview(prompts.jobScraping)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="jobMatching" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="jobMatchingPrompt">Job Matching Prompt</Label>
                <Textarea
                  id="jobMatchingPrompt"
                  value={prompts.jobMatching}
                  onChange={(e) => handlePromptChange("jobMatching", e.target.value)}
                  rows={15}
                  className="mt-2 font-mono text-sm"
                  placeholder="Enter the AI prompt for job matching analysis..."
                />
              </div>
              {showPreview && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  {renderVariablePreview(prompts.jobMatching)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
