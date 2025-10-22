/**
 * Generator Documents Hook
 * 
 * Hook for managing generated documents (resume/cover letter history)
 */

import { useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useFirestore } from "@/contexts/FirestoreContext"
import { useFirestoreCollection } from "./useFirestoreCollection"

// Define generator document type (matches the Firestore schema)
export interface GeneratorDocument {
  id: string
  userId?: string // Flat field for backward compatibility
  access?: {
    userId: string
    viewerSessionId?: string
    isPublic: boolean
  }
  type?: "resume" | "cover_letter"
  jobTitle?: string
  companyName?: string
  documentUrl?: string
  createdAt?: Date
  updatedAt?: Date
  jobMatchId?: string
}

interface UseGeneratorDocumentsResult {
  documents: GeneratorDocument[]
  loading: boolean
  error: Error | null
  deleteDocument: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

/**
 * Hook to manage generator documents for all users (editors see everything)
 */
export function useGeneratorDocuments(): UseGeneratorDocumentsResult {
  const { user } = useAuth()
  const { service } = useFirestore()

  // Subscribe to ALL generator documents (no userId filter - editors see everything)
  const { data: documents, loading, error, refetch } = useFirestoreCollection({
    collectionName: "generator-documents" as any,
    constraints: user?.uid
      ? {
          orderBy: [{ field: "createdAt", direction: "desc" }],
        }
      : undefined,
    enabled: !!user?.uid,
  })

  /**
   * Delete a generator document
   */
  const deleteDocument = useCallback(
    async (id: string) => {
      await service.deleteDocument("generator-documents" as any, id)
    },
    [service]
  )

  return {
    documents: documents as GeneratorDocument[],
    loading,
    error,
    deleteDocument,
    refetch,
  }
}

