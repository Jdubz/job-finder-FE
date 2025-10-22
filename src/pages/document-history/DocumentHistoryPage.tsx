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
import { useAuth } from "@/hooks/useAuth"

interface DocumentHistoryItem {
  id: string
  title: string
  type: "cover-letter" | "resume" | "application"
  createdAt: string
  status: "draft" | "completed" | "archived"
  jobTitle?: string
  company?: string
}

export function DocumentHistoryPage() {
  const { user: _user } = useAuth()
  const [documents, setDocuments] = useState<DocumentHistoryItem[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentHistoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockDocuments: DocumentHistoryItem[] = [
      {
        id: "1",
        title: "Software Engineer Cover Letter",
        type: "cover-letter",
        createdAt: "2024-01-15T10:30:00Z",
        status: "completed",
        jobTitle: "Software Engineer",
        company: "Tech Corp",
      },
      {
        id: "2",
        title: "Senior Developer Resume",
        type: "resume",
        createdAt: "2024-01-14T14:20:00Z",
        status: "draft",
        jobTitle: "Senior Developer",
        company: "Startup Inc",
      },
      {
        id: "3",
        title: "Product Manager Application",
        type: "application",
        createdAt: "2024-01-13T09:15:00Z",
        status: "completed",
        jobTitle: "Product Manager",
        company: "Enterprise Ltd",
      },
    ]

    setDocuments(mockDocuments)
    setFilteredDocuments(mockDocuments)
    setLoading(false)
  }, [])

  // Filter documents based on search and filters
  useEffect(() => {
    let filtered = documents

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((doc) => doc.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((doc) => doc.type === typeFilter)
    }

    setFilteredDocuments(filtered)
  }, [documents, searchTerm, statusFilter, typeFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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

  const handleDownload = (documentId: string) => {
    // Implement download functionality
    console.log("Downloading document:", documentId)
  }

  const handleView = (documentId: string) => {
    // Implement view functionality
    console.log("Viewing document:", documentId)
  }

  const handleDelete = (documentId: string) => {
    // Implement delete functionality
    console.log("Deleting document:", documentId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading document history...</div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cover-letter">Cover Letter</SelectItem>
                  <SelectItem value="resume">Resume</SelectItem>
                  <SelectItem value="application">Application</SelectItem>
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
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
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
                        <h3 className="text-lg font-semibold">{document.title}</h3>
                        {document.jobTitle && document.company && (
                          <p className="text-sm text-muted-foreground">
                            {document.jobTitle} at {document.company}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(document.createdAt)}
                      </div>
                      <Badge className={getStatusColor(document.status)}>{document.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(document.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(document.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(document.id)}
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
              Showing {filteredDocuments.length} of {documents.length} documents
            </span>
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
