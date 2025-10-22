/**
 * Firestore Context Provider
 * 
 * Provides centralized Firestore access with caching and state management
 */

import { createContext, useContext, useCallback, useRef, type ReactNode } from "react"
import { firestoreService } from "@/services/firestore/FirestoreService"
import type {
  CollectionTypeMap,
  DocumentWithId,
  QueryConstraints,
  UnsubscribeFn,
  CacheEntry,
  DocumentCacheEntry,
} from "@/services/firestore/types"

interface FirestoreContextValue {
  // Direct service access
  service: typeof firestoreService

  // Cached subscription methods
  subscribeToCollection: <K extends keyof CollectionTypeMap>(
    collectionName: K,
    onData: (data: DocumentWithId<CollectionTypeMap[K]>[]) => void,
    onError: (error: Error) => void,
    constraints?: QueryConstraints,
    cacheKey?: string
  ) => UnsubscribeFn

  subscribeToDocument: <K extends keyof CollectionTypeMap>(
    collectionName: K,
    documentId: string,
    onData: (data: DocumentWithId<CollectionTypeMap[K]> | null) => void,
    onError: (error: Error) => void,
    cacheKey?: string
  ) => UnsubscribeFn

  // Cache management
  clearCache: (cacheKey?: string) => void
  getCachedData: <K extends keyof CollectionTypeMap>(
    cacheKey: string
  ) => DocumentWithId<CollectionTypeMap[K]>[] | null
}

const FirestoreContext = createContext<FirestoreContextValue | undefined>(undefined)

interface FirestoreProviderProps {
  children: ReactNode
}

export function FirestoreProvider({ children }: FirestoreProviderProps) {
  // Cache for collection subscriptions
  const collectionCache = useRef<Map<string, CacheEntry<any>>>(new Map())
  
  // Cache for document subscriptions
  const documentCache = useRef<Map<string, DocumentCacheEntry<any>>>(new Map())

  /**
   * Subscribe to a collection with caching
   */
  const subscribeToCollection = useCallback(
    <K extends keyof CollectionTypeMap>(
      collectionName: K,
      onData: (data: DocumentWithId<CollectionTypeMap[K]>[]) => void,
      onError: (error: Error) => void,
      constraints?: QueryConstraints,
      cacheKey?: string
    ): UnsubscribeFn => {
      // Generate cache key if not provided
      const key = cacheKey || `${collectionName}-${JSON.stringify(constraints || {})}`

      // Check if we already have an active subscription
      const cached = collectionCache.current.get(key)
      if (cached) {
        // Return cached data immediately
        onData(cached.data)
        
        // Return a no-op unsubscribe since we're sharing the subscription
        return () => {
          // Don't actually unsubscribe - let the cache manage it
        }
      }

      // Create new subscription
      const unsubscribe = firestoreService.subscribeToCollection(
        collectionName,
        (data) => {
          // Update cache
          const entry = collectionCache.current.get(key)
          if (entry) {
            entry.data = data
            entry.timestamp = Date.now()
          }
          
          // Call callback
          onData(data)
        },
        onError,
        constraints
      )

      // Store in cache
      collectionCache.current.set(key, {
        data: [],
        timestamp: Date.now(),
        unsubscribe,
      })

      // Return unsubscribe function that cleans up cache
      return () => {
        const entry = collectionCache.current.get(key)
        if (entry) {
          entry.unsubscribe()
          collectionCache.current.delete(key)
        }
      }
    },
    []
  )

  /**
   * Subscribe to a document with caching
   */
  const subscribeToDocument = useCallback(
    <K extends keyof CollectionTypeMap>(
      collectionName: K,
      documentId: string,
      onData: (data: DocumentWithId<CollectionTypeMap[K]> | null) => void,
      onError: (error: Error) => void,
      cacheKey?: string
    ): UnsubscribeFn => {
      // Generate cache key if not provided
      const key = cacheKey || `${collectionName}-${documentId}`

      // Check if we already have an active subscription
      const cached = documentCache.current.get(key)
      if (cached) {
        // Return cached data immediately
        onData(cached.data)
        
        // Return a no-op unsubscribe since we're sharing the subscription
        return () => {
          // Don't actually unsubscribe - let the cache manage it
        }
      }

      // Create new subscription
      const unsubscribe = firestoreService.subscribeToDocument(
        collectionName,
        documentId,
        (data) => {
          // Update cache
          const entry = documentCache.current.get(key)
          if (entry) {
            entry.data = data
            entry.timestamp = Date.now()
          }
          
          // Call callback
          onData(data)
        },
        onError
      )

      // Store in cache
      documentCache.current.set(key, {
        data: null,
        timestamp: Date.now(),
        unsubscribe,
      })

      // Return unsubscribe function that cleans up cache
      return () => {
        const entry = documentCache.current.get(key)
        if (entry) {
          entry.unsubscribe()
          documentCache.current.delete(key)
        }
      }
    },
    []
  )

  /**
   * Clear cache entries
   */
  const clearCache = useCallback((cacheKey?: string) => {
    if (cacheKey) {
      // Clear specific cache entry
      const collectionEntry = collectionCache.current.get(cacheKey)
      if (collectionEntry) {
        collectionEntry.unsubscribe()
        collectionCache.current.delete(cacheKey)
      }

      const documentEntry = documentCache.current.get(cacheKey)
      if (documentEntry) {
        documentEntry.unsubscribe()
        documentCache.current.delete(cacheKey)
      }
    } else {
      // Clear all cache entries
      collectionCache.current.forEach((entry) => entry.unsubscribe())
      collectionCache.current.clear()

      documentCache.current.forEach((entry) => entry.unsubscribe())
      documentCache.current.clear()
    }
  }, [])

  /**
   * Get cached data without subscribing
   */
  const getCachedData = useCallback(
    <K extends keyof CollectionTypeMap>(
      cacheKey: string
    ): DocumentWithId<CollectionTypeMap[K]>[] | null => {
      const entry = collectionCache.current.get(cacheKey)
      return entry ? entry.data : null
    },
    []
  )

  const value: FirestoreContextValue = {
    service: firestoreService,
    subscribeToCollection,
    subscribeToDocument,
    clearCache,
    getCachedData,
  }

  return <FirestoreContext.Provider value={value}>{children}</FirestoreContext.Provider>
}

/**
 * Hook to access Firestore context
 */
export function useFirestore() {
  const context = useContext(FirestoreContext)
  if (!context) {
    throw new Error("useFirestore must be used within a FirestoreProvider")
  }
  return context
}

