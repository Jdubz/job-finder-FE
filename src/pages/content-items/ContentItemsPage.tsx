import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import type {
  ContentItem as ContentItemType,
  ContentItemWithChildren,
  UpdateContentItemData,
  CreateContentItemData,
} from "@/types/content-items"
import { useContentItems } from "@/hooks/useContentItems"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Download, Upload, AlertCircle } from "lucide-react"
import { ContentItem } from "./components/ContentItem"
import { ContentItemDialog } from "./components/ContentItemDialog"

export function ContentItemsPage() {
  const { user, isEditor } = useAuth()

  const {
    contentItems,
    loading,
    error: firestoreError,
    createContentItem,
    updateContentItem,
    deleteContentItem
  } = useContentItems()

  const [hierarchy, setHierarchy] = useState<ContentItemWithChildren[]>([])
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<ContentItemType>("company")
  const [preselectedParentId, setPreselectedParentId] = useState<string | null>(null)

  // Auto-dismiss success alerts after 3 seconds
  useEffect(() => {
    if (alert?.type === "success") {
      const timer = setTimeout(() => setAlert(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [alert])

  // Build hierarchy when content items change
  useEffect(() => {
    if (firestoreError) {
      setAlert({
        type: "error",
        message: "Failed to load content. Please try again.",
      })
      return
    }

    const filteredItems = contentItems.filter((item) =>
      item.visibility === "published" || item.visibility === "draft"
    )

    const newHierarchy = buildHierarchy(filteredItems)
    setHierarchy(newHierarchy)
  }, [contentItems, firestoreError])

  // Build hierarchy from flat list
  const buildHierarchy = (items: ContentItemType[]): ContentItemWithChildren[] => {
    const itemsMap = new Map<string, ContentItemWithChildren>()
    const rootItems: ContentItemWithChildren[] = []

    // First pass: create map of all items
    items.forEach((item) => {
      itemsMap.set(item.id, { ...item, children: [] })
    })

    // Second pass: build parent-child relationships
    items.forEach((item) => {
      const itemWithChildren = itemsMap.get(item.id)!

      // Only treat as root if parentId is explicitly null or undefined
      // Skip items with parentId that points to missing parent (orphaned items)
      if (item.parentId) {
        if (itemsMap.has(item.parentId)) {
          const parent = itemsMap.get(item.parentId)!
          parent.children!.push(itemWithChildren)
        }
        // If parent doesn't exist, skip this item (orphaned)
      } else {
        // No parentId = root item
        rootItems.push(itemWithChildren)
      }
    })

    // Sort root items by order
    return rootItems.sort((a, b) => a.order - b.order)
  }

  const handleUpdateItem = async (id: string, data: UpdateContentItemData) => {
    try {
      await updateContentItem(id, data)
      setAlert({
        type: "success",
        message: "Item updated successfully",
      })
    } catch (error) {
      console.error("Failed to update content item:", error)
      setAlert({
        type: "error",
        message: "Failed to update item. Please try again.",
      })
      throw error
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      // Delete the item and its children
      await deleteContentItem(id)
      const children = contentItems.filter((item) => item.parentId === id)
      await Promise.all(children.map((child) => deleteContentItem(child.id)))

      setAlert({
        type: "success",
        message: "Item deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete content item:", error)
      setAlert({
        type: "error",
        message: "Failed to delete item. Please try again.",
      })
      throw error
    }
  }

  const handleAddChild = (parentId: string, childType: string) => {
    setPreselectedParentId(parentId)
    setDialogType(childType as ContentItemType)
    setDialogOpen(true)
  }

  const handleCreateNew = () => {
    setPreselectedParentId(null)
    setDialogType("company")
    setDialogOpen(true)
  }

  const handleExportItems = async () => {
    try {
      const dataStr = JSON.stringify(contentItems, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = "content-items-export.json"
      link.click()
      URL.revokeObjectURL(url)

      setAlert({
        type: "success",
        message: `Exported ${contentItems.length} items`,
      })
    } catch (error) {
      console.error("Failed to export content items:", error)
      setAlert({
        type: "error",
        message: "Failed to export. Please try again.",
      })
    }
  }

  const handleImportItems = async () => {
    try {
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
            throw new Error("Invalid file format")
          }

          await Promise.all(items.map((item) => createContentItem(item)))

          setAlert({
            type: "success",
            message: `Imported ${items.length} items successfully`,
          })
        } catch (error) {
          console.error("Failed to import:", error)
          setAlert({
            type: "error",
            message: "Failed to import. Please check the file format.",
          })
        }
      }

      input.click()
    } catch (error) {
      console.error("Failed to import content items:", error)
      setAlert({
        type: "error",
        message: "Failed to import. Please try again.",
      })
    }
  }

  // Recursive rendering function
  const renderItemWithChildren = (item: ContentItemWithChildren) => {
    return (
      <ContentItem
        key={item.id}
        item={item}
        isEditor={isEditor}
        onUpdate={handleUpdateItem}
        onDelete={handleDeleteItem}
        onAddChild={handleAddChild}
      >
        {/* Render children if they exist */}
        {item.children && item.children.length > 0 && (
          <div className="mt-4">
            {item.children.map((child) => renderItemWithChildren(child))}
          </div>
        )}
      </ContentItem>
    )
  }

  // Separate companies and other root items
  const companies = hierarchy.filter((item) => item.type === "company")
  const profileSections = hierarchy.filter((item) => item.type === "profile-section")
  const otherItems = hierarchy.filter(
    (item) => item.type !== "company" && item.type !== "profile-section"
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Experience</h1>
            <p className="text-muted-foreground mt-2">Manage your professional experience and portfolio</p>
          </div>
          {isEditor && (
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Content
            </Button>
          )}
        </div>

        {/* Actions */}
        {isEditor && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportItems}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportItems}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        )}

        {/* Alert */}
        {alert && (
          <Alert variant={alert.type === "error" ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Profile Sections */}
      {profileSections.length > 0 && (
        <div className="space-y-4">
          {profileSections.map((section) => renderItemWithChildren(section))}
        </div>
      )}

      {/* Companies (Work Experience) */}
      {companies.length > 0 ? (
        <div className="space-y-4">
          {companies.map((company) => renderItemWithChildren(company))}
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <div className="mx-auto max-w-md space-y-3">
            <h3 className="text-lg font-medium">No work experience yet</h3>
            <p className="text-sm text-muted-foreground">
              {isEditor
                ? "Add your professional experience to showcase your career history and accomplishments."
                : "Check back later for experience details."}
            </p>
            {isEditor && (
              <Button onClick={handleCreateNew} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Experience
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Other Content (Skills, Education, etc.) */}
      {otherItems.length > 0 && (
        <div className="space-y-4">
          {otherItems.map((item) => renderItemWithChildren(item))}
        </div>
      )}

      {/* Create Content Dialog */}
      <ContentItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={dialogType}
        onSave={() => {
          setDialogOpen(false)
          setPreselectedParentId(null)
          setAlert({
            type: "success",
            message: "Item created successfully",
          })
        }}
      />
    </div>
  )
}
