/**
 * Queue Items Hook
 *
 * Hook for managing job queue items with type safety
 */

import { useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useFirestore } from "@/contexts/FirestoreContext"
import { useFirestoreCollection } from "./useFirestoreCollection"
import type { QueueItemDocument } from "@jdubzw/job-finder-shared-types"
import type { DocumentWithId } from "@/services/firestore/types"

interface UseQueueItemsOptions {
  limit?: number
  status?: string
}

interface UseQueueItemsResult {
  queueItems: DocumentWithId<QueueItemDocument>[]
  loading: boolean
  error: Error | null
  updateQueueItem: (id: string, data: Partial<QueueItemDocument>) => Promise<void>
  deleteQueueItem: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

/**
 * Hook to manage queue items for all users (editors see everything)
 */
export function useQueueItems(options: UseQueueItemsOptions = {}): UseQueueItemsResult {
  const { user } = useAuth()
  const { service } = useFirestore()
  const { limit: maxItems = 50, status } = options

  // Build query constraints - NO userId filter, editors see all queue items
  const constraints = user?.uid
    ? {
        where: status ? [{ field: "status", operator: "==" as const, value: status }] : [],
        orderBy: [{ field: "created_at", direction: "desc" as const }],
        limit: maxItems,
      }
    : undefined

  // Subscribe to ALL queue items (no submitted_by filter - editors see everything)
  const {
    data: queueItems,
    loading,
    error,
    refetch,
  } = useFirestoreCollection({
    collectionName: "job-queue",
    constraints,
    enabled: !!user?.uid,
  })

  /**
   * Update a queue item
   */
  const updateQueueItem = useCallback(
    async (id: string, data: Partial<QueueItemDocument>) => {
      await service.updateDocument("job-queue", id, data)
    },
    [service]
  )

  /**
   * Delete a queue item
   */
  const deleteQueueItem = useCallback(
    async (id: string) => {
      await service.deleteDocument("job-queue", id)
    },
    [service]
  )

  return {
    queueItems,
    loading,
    error,
    updateQueueItem,
    deleteQueueItem,
    refetch,
  }
}
