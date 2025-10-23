/**
 * Firestore Collection Hook
 *
 * Generic hook for subscribing to Firestore collections with automatic cleanup
 */

import { useState, useEffect, useCallback } from "react"
import { useFirestore } from "@/contexts/FirestoreContext"
import type {
  CollectionTypeMap,
  DocumentWithId,
  QueryConstraints,
} from "@/services/firestore/types"

interface UseFirestoreCollectionOptions<K extends keyof CollectionTypeMap> {
  collectionName: K
  constraints?: QueryConstraints
  cacheKey?: string
  enabled?: boolean
}

interface UseFirestoreCollectionResult<T> {
  data: DocumentWithId<T>[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook to subscribe to a Firestore collection with real-time updates
 */
export function useFirestoreCollection<K extends keyof CollectionTypeMap>({
  collectionName,
  constraints,
  cacheKey,
  enabled = true,
}: UseFirestoreCollectionOptions<K>): UseFirestoreCollectionResult<CollectionTypeMap[K]> {
  const { subscribeToCollection, service } = useFirestore()
  const [data, setData] = useState<DocumentWithId<CollectionTypeMap[K]>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = subscribeToCollection(
      collectionName,
      (newData) => {
        setData(newData)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
      constraints,
      cacheKey
    )

    return () => {
      unsubscribe()
    }
  }, [collectionName, JSON.stringify(constraints), cacheKey, enabled, subscribeToCollection])

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const newData = await service.getDocuments(collectionName, constraints)
      setData(newData)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [service, collectionName, constraints])

  return {
    data,
    loading,
    error,
    refetch,
  }
}
