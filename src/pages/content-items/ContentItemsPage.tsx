import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { contentItemsService } from "@/services/firestore"
import type { ContentItemWithChildren } from "@/services/firestore"
import type {
  ContentItem,
  ContentItemType,
  CreateContentItemData,
  UpdateContentItemData,
} from "@jsdubzw/job-finder-shared-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Plus,
  Building2,
  FolderOpen,
  GraduationCap,
  User,
  FileText,
  Award,
  Download,
  Upload,
  AlertCircle,
} from "lucide-react"
import { CompanyList } from "./components/CompanyList"
import { ContentItemDialog } from "./components/ContentItemDialog"

interface ContentStats {
  companies: number
  projects: number
  skillGroups: number
  education: number
  profileSections: number
  textSections: number
  total: number
}

export function ContentItemsPage() {
  const { user, isEditor } = useAuth()
  const [hierarchy, setHierarchy] = useState<ContentItemWithChildren[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ContentStats>({
    companies: 0,
    projects: 0,
    skillGroups: 0,
    education: 0,
    profileSections: 0,
    textSections: 0,
    total: 0,
  })
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<ContentItemType>("company")
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [selectedTab, setSelectedTab] = useState("companies")

  // Load content items hierarchy
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    loadContentItems()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadContentItems = async () => {
    try {
      setLoading(true)
      const data = await contentItemsService.getHierarchy({
        visibility: ["published", "draft"],
      })
      setHierarchy(data)

      // Calculate stats
      const newStats = calculateStats(data)
      setStats(newStats)
    } catch (error) {
      console.error("Failed to load content items:", error)
      setAlert({
        type: "error",
        message: "Failed to load content items. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (items: ContentItemWithChildren[]): ContentStats => {
    const stats = {
      companies: 0,
      projects: 0,
      skillGroups: 0,
      education: 0,
      profileSections: 0,
      textSections: 0,
      total: 0,
    }

    const countItems = (items: ContentItemWithChildren[]) => {
      for (const item of items) {
        stats.total++
        switch (item.type) {
          case "company":
            stats.companies++
            break
          case "project":
            stats.projects++
            break
          case "skill-group":
            stats.skillGroups++
            break
          case "education":
            stats.education++
            break
          case "profile-section":
            stats.profileSections++
            break
          case "text-section":
            stats.textSections++
            break
        }

        if (item.children) {
          countItems(item.children)
        }
      }
    }

    countItems(items)
    return stats
  }

  const handleCreateItem = (type: ContentItemType) => {
    setDialogType(type)
    setEditingItem(null)
    setDialogOpen(true)
  }

  const handleEditItem = (item: ContentItem | ContentItemWithChildren) => {
    setDialogType(item.type)
    setEditingItem(item)
    setDialogOpen(true)
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await contentItemsService.deleteItem(id, true) // Delete children too
      setAlert({
        type: "success",
        message: "Content item deleted successfully",
      })
      await loadContentItems()
    } catch (error) {
      console.error("Failed to delete content item:", error)
      setAlert({
        type: "error",
        message: "Failed to delete content item. Please try again.",
      })
    }
  }

  const handleExportItems = async () => {
    try {
      const items = await contentItemsService.getItems()
      const dataStr = JSON.stringify(items, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = "content-items-export.json"
      link.click()
      URL.revokeObjectURL(url)

      setAlert({
        type: "success",
        message: `Exported ${items.length} content items`,
      })
    } catch (error) {
      console.error("Failed to export content items:", error)
      setAlert({
        type: "error",
        message: "Failed to export content items. Please try again.",
      })
    }
  }

  const handleImportItems = async () => {
    try {
      // Create file input element
      const input = document.createElement("input")
      input.type = "file"
      input.accept = ".json"

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        try {
          const text = await file.text()
          const items = JSON.parse(text) as CreateContentItemData[]

          if (!Array.isArray(items)) {
            throw new Error("Invalid file format: expected array of content items")
          }

          // Import each item individually
          const imported = []
          for (const itemData of items) {
            try {
              const item = await contentItemsService.createItem(itemData)
              imported.push(item)
            } catch (error) {
              console.error("Failed to import item:", itemData, error)
            }
          }

          setAlert({
            type: "success",
            message: `Imported ${imported.length} of ${items.length} content items successfully`,
          })
          await loadContentItems()
        } catch (error) {
          console.error("Failed to import content items:", error)
          setAlert({
            type: "error",
            message: error instanceof Error ? error.message : "Failed to import content items",
          })
        }
      }

      input.click()
    } catch (error) {
      console.error("Failed to create import dialog:", error)
      setAlert({
        type: "error",
        message: "Failed to open import dialog. Please try again.",
      })
    }
  }

  const handleDialogSave = async () => {
    setDialogOpen(false)
    await loadContentItems()
    setAlert({
      type: "success",
      message: editingItem
        ? "Content item updated successfully"
        : "Content item created successfully",
    })
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Items</h1>
          <p className="text-muted-foreground mt-2">Please sign in to manage your content items</p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to be signed in to access content management features.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isEditor) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Items</h1>
          <p className="text-muted-foreground mt-2">
            Manage your experience entries and reusable content
          </p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You need editor permissions to manage content items.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Items</h1>
          <p className="text-muted-foreground mt-2">
            Manage your experience entries and reusable content
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportItems}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportItems}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {alert && (
        <Alert variant={alert.type === "error" ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : stats.companies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <FolderOpen className="h-3 w-3" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : stats.projects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Award className="h-3 w-3" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : stats.skillGroups}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : stats.education}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <User className="h-3 w-3" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : stats.profileSections}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : stats.textSections}</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-6">
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Companies</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Education</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Sections</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="companies" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Work Experience</h2>
            <Button onClick={() => handleCreateItem("company")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <CompanyList
              items={hierarchy.filter((item) => item.type === "company")}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Projects</h2>
            <Button onClick={() => handleCreateItem("project")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-6 text-center text-muted-foreground">
              {hierarchy.flatMap(
                (item) => item.children?.filter((child) => child.type === "project") || []
              ).length === 0 ? (
                <p>No projects found. Click "Add Project" to get started.</p>
              ) : (
                <p>
                  Project list component coming soon... (
                  {
                    hierarchy.flatMap(
                      (item) => item.children?.filter((child) => child.type === "project") || []
                    ).length
                  }{" "}
                  items)
                </p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Skills & Technologies</h2>
            <Button onClick={() => handleCreateItem("skill-group")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Skill Group
            </Button>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-6 text-center text-muted-foreground">
              {hierarchy.filter((item) => item.type === "skill-group").length === 0 ? (
                <p>No skill groups found. Click "Add Skill Group" to get started.</p>
              ) : (
                <p>
                  Skill group list component coming soon... (
                  {hierarchy.filter((item) => item.type === "skill-group").length} items)
                </p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Education & Certifications</h2>
            <Button onClick={() => handleCreateItem("education")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-6 text-center text-muted-foreground">
              {hierarchy.filter((item) => item.type === "education").length === 0 ? (
                <p>No education items found. Click "Add Education" to get started.</p>
              ) : (
                <p>
                  Education list component coming soon... (
                  {hierarchy.filter((item) => item.type === "education").length} items)
                </p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Profile Sections</h2>
            <Button onClick={() => handleCreateItem("profile-section")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Profile Section
            </Button>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-6 text-center text-muted-foreground">
              {hierarchy.filter((item) => item.type === "profile-section").length === 0 ? (
                <p>No profile sections found. Click "Add Profile Section" to get started.</p>
              ) : (
                <p>
                  Profile section list component coming soon... (
                  {hierarchy.filter((item) => item.type === "profile-section").length} items)
                </p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Text Sections</h2>
            <Button onClick={() => handleCreateItem("text-section")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Text Section
            </Button>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-6 text-center text-muted-foreground">
              {hierarchy.filter((item) => item.type === "text-section").length === 0 ? (
                <p>No text sections found. Click "Add Text Section" to get started.</p>
              ) : (
                <p>
                  Text section list component coming soon... (
                  {hierarchy.filter((item) => item.type === "text-section").length} items)
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <ContentItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={dialogType}
        item={editingItem}
        onSave={handleDialogSave}
      />
    </div>
  )
}
