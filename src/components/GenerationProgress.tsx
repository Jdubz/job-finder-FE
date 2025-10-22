import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react"

export interface GenerationStep {
  id: string
  name: string
  description: string
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped"
  startedAt?: Date
  completedAt?: Date
  duration?: number // milliseconds
  result?: {
    resumeUrl?: string
    coverLetterUrl?: string
    [key: string]: unknown
  }
  error?: {
    message: string
    code?: string
  }
}

interface GenerationProgressProps {
  steps: GenerationStep[]
}

/**
 * Get meaningful completion message for each step
 */
const getCompletionMessage = (step: GenerationStep): string => {
  const duration = step.duration ? ` (${(step.duration / 1000).toFixed(1)}s)` : ""

  switch (step.id) {
    case "fetch_data":
      return `Successfully loaded your experience data${duration}`
    case "generate_resume":
      return `AI generated tailored resume content${duration}`
    case "generate_cover_letter":
      return `AI generated personalized cover letter${duration}`
    case "create_resume_pdf":
      return `Resume PDF created and ready${duration}`
    case "create_cover_letter_pdf":
      return `Cover letter PDF created and ready${duration}`
    case "upload_documents":
      return `Documents uploaded to cloud storage${duration}`
    default:
      return `Completed${duration}`
  }
}

/**
 * GenerationProgress - Checklist UI for document generation progress
 *
 * Shows each step as:
 * - [ ] Empty checkbox (pending)
 * - ⏳ Spinner (in_progress)
 * - ✓ Green checkmark (completed)
 * - ✗ Red X (failed)
 *
 * Enables early download: PDFs can be downloaded as soon as their step completes,
 * even if other steps are still in progress.
 */
export function GenerationProgress({ steps }: GenerationProgressProps) {
  const getStepIcon = (status: GenerationStep["status"]) => {
    switch (status) {
      case "pending":
        return <Circle className="w-5 h-5 text-muted-foreground" />
      case "in_progress":
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600 fill-green-100" />
      case "failed":
        return <XCircle className="w-5 h-5 text-destructive fill-red-100" />
      case "skipped":
        return <Circle className="w-5 h-5 text-muted-foreground opacity-50" />
      default:
        return null
    }
  }

  const getStepTextColor = (status: GenerationStep["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-700"
      case "failed":
        return "text-destructive"
      case "in_progress":
        return "text-primary font-semibold"
      case "pending":
      case "skipped":
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-3">
              {/* Icon */}
              <div className="pt-0.5">{getStepIcon(step.status)}</div>

              {/* Step Info - Show only one message at a time */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${getStepTextColor(step.status)}`}>
                  {/* Before: step name | During: action description | After: completion message */}
                  {step.status === "pending" && step.name}
                  {step.status === "in_progress" && step.description}
                  {step.status === "completed" && getCompletionMessage(step)}
                  {step.status === "failed" && `Error: ${step.error?.message ?? "Failed"}`}
                  {step.status === "skipped" && `${step.name} (skipped)`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
