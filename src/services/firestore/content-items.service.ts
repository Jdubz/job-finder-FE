/**
 * Content Items Firestore Service
 *
 * Direct Firestore access for content items (experience, projects, skills, etc.)
 * Replaces the Cloud Functions API client for improved performance and real-time updates.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as limitQuery,
  writeBatch,
  onSnapshot,
  type Unsubscribe,
  type QueryConstraint,
  type DocumentReference,
} from "firebase/firestore"
import { db } from "@/config/firebase"
import { auth } from "@/config/firebase"
import type {
  ContentItem,
  CreateContentItemData,
  UpdateContentItemData,
  ContentItemType,
  ContentItemVisibility,
} from "@jsdubzw/job-finder-shared-types"
import {
  convertTimestamps,
  withErrorHandling,
  createCreationMetadata,
  createAuditMetadata,
} from "./utils"

const COLLECTION_NAME = "content-items"

/**
 * Filter options for querying content items
 */
export interface ContentItemFilters {
  type?: ContentItemType[]
  parentId?: string | null
  visibility?: ContentItemVisibility[]
  tags?: string[]
  search?: string
  limit?: number
  offset?: number
}

/**
 * Content item with hierarchy (includes children)
 */
export interface ContentItemWithChildren extends ContentItem {
  children?: ContentItemWithChildren[]
}

/**
 * Content Items Firestore Service
 */
export class ContentItemsService {
  /**
   * Get all content items with optional filtering
   */
  async getItems(filters?: ContentItemFilters): Promise<ContentItem[]> {
    return withErrorHandling(
      "fetch content items",
      async () => {
        const userId = this.getCurrentUserId()
        const constraints: QueryConstraint[] = [
          where("userId", "==", userId),
          orderBy("order", "asc"),
        ]

        // Apply filters
        if (filters) {
          if (filters.type && filters.type.length > 0) {
            constraints.push(where("type", "in", filters.type))
          }

          if (filters.parentId !== undefined) {
            constraints.push(where("parentId", "==", filters.parentId))
          }

          if (filters.visibility && filters.visibility.length > 0) {
            constraints.push(where("visibility", "in", filters.visibility))
          }

          if (filters.tags && filters.tags.length > 0) {
            constraints.push(where("tags", "array-contains-any", filters.tags))
          }

          if (filters.limit) {
            constraints.push(limitQuery(filters.limit))
          }
        }

        const q = query(collection(db, COLLECTION_NAME), ...constraints)
        const snapshot = await getDocs(q)

        let items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...convertTimestamps(doc.data()),
        })) as ContentItem[]

        // Apply client-side search filter if specified
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase()
          items = items.filter((item) => {
            const searchableText = JSON.stringify(item).toLowerCase()
            return searchableText.includes(searchLower)
          })
        }

        return items
      },
      COLLECTION_NAME
    )
  }

  /**
   * Get content items organized in a hierarchy
   */
  async getHierarchy(filters?: ContentItemFilters): Promise<ContentItemWithChildren[]> {
    return withErrorHandling(
      "fetch content items hierarchy",
      async () => {
        // Get all items
        const allItems = await this.getItems(filters)

        // Build hierarchy
        const itemsMap = new Map<string, ContentItemWithChildren>()
        const rootItems: ContentItemWithChildren[] = []

        // First pass: create map
        allItems.forEach((item) => {
          itemsMap.set(item.id, { ...item, children: [] })
        })

        // Second pass: build tree
        itemsMap.forEach((item) => {
          if (item.parentId) {
            const parent = itemsMap.get(item.parentId)
            if (parent) {
              parent.children = parent.children || []
              parent.children.push(item)
            } else {
              // Parent not found, treat as root
              rootItems.push(item)
            }
          } else {
            rootItems.push(item)
          }
        })

        // Sort children recursively
        const sortChildren = (items: ContentItemWithChildren[]) => {
          items.sort((a, b) => a.order - b.order)
          items.forEach((item) => {
            if (item.children && item.children.length > 0) {
              sortChildren(item.children)
            }
          })
        }

        sortChildren(rootItems)
        return rootItems
      },
      COLLECTION_NAME
    )
  }

  /**
   * Get a single content item by ID
   */
  async getItem(id: string): Promise<ContentItem> {
    return withErrorHandling(
      "fetch content item",
      async () => {
        const docRef = doc(db, COLLECTION_NAME, id)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          throw new Error(`Content item ${id} not found`)
        }

        // Verify ownership
        const data = docSnap.data()
        const userId = this.getCurrentUserId()
        if (data.userId !== userId) {
          throw new Error("Permission denied: not owner of this content item")
        }

        return {
          id: docSnap.id,
          ...convertTimestamps(data),
        } as ContentItem
      },
      COLLECTION_NAME
    )
  }

  /**
   * Create a new content item
   */
  async createItem(data: CreateContentItemData): Promise<ContentItem> {
    return withErrorHandling(
      "create content item",
      async () => {
        const userId = this.getCurrentUserId()
        const userEmail = this.getCurrentUserEmail()

        const newDocRef = doc(collection(db, COLLECTION_NAME))
        const itemData = {
          ...data,
          ...createCreationMetadata(userId, userEmail),
        }

        await setDoc(newDocRef, itemData)

        return {
          id: newDocRef.id,
          ...itemData,
        } as ContentItem
      },
      COLLECTION_NAME
    )
  }

  /**
   * Update an existing content item
   */
  async updateItem(id: string, data: UpdateContentItemData): Promise<ContentItem> {
    return withErrorHandling(
      "update content item",
      async () => {
        const docRef = doc(db, COLLECTION_NAME, id)

        // Verify ownership first
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) {
          throw new Error(`Content item ${id} not found`)
        }

        const userId = this.getCurrentUserId()
        const existingData = docSnap.data()
        if (existingData.userId !== userId) {
          throw new Error("Permission denied: not owner of this content item")
        }

        const userEmail = this.getCurrentUserEmail()
        const updateData = {
          ...data,
          ...createAuditMetadata(userId, userEmail),
        }

        await updateDoc(docRef, updateData)

        // Return updated item
        const updated = await getDoc(docRef)
        return {
          id: updated.id,
          ...convertTimestamps(updated.data()!),
        } as ContentItem
      },
      COLLECTION_NAME
    )
  }

  /**
   * Delete a content item (and optionally its children)
   */
  async deleteItem(id: string, deleteChildren: boolean = false): Promise<number> {
    return withErrorHandling(
      "delete content item",
      async () => {
        const docRef = doc(db, COLLECTION_NAME, id)

        // Verify ownership
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) {
          throw new Error(`Content item ${id} not found`)
        }

        const userId = this.getCurrentUserId()
        const existingData = docSnap.data()
        if (existingData.userId !== userId) {
          throw new Error("Permission denied: not owner of this content item")
        }

        let deletedCount = 0

        if (deleteChildren) {
          // Find and delete all children recursively
          const childItems = await this.getItems({ parentId: id })

          // Use batch for efficiency (max 500 operations per batch)
          const batches: DocumentReference[][] = []
          let currentBatch: DocumentReference[] = []

          // Delete item itself
          currentBatch.push(docRef)

          // Delete children
          for (const child of childItems) {
            const childRef = doc(db, COLLECTION_NAME, child.id)
            currentBatch.push(childRef)

            if (currentBatch.length >= 500) {
              batches.push(currentBatch)
              currentBatch = []
            }
          }

          if (currentBatch.length > 0) {
            batches.push(currentBatch)
          }

          // Execute all batches
          for (const batchRefs of batches) {
            const batch = writeBatch(db)
            batchRefs.forEach((ref) => batch.delete(ref))
            await batch.commit()
            deletedCount += batchRefs.length
          }
        } else {
          // Just delete the item
          await deleteDoc(docRef)
          deletedCount = 1
        }

        return deletedCount
      },
      COLLECTION_NAME
    )
  }

  /**
   * Reorder content items
   */
  async reorderItems(items: Array<{ id: string; order: number }>): Promise<void> {
    return withErrorHandling(
      "reorder content items",
      async () => {
        const userId = this.getCurrentUserId()
        const userEmail = this.getCurrentUserEmail()

        // Batch update (max 500 operations)
        interface BatchItem {
          ref: DocumentReference
          order: number
        }
        const batches: BatchItem[][] = []
        let currentBatch: BatchItem[] = []

        for (const item of items) {
          const docRef = doc(db, COLLECTION_NAME, item.id)

          // Verify ownership
          const docSnap = await getDoc(docRef)
          if (!docSnap.exists()) {
            continue // Skip missing items
          }

          const existingData = docSnap.data()
          if (existingData.userId !== userId) {
            throw new Error(`Permission denied: not owner of item ${item.id}`)
          }

          currentBatch.push({ ref: docRef, order: item.order })

          if (currentBatch.length >= 500) {
            batches.push(currentBatch)
            currentBatch = []
          }
        }

        if (currentBatch.length > 0) {
          batches.push(currentBatch)
        }

        // Execute all batches
        for (const batchItems of batches) {
          const batch = writeBatch(db)
          batchItems.forEach(({ ref, order }) => {
            batch.update(ref, {
              order,
              ...createAuditMetadata(userId, userEmail),
            })
          })
          await batch.commit()
        }
      },
      COLLECTION_NAME
    )
  }

  /**
   * Subscribe to real-time updates for content items
   */
  subscribeToItems(
    filters: ContentItemFilters,
    callback: (items: ContentItem[]) => void
  ): Unsubscribe {
    const userId = this.getCurrentUserId()
    const constraints: QueryConstraint[] = [where("userId", "==", userId), orderBy("order", "asc")]

    if (filters.type && filters.type.length > 0) {
      constraints.push(where("type", "in", filters.type))
    }

    if (filters.parentId !== undefined) {
      constraints.push(where("parentId", "==", filters.parentId))
    }

    if (filters.visibility && filters.visibility.length > 0) {
      constraints.push(where("visibility", "in", filters.visibility))
    }

    const q = query(collection(db, COLLECTION_NAME), ...constraints)

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...convertTimestamps(doc.data()),
      })) as ContentItem[]

      callback(items)
    })
  }

  /**
   * Helper: Get current user ID
   */
  private getCurrentUserId(): string {
    const user = auth.currentUser
    if (!user) {
      throw new Error("User not authenticated")
    }
    return user.uid
  }

  /**
   * Helper: Get current user email
   */
  private getCurrentUserEmail(): string | undefined {
    return auth.currentUser?.email || undefined
  }
}

// Export singleton instance
export const contentItemsService = new ContentItemsService()
