import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Download, Eye, Trash2, Calendar, FileText } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useGeneratorDocuments, type DocumentHistoryItem } from "@/hooks/useGeneratorDocuments"

export function DocumentHistoryPage() {
  const { user: _user } = useAuth()
  const { documents: allDocuments, loading, error, deleteDocument } = useGeneratorDocuments()
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentHistoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filter documents based on search and filters
  useEffect(() => {
    let filtered = allDocuments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((doc) => doc.type === typeFilter)
    }

    setFilteredDocuments(filtered)
  }, [allDocuments, searchTerm, typeFilter])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "cover-letter":
        return "📝"
      case "resume":
        return "📄"
      case "application":
        return "📋"
      default:
        return "📄"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDownload = (documentUrl: string) => {
    // Open in new tab for download
    window.open(documentUrl, "_blank")
  }

  const handleView = (documentUrl: string) => {
    // Open in new tab for viewing
    window.open(documentUrl, "_blank")
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      return
    }

    try {
      setDeletingId(documentId)
      await deleteDocument(documentId)
    } catch (err) {
      console.error("Failed to delete document:", err)
      alert(err instanceof Error ? err.message : "Failed to delete document")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading document history...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <h3 className="text-lg font-semibold mb-2">Error loading documents</h3>
              <p>{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document History</h1>
          <p className="text-muted-foreground">View and manage your generated documents</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter your documents by search term, status, or type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cover_letter">Cover Letter</SelectItem>
                  <SelectItem value="resume">Resume</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || typeFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "Start by creating your first document in the Document Builder."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTypeIcon(document.type)}</span>
                      <div>
                        <h3 className="text-lg font-semibold">{document.jobTitle}</h3>
                        <p className="text-sm text-muted-foreground">{document.companyName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(document.createdAt.toISOString())}
                      </div>
                      <Badge variant={document.status === "completed" ? "default" : "secondary"}>
                        {document.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {document.documentUrl && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(document.documentUrl!)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(document.documentUrl!)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(document.id)}
                      disabled={deletingId === document.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredDocuments.length} of {allDocuments.length} documents
            </span>
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
