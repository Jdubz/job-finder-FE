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
  const [preselectedType, setPreselectedType] = useState<string | undefined>(undefined)
  const [preselectedParentId, setPreselectedParentId] = useState<string | null>(null)

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
      if (item.parentId && itemsMap.has(item.parentId)) {
        const parent = itemsMap.get(item.parentId)!
        parent.children!.push(itemWithChildren)
      } else {
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
    setPreselectedType(childType)
    setDialogOpen(true)
  }

  const handleCreateNew = () => {
    setPreselectedParentId(null)
    setPreselectedType(undefined)
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
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Experience</h1>

        {/* Actions */}
        {isEditor && (
          <div className="flex gap-2 mb-4">
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Content
            </Button>
            <Button variant="outline" onClick={handleExportItems}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={handleImportItems}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        )}

        {/* Alert */}
        {alert && (
          <Alert variant={alert.type === "error" ? "destructive" : "default"} className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Profile Sections */}
      {profileSections.map((section) => renderItemWithChildren(section))}

      {/* Companies (Work Experience) */}
      {companies.length > 0 && (
        <div className="mb-8">
          {companies.map((company) => renderItemWithChildren(company))}
        </div>
      )}

      {companies.length === 0 && (
        <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg mb-8">
          No work experience yet.
          {isEditor && " Click 'Add Content' to create entries."}
        </div>
      )}

      {/* Other Content (Skills, Education, etc.) */}
      {otherItems.map((item) => renderItemWithChildren(item))}

      {/* Create Content Dialog */}
      <ContentItemDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setPreselectedType(undefined)
          setPreselectedParentId(null)
        }}
        onCreate={async (data) => {
          try {
            // Add parentId if creating a child
            if (preselectedParentId) {
              data.parentId = preselectedParentId
            }
            await createContentItem(data)
            setDialogOpen(false)
            setPreselectedType(undefined)
            setPreselectedParentId(null)
            setAlert({
              type: "success",
              message: "Item created successfully",
            })
          } catch (error) {
            console.error("Failed to create content item:", error)
            setAlert({
              type: "error",
              message: "Failed to create item. Please try again.",
            })
          }
        }}
        preselectedType={preselectedType}
      />
    </div>
  )
}
