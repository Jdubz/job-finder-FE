/**
 * Job Queue Firestore Service
 *
 * Direct Firestore access for job queue items.
 * Users can create, read, update, and delete their own queue items.
 * Provides real-time updates for queue status tracking.
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
  onSnapshot,
  type Unsubscribe,
  type QueryConstraint,
} from "firebase/firestore"
import { db } from "@/config/firebase"
import { auth } from "@/config/firebase"
import type {
  QueueItem,
  QueueStatus,
  QueueItemType,
  QueueSource,
  ScrapeConfig,
  SourceDiscoveryConfig,
  QueueStats,
} from "@jsdubzw/job-finder-shared-types"
import {
  convertTimestamps,
  withErrorHandling,
} from "./utils"

const COLLECTION_NAME = "job-queue"

/**
 * Filter options for querying queue items
 */
export interface QueueItemFilters {
  type?: QueueItemType[]
  status?: QueueStatus[]
  companyName?: string
  source?: QueueSource[]
  search?: string
  limit?: number
}

/**
 * Create queue item data (omit auto-generated fields)
 */
export interface CreateQueueItemData {
  type: QueueItemType
  url: string
  company_name: string
  company_id?: string | null
  source: QueueSource
  retry_count?: number
  max_retries?: number
  scrape_config?: ScrapeConfig | null
  source_discovery_config?: SourceDiscoveryConfig | null
}

/**
 * Update queue item data (partial update)
 */
export interface UpdateQueueItemData {
  status?: QueueStatus
  result_message?: string
  error_details?: string
  retry_count?: number
  scraped_data?: Record<string, unknown> | null
  processed_at?: Date | null
  completed_at?: Date | null
}

/**
 * Job Queue Firestore Service
 */
export class JobQueueService {
  /**
   * Get all queue items for the current user with optional filtering
   */
  async getItems(filters?: QueueItemFilters): Promise<QueueItem[]> {
    return withErrorHandling(
      "fetch queue items",
      async () => {
        const userId = this.getCurrentUserId()
        const constraints: QueryConstraint[] = [
          where("submitted_by", "==", userId),
        ]

        // Apply filters
        if (filters) {
          if (filters.type && filters.type.length > 0) {
            constraints.push(where("type", "in", filters.type))
          }

          if (filters.status && filters.status.length > 0) {
            constraints.push(where("status", "in", filters.status))
          }

          if (filters.companyName) {
            constraints.push(where("company_name", "==", filters.companyName))
          }

          if (filters.source && filters.source.length > 0) {
            constraints.push(where("source", "in", filters.source))
          }
        }

        // Default ordering by creation time (newest first)
        constraints.push(orderBy("created_at", "desc"))

        // Apply limit
        if (filters?.limit) {
          constraints.push(limitQuery(filters.limit))
        }

        const q = query(collection(db, COLLECTION_NAME), ...constraints)
        const snapshot = await getDocs(q)

        let items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...convertTimestamps(doc.data()),
        })) as QueueItem[]

        // Apply client-side search filter if specified
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase()
          items = items.filter((item) => {
            const searchableText = [
              item.company_name,
              item.url,
              item.result_message,
              item.error_details,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
            return searchableText.includes(searchLower)
          })
        }

        return items
      },
      COLLECTION_NAME
    )
  }

  /**
   * Get a single queue item by ID
   */
  async getItem(id: string): Promise<QueueItem> {
    return withErrorHandling(
      "fetch queue item",
      async () => {
        const docRef = doc(db, COLLECTION_NAME, id)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          throw new Error(`Queue item ${id} not found`)
        }

        // Verify ownership
        const data = docSnap.data()
        const userId = this.getCurrentUserId()
        if (data.submitted_by !== userId) {
          throw new Error("Permission denied: not owner of this queue item")
        }

        return {
          id: docSnap.id,
          ...convertTimestamps(data),
        } as QueueItem
      },
      COLLECTION_NAME
    )
  }

  /**
   * Create a new queue item
   */
  async createItem(data: CreateQueueItemData): Promise<QueueItem> {
    return withErrorHandling(
      "create queue item",
      async () => {
        const userId = this.getCurrentUserId()
        const now = new Date()

        const newDocRef = doc(collection(db, COLLECTION_NAME))
        const itemData: Omit<QueueItem, "id"> = {
          ...data,
          status: "pending",
          submitted_by: userId,
          retry_count: data.retry_count ?? 0,
          max_retries: data.max_retries ?? 3,
          created_at: now,
          updated_at: now,
        }

        await setDoc(newDocRef, itemData)

        return {
          id: newDocRef.id,
          ...itemData,
        } as QueueItem
      },
      COLLECTION_NAME
    )
  }

  /**
   * Update an existing queue item (only if not completed/failed)
   */
  async updateItem(id: string, data: UpdateQueueItemData): Promise<QueueItem> {
    return withErrorHandling(
      "update queue item",
      async () => {
        const docRef = doc(db, COLLECTION_NAME, id)

        // Verify ownership and status
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) {
          throw new Error(`Queue item ${id} not found`)
        }

        const userId = this.getCurrentUserId()
        const existingData = docSnap.data()
        if (existingData.submitted_by !== userId) {
          throw new Error("Permission denied: not owner of this queue item")
        }

        // Check if item is completed or failed
        if (existingData.status === "success" || existingData.status === "failed") {
          throw new Error("Cannot update completed or failed queue items")
        }

        const updateData = {
          ...data,
          updated_at: new Date(),
        }

        await updateDoc(docRef, updateData)

        // Return updated item
        const updated = await getDoc(docRef)
        return {
          id: updated.id,
          ...convertTimestamps(updated.data()!),
        } as QueueItem
      },
      COLLECTION_NAME
    )
  }

  /**
   * Delete a queue item (only if pending)
   */
  async deleteItem(id: string): Promise<void> {
    return withErrorHandling(
      "delete queue item",
      async () => {
        const docRef = doc(db, COLLECTION_NAME, id)

        // Verify ownership and status
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) {
          throw new Error(`Queue item ${id} not found`)
        }

        const userId = this.getCurrentUserId()
        const existingData = docSnap.data()
        if (existingData.submitted_by !== userId) {
          throw new Error("Permission denied: not owner of this queue item")
        }

        // Only allow deletion of pending items
        if (existingData.status !== "pending") {
          throw new Error("Can only delete pending queue items")
        }

        await deleteDoc(docRef)
      },
      COLLECTION_NAME
    )
  }

  /**
   * Get queue statistics for the current user
   */
  async getStats(filters?: QueueItemFilters): Promise<QueueStats> {
    return withErrorHandling(
      "fetch queue statistics",
      async () => {
        const items = await this.getItems(filters)

        const stats: QueueStats = {
          pending: items.filter((i) => i.status === "pending").length,
          processing: items.filter((i) => i.status === "processing").length,
          success: items.filter((i) => i.status === "success").length,
          failed: items.filter((i) => i.status === "failed").length,
          skipped: items.filter((i) => i.status === "skipped").length,
          filtered: items.filter((i) => i.status === "filtered").length,
          total: items.length,
        }

        return stats
      },
      COLLECTION_NAME
    )
  }

  /**
   * Get pending queue items
   */
  async getPendingItems(): Promise<QueueItem[]> {
    return this.getItems({ status: ["pending"] })
  }

  /**
   * Get processing queue items
   */
  async getProcessingItems(): Promise<QueueItem[]> {
    return this.getItems({ status: ["processing"] })
  }

  /**
   * Get failed queue items
   */
  async getFailedItems(): Promise<QueueItem[]> {
    return this.getItems({ status: ["failed"] })
  }

  /**
   * Get recent queue items
   */
  async getRecentItems(count: number = 20): Promise<QueueItem[]> {
    return this.getItems({ limit: count })
  }

  /**
   * Submit a job URL to the queue
   */
  async submitJob(
    url: string,
    companyName: string,
    companyId?: string | null
  ): Promise<QueueItem> {
    return this.createItem({
      type: "job",
      url,
      company_name: companyName,
      company_id: companyId ?? null,
      source: "user_submission",
    })
  }

  /**
   * Submit a scrape request to the queue
   */
  async submitScrape(scrapeConfig?: ScrapeConfig): Promise<QueueItem> {
    return this.createItem({
      type: "scrape",
      url: "", // Scrape requests don't have a specific URL
      company_name: "Automated Scrape",
      company_id: null,
      source: "user_request",
      scrape_config: scrapeConfig ?? null,
    })
  }

  /**
   * Submit a company URL to the queue
   */
  async submitCompany(
    companyName: string,
    websiteUrl: string
  ): Promise<QueueItem> {
    return this.createItem({
      type: "company",
      url: websiteUrl,
      company_name: companyName,
      company_id: null,
      source: "manual_submission",
    })
  }

  /**
   * Subscribe to real-time updates for queue items
   */
  subscribeToItems(
    filters: QueueItemFilters,
    callback: (items: QueueItem[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const userId = this.getCurrentUserId()
    const constraints: QueryConstraint[] = [
      where("submitted_by", "==", userId),
    ]

    // Apply filters
    if (filters.type && filters.type.length > 0) {
      constraints.push(where("type", "in", filters.type))
    }

    if (filters.status && filters.status.length > 0) {
      constraints.push(where("status", "in", filters.status))
    }

    if (filters.companyName) {
      constraints.push(where("company_name", "==", filters.companyName))
    }

    if (filters.source && filters.source.length > 0) {
      constraints.push(where("source", "in", filters.source))
    }

    // Order by creation time (newest first)
    constraints.push(orderBy("created_at", "desc"))

    // Apply limit
    if (filters.limit) {
      constraints.push(limitQuery(filters.limit))
    }

    const q = query(collection(db, COLLECTION_NAME), ...constraints)

    return onSnapshot(
      q,
      (snapshot) => {
        let items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...convertTimestamps(doc.data()),
        })) as QueueItem[]

        // Apply client-side search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          items = items.filter((item) => {
            const searchableText = [
              item.company_name,
              item.url,
              item.result_message,
              item.error_details,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
            return searchableText.includes(searchLower)
          })
        }

        callback(items)
      },
      (error) => {
        console.error("Error subscribing to queue items:", error)
        if (onError) {
          onError(error as Error)
        }
      }
    )
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
}

// Export singleton instance
export const jobQueueService = new JobQueueService()
