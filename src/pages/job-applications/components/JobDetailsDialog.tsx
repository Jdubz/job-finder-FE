import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, FileText } from "lucide-react"
import type { JobMatch } from "@jsdubzw/job-finder-shared-types"

interface JobDetailsDialogProps {
  match: JobMatch | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerateResume?: (match: JobMatch) => void
}

export function JobDetailsDialog({
  match,
  open,
  onOpenChange,
  onGenerateResume,
}: JobDetailsDialogProps) {
  if (!match) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{match.jobTitle}</DialogTitle>
          <DialogDescription className="text-lg">
            {match.companyName}
            {match.location && ` • ${match.location}`}
            {match.salaryRange && ` • ${match.salaryRange}`}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="customization">Customization</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              {/* Match Score */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Match Analysis</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{match.matchScore}%</div>
                    <div className="text-xs text-muted-foreground">Overall Match</div>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{match.experienceMatch}%</div>
                    <div className="text-xs text-muted-foreground">Experience Match</div>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-lg">
                    <Badge className="text-base">{match.applicationPriority}</Badge>
                    <div className="text-xs text-muted-foreground mt-1">Priority</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Match Reasons */}
              {match.matchReasons && match.matchReasons.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Why This Is a Good Match</h3>
                  <ul className="space-y-2">
                    {match.matchReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-sm">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator className="my-4" />

              {/* Key Strengths */}
              {match.keyStrengths && match.keyStrengths.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Your Key Strengths</h3>
                  <div className="flex flex-wrap gap-2">
                    {match.keyStrengths.map((strength, idx) => (
                      <Badge key={idx} variant="secondary">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Potential Concerns */}
              {match.potentialConcerns && match.potentialConcerns.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-orange-600">Potential Concerns</h3>
                  <ul className="space-y-2">
                    {match.potentialConcerns.map((concern, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">⚠</span>
                        <span className="text-sm">{concern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              {/* Matched Skills */}
              <div>
                <h3 className="font-semibold mb-2 text-green-600">
                  Matched Skills ({match.matchedSkills?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {match.matchedSkills && match.matchedSkills.length > 0 ? (
                    match.matchedSkills.map((skill, idx) => (
                      <Badge key={idx} className="bg-green-500">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No matched skills data available
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Missing Skills */}
              <div>
                <h3 className="font-semibold mb-2 text-orange-600">
                  Skills to Highlight ({match.missingSkills?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {match.missingSkills && match.missingSkills.length > 0 ? (
                    match.missingSkills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="border-orange-500">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">You have all required skills!</p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Customization Tab */}
          <TabsContent value="customization" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              {match.customizationRecommendations &&
              match.customizationRecommendations.length > 0 ? (
                <div>
                  <h3 className="font-semibold mb-3">How to Customize Your Application</h3>
                  <ul className="space-y-3">
                    {match.customizationRecommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1 font-bold">{idx + 1}.</span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No customization recommendations available
                </p>
              )}

              {/* Resume Intake Data Preview */}
              {match.resumeIntakeData && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="font-semibold mb-2">Resume Customization Data</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      AI-generated guidance for tailoring your resume
                    </p>
                    <div className="bg-secondary p-3 rounded-md">
                      <p className="text-sm">
                        ✓ Target summary generated
                        <br />✓ Skills prioritized (
                        {match.resumeIntakeData.skillsPriority?.length || 0})
                        <br />✓ ATS keywords identified (
                        {match.resumeIntakeData.atsKeywords?.length || 0})
                        <br />✓ Experience highlights prepared
                      </p>
                    </div>
                  </div>
                </>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Description Tab */}
          <TabsContent value="description" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {match.companyInfo && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">About {match.companyName}</h3>
                    <p className="text-sm whitespace-pre-wrap">{match.companyInfo}</p>
                  </div>
                )}

                <Separator className="my-4" />

                <div>
                  <h3 className="font-semibold mb-2">Job Description</h3>
                  <div className="text-sm whitespace-pre-wrap">{match.jobDescription}</div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex gap-2 mt-4">
          {onGenerateResume && (
            <Button onClick={() => onGenerateResume(match)} className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              Generate Custom Resume
            </Button>
          )}
          <Button variant="outline" onClick={() => window.open(match.url, "_blank")}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Job Posting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
