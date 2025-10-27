// @ts-nocheck
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { jobMatchesClient } from "@/api/job-matches-client"
import {
  generatorClient,
  type GenerateDocumentRequest,
  type GenerationStep,
} from "@/api/generator-client"
import type { JobMatch } from "@jsdubzw/job-finder-shared-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Download } from "lucide-react"
import { GenerationProgress } from "@/components/GenerationProgress"

// Helper function to normalize job match data from different sources
function normalizeJobMatch(match: Record<string, unknown>): {
  id: string
  jobTitle: string
  companyName: string
  location: string
  jobDescription: string
  matchScore: number
  analyzedAt: Date | string
} {
  return {
    id: match.id || "",
    jobTitle: match.jobTitle || match.job_title || match.title || "Unknown Title",
    companyName: match.companyName || match.company_name || match.company || "Unknown Company",
    location: match.location || "Remote",
    jobDescription: match.jobDescription || match.job_description || match.description || "",
    matchScore: match.matchScore || match.match_score || 0,
    analyzedAt: match.analyzedAt || match.analyzed_at || new Date(),
  }
}

export function DocumentBuilderPage() {
  const { user } = useAuth()
  const location = useLocation()
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([])
  const [selectedJobMatchId, setSelectedJobMatchId] = useState<string>("")
  const [documentType, setDocumentType] = useState<"resume" | "cover_letter" | "both">("resume")
  const [customJobTitle, setCustomJobTitle] = useState("")
  const [customCompanyName, setCustomCompanyName] = useState("")
  const [customJobDescription, setCustomJobDescription] = useState("")
  const [targetSummary, setTargetSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingMatches, setLoadingMatches] = useState(true)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Multi-step generation state
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([])
  const [_generationRequestId, setGenerationRequestId] = useState<string | null>(null)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [coverLetterUrl, setCoverLetterUrl] = useState<string | null>(null)

  // Set page title
  useEffect(() => {
    document.title = "Document Builder - Job Finder"
  }, [])

  // Load job matches
  useEffect(() => {
    if (!user) return

    const loadMatches = async () => {
      try {
        setLoadingMatches(true)
        const matches = await jobMatchesClient.getMatches({
          minScore: 70, // Only show good matches
          limit: 50,
        })
        setJobMatches(matches)
      } catch (error) {
        console.error("Failed to load job matches:", error)
      } finally {
        setLoadingMatches(false)
      }
    }

    loadMatches()
  }, [user])

  // Pre-fill form if job match is passed via navigation state
  useEffect(() => {
    const state = location.state as {
      jobMatch?: JobMatch
      documentType?: "resume" | "cover_letter" | "both"
    } | null
    if (state?.jobMatch) {
      const match = state.jobMatch
      const normalized = normalizeJobMatch(match)
      setSelectedJobMatchId(normalized.id)
      setCustomJobTitle(normalized.jobTitle)
      setCustomCompanyName(normalized.companyName)
      setCustomJobDescription(normalized.jobDescription)
      if (state.documentType) {
        setDocumentType(state.documentType)
      }
    }
  }, [location.state])

  // Auto-populate fields when job match is selected
  useEffect(() => {
    if (!selectedJobMatchId) {
      setCustomJobTitle("")
      setCustomCompanyName("")
      setCustomJobDescription("")
      return
    }

    const match = jobMatches.find((m) => m.id === selectedJobMatchId)
    if (match) {
      const normalized = normalizeJobMatch(match)
      setCustomJobTitle(normalized.jobTitle)
      setCustomCompanyName(normalized.companyName)
      setCustomJobDescription(normalized.jobDescription)
    }
  }, [selectedJobMatchId, jobMatches])

  const handleGenerate = async () => {
    if (!user) {
      setAlert({ type: "error", message: "You must be logged in to generate documents" })
      return
    }

    // Validation
    if (!customJobTitle || !customCompanyName) {
      setAlert({ type: "error", message: "Job title and company name are required" })
      return
    }

    setLoading(true)
    setAlert(null)
    setGenerationSteps([])
    setResumeUrl(null)
    setCoverLetterUrl(null)
    setGenerationRequestId(null)

    try {
      // Map UI document type to backend generateType
      const generateType = documentType === "cover_letter" ? "coverLetter" : documentType

      const request: GenerateDocumentRequest = {
        generateType,
        job: {
          role: customJobTitle,
          company: customCompanyName,
          jobDescriptionText: customJobDescription || undefined,
        },
        jobMatchId: selectedJobMatchId || undefined,
        date: new Date().toLocaleDateString(), // Client's local date for cover letter
        preferences: targetSummary
          ? {
              emphasize: [targetSummary], // Use targetSummary as emphasis preference
            }
          : undefined,
      }

      // Step 1: Start generation
      const startResponse = await generatorClient.startGeneration(request)

      if (!startResponse.success) {
        setAlert({
          type: "error",
          message: "Failed to start generation",
        })
        return
      }

      setGenerationRequestId(startResponse.data.requestId)

      // Step 2: Execute steps sequentially until complete
      let nextStep = startResponse.data.nextStep
      let isComplete = false

      while (nextStep && !isComplete) {
        try {
          const stepResponse = await generatorClient.executeStep(startResponse.data.requestId)

          // Update steps if provided
          if (stepResponse.data.steps) {
            setGenerationSteps(stepResponse.data.steps)
          }

          // Update URLs as they become available
          if (stepResponse.data.resumeUrl) {
            setResumeUrl(stepResponse.data.resumeUrl)
          }
          if (stepResponse.data.coverLetterUrl) {
            setCoverLetterUrl(stepResponse.data.coverLetterUrl)
          }

          // Check if generation failed
          if (!stepResponse.success) {
            setAlert({
              type: "error",
              message: `Generation failed during step execution: ${stepResponse.error || stepResponse.message || "Unknown error"}`,
            })
            return
          }

          // Check for next step or completion
          nextStep = stepResponse.data.nextStep
          isComplete = stepResponse.data.status === "completed" || !nextStep
        } catch (error) {
          console.error("Step execution error:", error)
          setAlert({
            type: "error",
            message: `Step execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          })
          return
        }
      }

      // Step 3: Mark complete only if pipeline completed successfully
      if (isComplete) {
        const documentTypeLabel =
          documentType === "resume"
            ? "Resume"
            : documentType === "cover_letter"
              ? "Cover letter"
              : "Resume and cover letter"
        setAlert({
          type: "success",
          message: `${documentTypeLabel} generated successfully!`,
        })
      }

      // Refresh history
      setRefreshHistory((prev) => prev + 1)

      // Reset form
      setSelectedJobMatchId("")
      setCustomJobTitle("")
      setCustomCompanyName("")
      setCustomJobDescription("")
      setTargetSummary("")
    } catch (error) {
      console.error("Generation error:", error)
      setAlert({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to generate document",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedMatch = jobMatches.find((m) => m.id === selectedJobMatchId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Builder</h1>
        <p className="text-muted-foreground mt-2">
          Generate custom resumes and cover letters with AI
        </p>
      </div>

      <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Document</CardTitle>
              <CardDescription>Create a customized resume or cover letter using AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {alert && (
                <Alert variant={alert.type === "error" ? "destructive" : "default"}>
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              )}

              {/* Document Type Selection */}
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select
                  value={documentType}
                  onValueChange={(value: "resume" | "cover_letter" | "both") =>
                    setDocumentType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resume">Resume</SelectItem>
                    <SelectItem value="cover_letter">Cover Letter</SelectItem>
                    <SelectItem value="both">Both Resume & Cover Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Job Selection */}
              <div className="space-y-2">
                <Label>Select Job Match (Optional)</Label>
                <Select value={selectedJobMatchId} onValueChange={setSelectedJobMatchId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job match or enter manually" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingMatches ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Loading matches...
                      </div>
                    ) : jobMatches.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        <div className="space-y-2">
                          <p>No job matches found.</p>
                          <p className="text-xs">
                            You can still generate documents by entering job details manually below.
                          </p>
                        </div>
                      </div>
                    ) : (
                      jobMatches.map((match) => {
                        const normalized = normalizeJobMatch(match)
                        return (
                          <SelectItem key={match.id} value={match.id || ""}>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{normalized.jobTitle}</span>
                                <span className="text-sm text-muted-foreground">
                                  {normalized.companyName} • {normalized.location}
                                </span>
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                {normalized.matchScore}%
                              </Badge>
                            </div>
                          </SelectItem>
                        )
                      })
                    )}
                  </SelectContent>
                </Select>
                {selectedMatch && (
                  <p className="text-sm text-muted-foreground">
                    Match Score: {normalizeJobMatch(selectedMatch).matchScore}% • Analyzed{" "}
                    {normalizeJobMatch(selectedMatch).analyzedAt
                      ? new Date(normalizeJobMatch(selectedMatch).analyzedAt).toLocaleDateString()
                      : "Recently"}
                  </p>
                )}
                {jobMatches.length === 0 && !loadingMatches && (
                  <p className="text-sm text-muted-foreground">
                    💡 Tip: Use the Job Finder to analyze job postings and get AI-powered match
                    scores.
                  </p>
                )}
              </div>

              {/* Job Details */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Job Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="job-title">
                    Job Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="job-title"
                    value={customJobTitle}
                    onChange={(e) => setCustomJobTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-name">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="company-name"
                    value={customCompanyName}
                    onChange={(e) => setCustomCompanyName(e.target.value)}
                    placeholder="e.g., Acme Corp"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-description">Job Description (Optional)</Label>
                  <Textarea
                    id="job-description"
                    value={customJobDescription}
                    onChange={(e) => setCustomJobDescription(e.target.value)}
                    placeholder="Paste the job description here for better customization..."
                    rows={6}
                  />
                </div>
              </div>

              {/* Customization */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Customization (Optional)</h3>

                <div className="space-y-2">
                  <Label htmlFor="target-summary">Professional Summary Override</Label>
                  <Textarea
                    id="target-summary"
                    value={targetSummary}
                    onChange={(e) => setTargetSummary(e.target.value)}
                    placeholder="Customize your professional summary for this role..."
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave blank to use AI-generated summary based on job description
                  </p>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedJobMatchId("")
                    setCustomJobTitle("")
                    setCustomCompanyName("")
                    setCustomJobDescription("")
                    setTargetSummary("")
                    setAlert(null)
                  }}
                >
                  Clear Form
                </Button>
                <Button onClick={handleGenerate} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate{" "}
                      {documentType === "resume"
                        ? "Resume"
                        : documentType === "cover_letter"
                          ? "Cover Letter"
                          : "Both Documents"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Generation Progress - Positioned at bottom of page */}
      {generationSteps.length > 0 && (
        <div className="mt-8 space-y-4">
          <GenerationProgress steps={generationSteps} />

          {/* Download Buttons */}
          {(resumeUrl || coverLetterUrl) && (
            <div className="flex gap-3 justify-center">
              {resumeUrl && (
                <Button asChild variant="outline" size="sm">
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    Download Resume
                  </a>
                </Button>
              )}
              {coverLetterUrl && (
                <Button asChild variant="outline" size="sm">
                  <a href={coverLetterUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    Download Cover Letter
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
