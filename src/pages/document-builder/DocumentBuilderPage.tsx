import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { jobMatchesClient } from "@/api/job-matches-client"
import { generatorClient, type GenerateDocumentRequest } from "@/api/generator-client"
import type { JobMatch } from "@jsdubzw/job-finder-shared-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, Sparkles } from "lucide-react"
import { DocumentHistoryList } from "./components/DocumentHistoryList"

export function DocumentBuilderPage() {
  const { user } = useAuth()
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([])
  const [selectedJobMatchId, setSelectedJobMatchId] = useState<string>("")
  const [documentType, setDocumentType] = useState<"resume" | "cover_letter">("resume")
  const [customJobTitle, setCustomJobTitle] = useState("")
  const [customCompanyName, setCustomCompanyName] = useState("")
  const [customJobDescription, setCustomJobDescription] = useState("")
  const [targetSummary, setTargetSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingMatches, setLoadingMatches] = useState(true)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [refreshHistory, setRefreshHistory] = useState(0)

  // Load job matches
  useEffect(() => {
    if (!user?.uid) return

    const loadMatches = async () => {
      try {
        setLoadingMatches(true)
        const matches = await jobMatchesClient.getMatches(user.uid, {
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
  }, [user?.uid])

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
      setCustomJobTitle(match.jobTitle || "")
      setCustomCompanyName(match.companyName || "")
      setCustomJobDescription(match.jobDescription || "")
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

    try {
      const request: GenerateDocumentRequest = {
        type: documentType,
        jobMatchId: selectedJobMatchId || undefined,
        jobTitle: customJobTitle,
        companyName: customCompanyName,
        jobDescription: customJobDescription || undefined,
        customization: targetSummary
          ? {
              targetSummary,
            }
          : undefined,
      }

      const response = await generatorClient.generateDocument(request)

      if (response.success) {
        setAlert({
          type: "success",
          message: `${documentType === "resume" ? "Resume" : "Cover letter"} generated successfully!`,
        })
        // Refresh history
        setRefreshHistory((prev) => prev + 1)
        // Reset form
        setSelectedJobMatchId("")
        setCustomJobTitle("")
        setCustomCompanyName("")
        setCustomJobDescription("")
        setTargetSummary("")
      } else {
        setAlert({
          type: "error",
          message: response.error || "Failed to generate document",
        })
      }
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

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate New
          </TabsTrigger>
          <TabsTrigger value="history">
            <FileText className="w-4 h-4 mr-2" />
            Document History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Document</CardTitle>
              <CardDescription>
                Create a customized resume or cover letter using AI
              </CardDescription>
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
                  onValueChange={(value: "resume" | "cover_letter") => setDocumentType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resume">Resume</SelectItem>
                    <SelectItem value="cover_letter">Cover Letter</SelectItem>
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
                        No job matches found. Add jobs in Job Finder first.
                      </div>
                    ) : (
                      jobMatches.map((match) => (
                        <SelectItem key={match.id} value={match.id || ""}>
                          <div className="flex items-center gap-2">
                            <span>{match.jobTitle}</span>
                            <span className="text-muted-foreground">at {match.companyName}</span>
                            <Badge variant="secondary" className="ml-auto">
                              {match.matchScore}%
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedMatch && (
                  <p className="text-sm text-muted-foreground">
                    Match Score: {selectedMatch.matchScore}% • Analyzed{" "}
                    {new Date(selectedMatch.analyzedAt).toLocaleDateString()}
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
                      Generate {documentType === "resume" ? "Resume" : "Cover Letter"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <DocumentHistoryList refreshTrigger={refreshHistory} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
