/**
 * Generator Documents Hook
 *
 * Hook for managing generated documents (resume/cover letter history)
 */

import { useCallback, useMemo } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useFirestore } from "@/contexts/FirestoreContext"
import { useFirestoreCollection } from "./useFirestoreCollection"
import type { GeneratorRequest, GeneratorResponse } from "@jdubzw/job-finder-shared-types"

// Union type for generator documents
export type GeneratorDocument = GeneratorRequest | GeneratorResponse

// Simplified document interface for UI display
export interface DocumentHistoryItem {
  id: string
  type: "resume" | "cover_letter" | "both"
  jobTitle: string
  companyName: string
  documentUrl?: string
  createdAt: Date
  status: "pending" | "processing" | "completed" | "failed"
  jobMatchId?: string
}

interface UseGeneratorDocumentsResult {
  documents: DocumentHistoryItem[]
  loading: boolean
  error: Error | null
  deleteDocument: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

/**
 * Transform raw Firestore documents into UI-friendly format
 */
function transformDocuments(rawDocuments: GeneratorDocument[]): DocumentHistoryItem[] {
  return rawDocuments
    .filter((doc): doc is GeneratorRequest => doc.type === "request")
    .map((doc) => {
      // Extract job information
      const jobTitle = doc.job.role
      const companyName = doc.job.company

      // Determine document type based on generateType
      let documentType: "resume" | "cover_letter" | "both" = "resume"
      if (doc.generateType === "coverLetter") {
        documentType = "cover_letter"
      } else if (doc.generateType === "both") {
        documentType = "both"
      }

      // Get document URL from files if available
      let documentUrl: string | undefined
      if (doc.intermediateResults?.resumeContent && doc.intermediateResults?.coverLetterContent) {
        // For both documents, we'll use the resume URL as primary
        documentUrl = undefined // Will be handled by the UI to show both options
      }

      return {
        id: doc.id,
        type: documentType,
        jobTitle,
        companyName,
        documentUrl,
        createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt),
        status: doc.status,
        jobMatchId: doc.jobMatchId,
      }
    })
}

/**
 * Hook to manage generator documents for all users (editors see everything)
 */
export function useGeneratorDocuments(): UseGeneratorDocumentsResult {
  const { user } = useAuth()
  const { service } = useFirestore()

  // Subscribe to ALL generator documents (no userId filter - editors see everything)
  const {
    data: rawDocuments,
    loading,
    error,
    refetch,
  } = useFirestoreCollection({
    collectionName: "generator-documents",
    constraints: user?.uid
      ? {
          orderBy: [{ field: "createdAt", direction: "desc" }],
        }
      : undefined,
    enabled: !!user?.uid,
  })

  // Transform documents for UI display (memoized to prevent infinite loops)
  const documents = useMemo(
    () => transformDocuments(rawDocuments as GeneratorDocument[]),
    [rawDocuments]
  )

  /**
   * Delete a generator document
   */
  const deleteDocument = useCallback(
    async (id: string) => {
      await service.deleteDocument("generator-documents", id)
    },
    [service]
  )

  return {
    documents,
    loading,
    error,
    deleteDocument,
    refetch,
  }
}
