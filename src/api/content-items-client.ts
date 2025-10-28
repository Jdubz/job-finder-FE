/**
 * Content Items API Client
 *
 * Handles all content-items collection operations using FirestoreService
 */

import { firestoreService } from "@/services/firestore"
import { createUpdateMetadata, createDocumentMetadata } from "@/services/firestore/utils"
import type { ContentItemDocument } from "@/services/firestore/types"

export const CONTENT_ITEMS_COLLECTION = "content-items" as const

/**
 * Content Items Client
 *
 * Provides CRUD operations for content items using the centralized FirestoreService
 */
class ContentItemsClient {
  /**
   * Create a new content item
   */
  async createContentItem(
    userId: string,
    data: Omit<
      ContentItemDocument,
      "id" | "userId" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
    >
  ): Promise<string> {
    const docData = {
      ...data,
      userId,
      ...createDocumentMetadata(userId),
    } as any

    return firestoreService.createDocument(CONTENT_ITEMS_COLLECTION, docData)
  }

  /**
   * Update an existing content item
   */
  async updateContentItem(
    id: string,
    userId: string,
    data: Partial<ContentItemDocument>
  ): Promise<void> {
    const updateData = {
      ...data,
      ...createUpdateMetadata(userId),
    } as any

    await firestoreService.updateDocument(CONTENT_ITEMS_COLLECTION, id, updateData)
  }

  /**
   * Delete a content item
   */
  async deleteContentItem(id: string): Promise<void> {
    await firestoreService.deleteDocument(CONTENT_ITEMS_COLLECTION, id)
  }

  /**
   * Get a single content item by ID
   */
  async getContentItem(id: string): Promise<ContentItemDocument | null> {
    return firestoreService.getDocument(CONTENT_ITEMS_COLLECTION, id)
  }

  /**
   * Get all content items for a user
   */
  async getContentItems(userId?: string): Promise<ContentItemDocument[]> {
    const constraints = userId
      ? {
          where: [{ field: "userId" as const, operator: "==" as const, value: userId }],
          orderBy: [{ field: "order" as const, direction: "asc" as const }],
        }
      : { orderBy: [{ field: "order" as const, direction: "asc" as const }] }

    return firestoreService.getDocuments(CONTENT_ITEMS_COLLECTION, constraints)
  }

  /**
   * Subscribe to content items changes
   */
  subscribeToContentItems(
    onUpdate: (items: ContentItemDocument[]) => void,
    onError: ((error: Error) => void) | undefined = undefined,
    userId?: string
  ) {
    const constraints = userId
      ? {
          where: [{ field: "userId" as const, operator: "==" as const, value: userId }],
          orderBy: [{ field: "order" as const, direction: "asc" as const }],
        }
      : { orderBy: [{ field: "order" as const, direction: "asc" as const }] }

    return firestoreService.subscribeToCollection(
      CONTENT_ITEMS_COLLECTION,
      onUpdate,
      onError || (() => {}),
      constraints
    )
  }
}

export const contentItemsClient = new ContentItemsClient()
export { ContentItemsClient }
