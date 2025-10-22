import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Loader2,
  FileText,
  Download,
  Trash2,
  Search,
  Calendar,
  Building2,
  Filter,
  RefreshCw,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGeneratorDocuments, type GeneratorDocument } from "@/hooks/useGeneratorDocuments"

type SortField = "createdAt" | "jobTitle" | "companyName" | "type"
type SortOrder = "asc" | "desc"

export function DocumentHistoryPage() {
  const { isEditor } = useAuth()
  
  // Use the new Firestore hook
  const { documents, loading: isLoading, error: firestoreError, deleteDocument } = useGeneratorDocuments()
  
  const [filteredDocuments, setFilteredDocuments] = useState<GeneratorDocument[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "resume" | "cover_letter">("all")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<GeneratorDocument | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Set error from Firestore hook
  useEffect(() => {
    if (firestoreError) {
      setError("Failed to load document history")
      console.error("Error loading documents:", firestoreError)
    }
  }, [firestoreError])

  useEffect(() => {
    applyFiltersAndSort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents, searchTerm, filterType, sortField, sortOrder])

  const applyFiltersAndSort = () => {
    // Filter out documents with missing required fields
    let filtered = documents.filter(
      (doc) => doc && doc.jobTitle && doc.companyName && doc.type && doc.createdAt
    )

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (doc) =>
          doc.jobTitle?.toLowerCase().includes(term) || doc.companyName?.toLowerCase().includes(term)
      )
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((doc) => doc.type === filterType)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "createdAt":
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          break
        case "jobTitle":
          comparison = (a.jobTitle || "").localeCompare(b.jobTitle || "")
          break
        case "companyName":
          comparison = (a.companyName || "").localeCompare(b.companyName || "")
          break
        case "type":
          comparison = (a.type || "").localeCompare(b.type || "")
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredDocuments(filtered)
  }

  const handleDownload = async (document: GeneratorDocument) => {
    try {
      if (!document.documentUrl) {
        setError("Document URL is not available")
        return
      }

      // Open the document URL in a new tab
      window.open(document.documentUrl, "_blank")

      setSuccess(`Downloading ${document.type === "resume" ? "resume" : "cover letter"}...`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError("Failed to download document")
      console.error("Error downloading document:", err)
    }
  }

  const handleDeleteClick = (document: GeneratorDocument) => {
    setDocumentToDelete(document)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return

    setIsDeleting(true)
    setError(null)

    try {
      // Delete using Firestore service
      await deleteDocument(documentToDelete.id)

      setSuccess("Document deleted successfully")
      setTimeout(() => setSuccess(null), 3000)
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
    } catch (err) {
      setError("Failed to delete document")
      console.error("Error deleting document:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 30) return `${diffDays}d ago`
    return formatDate(date)
  }

  const handleRefresh = () => {
    loadDocuments()
  }

  if (!isEditor) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            You do not have permission to access document history. Editor role required.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Document History</h1>
          <p className="text-gray-600 mt-2">View and manage your generated documents</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Document History</h1>
            <p className="text-gray-600 mt-2">
              View and manage your generated resumes and cover letters
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
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

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by job title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select
              value={filterType}
              onValueChange={(value: "all" | "resume" | "cover_letter") => setFilterType(value)}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="resume">Resumes</SelectItem>
                <SelectItem value="cover_letter">Cover Letters</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={`${sortField}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split("-")
                setSortField(field as SortField)
                setSortOrder(order as SortOrder)
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="jobTitle-asc">Job Title (A-Z)</SelectItem>
                <SelectItem value="jobTitle-desc">Job Title (Z-A)</SelectItem>
                <SelectItem value="companyName-asc">Company (A-Z)</SelectItem>
                <SelectItem value="companyName-desc">Company (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredDocuments.length} of {documents.length} document
          {documents.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Document List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your filters or search terms"
                : "Generate your first document to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                      document.type === "resume"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    <FileText className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{document.jobTitle || "Untitled"}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {document.companyName || "Unknown Company"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {document.createdAt ? getRelativeTime(document.createdAt) : "Unknown date"}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={document.type === "resume" ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {document.type === "resume" ? "Resume" : "Cover Letter"}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => handleDownload(document)} size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(document)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {documentToDelete && (
            <div className="py-4">
              <p className="font-semibold">{documentToDelete.jobTitle || "Untitled"}</p>
              <p className="text-sm text-gray-600">{documentToDelete.companyName || "Unknown Company"}</p>
              <Badge variant="secondary" className="mt-2">
                {documentToDelete.type === "resume" ? "Resume" : "Cover Letter"}
              </Badge>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
