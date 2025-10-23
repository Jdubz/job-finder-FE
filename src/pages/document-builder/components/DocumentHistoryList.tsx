import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useGeneratorDocuments } from "@/hooks/useGeneratorDocuments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Trash2, FileText, CalendarDays } from "lucide-react"

interface DocumentHistoryListProps {
  refreshTrigger?: number
}

export function DocumentHistoryList({ refreshTrigger = 0 }: DocumentHistoryListProps) {
  const { user: _user } = useAuth()
  const { documents, loading, error, deleteDocument } = useGeneratorDocuments()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Trigger refetch when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      // The hook will automatically refetch when dependencies change
    }
  }, [refreshTrigger])

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      return
    }

    try {
      setDeletingId(documentId)
      await deleteDocument(documentId)
      // The hook will automatically update the documents list
    } catch (err) {
      console.error("Failed to delete document:", err)
      alert(err instanceof Error ? err.message : "Failed to delete document")
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = (documentUrl: string) => {
    // Open in new tab for download
    window.open(documentUrl, "_blank")
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document History</CardTitle>
          <CardDescription>Your previously generated documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document History</CardTitle>
          <CardDescription>Your previously generated documents</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document History</CardTitle>
          <CardDescription>Your previously generated documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No documents yet</p>
            <p className="text-sm">Generate your first resume or cover letter to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document History</CardTitle>
        <CardDescription>
          {documents.length} document{documents.length === 1 ? "" : "s"} generated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>

            {/* Document Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold truncate">{doc.jobTitle}</h4>
                <Badge
                  variant={
                    doc.type === "resume"
                      ? "default"
                      : doc.type === "cover_letter"
                        ? "secondary"
                        : "outline"
                  }
                  className="shrink-0"
                >
                  {doc.type === "resume"
                    ? "Resume"
                    : doc.type === "cover_letter"
                      ? "Cover Letter"
                      : "Both"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate mb-1">{doc.companyName}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="w-3 h-3" />
                {doc.createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {doc.documentUrl && (
                <Button variant="outline" size="sm" onClick={() => handleDownload(doc.documentUrl)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(doc.id)}
                disabled={deletingId === doc.id}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
