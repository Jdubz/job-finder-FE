/**
 * Job Matches Firestore Service
 *
 * Direct Firestore access for job matches (READ-ONLY from frontend).
 * The job-finder-worker writes to this collection.
 * Provides real-time updates for job matches with filtering and pagination.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
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
import type { JobMatch } from "@jsdubzw/job-finder-shared-types"
import { convertTimestamps, withErrorHandling } from "./utils"

const COLLECTION_NAME = "job-matches"

/**
 * Filter options for querying job matches
 */
export interface JobMatchFilters {
  status?: string[]
  minScore?: number
  maxScore?: number
  companyName?: string
  applicationPriority?: ("High" | "Medium" | "Low")[]
  search?: string
  limit?: number
}

/**
 * Match statistics summary
 */
export interface JobMatchStats {
  total: number
  highPriority: number
  mediumPriority: number
  lowPriority: number
  averageScore: number
}

/**
 * Job Matches Firestore Service (Read-Only)
 */
export class JobMatchesService {
  /**
   * Get all job matches for the current user with optional filtering
   */
  async getMatches(filters?: JobMatchFilters): Promise<JobMatch[]> {
    return withErrorHandling(
      "fetch job matches",
      async () => {
        const userId = this.getCurrentUserId()
        const constraints: QueryConstraint[] = [where("submittedBy", "==", userId)]

        // Apply filters
        if (filters) {
          if (filters.minScore !== undefined) {
            constraints.push(where("matchScore", ">=", filters.minScore))
          }

          if (filters.maxScore !== undefined) {
            constraints.push(where("matchScore", "<=", filters.maxScore))
          }

          if (filters.companyName) {
            constraints.push(where("companyName", "==", filters.companyName))
          }

          if (filters.applicationPriority && filters.applicationPriority.length > 0) {
            constraints.push(where("applicationPriority", "in", filters.applicationPriority))
          }
        }

        // Default ordering by match score (highest first)
        constraints.push(orderBy("matchScore", "desc"))

        // Apply limit
        if (filters?.limit) {
          constraints.push(limitQuery(filters.limit))
        }

        const q = query(collection(db, COLLECTION_NAME), ...constraints)
        const snapshot = await getDocs(q)

        let matches = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...convertTimestamps(doc.data()),
        })) as JobMatch[]

        // Apply client-side search filter if specified
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase()
          matches = matches.filter((match) => {
            const searchableText = [
              match.jobTitle,
              match.companyName,
              match.location,
              match.jobDescription,
              ...match.matchedSkills,
              ...match.missingSkills,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
            return searchableText.includes(searchLower)
          })
        }

        return matches
      },
      COLLECTION_NAME
    )
  }

  /**
   * Get a single job match by ID
   */
  async getMatch(id: string): Promise<JobMatch> {
    return withErrorHandling(
      "fetch job match",
      async () => {
        const docRef = doc(db, COLLECTION_NAME, id)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          throw new Error(`Job match ${id} not found`)
        }

        // Verify ownership
        const data = docSnap.data()
        const userId = this.getCurrentUserId()
        if (data.submittedBy !== userId) {
          throw new Error("Permission denied: not owner of this job match")
        }

        return {
          id: docSnap.id,
          ...convertTimestamps(data),
        } as JobMatch
      },
      COLLECTION_NAME
    )
  }

  /**
   * Get match statistics for the current user
   */
  async getMatchStats(filters?: JobMatchFilters): Promise<JobMatchStats> {
    return withErrorHandling(
      "fetch job match statistics",
      async () => {
        const matches = await this.getMatches(filters)

        const stats: JobMatchStats = {
          total: matches.length,
          highPriority: matches.filter((m) => m.applicationPriority === "High").length,
          mediumPriority: matches.filter((m) => m.applicationPriority === "Medium").length,
          lowPriority: matches.filter((m) => m.applicationPriority === "Low").length,
          averageScore: 0,
        }

        if (matches.length > 0) {
          stats.averageScore = matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length
        }

        return stats
      },
      COLLECTION_NAME
    )
  }

  /**
   * Get top N matches by score
   */
  async getTopMatches(count: number = 10): Promise<JobMatch[]> {
    return this.getMatches({ limit: count })
  }

  /**
   * Get high priority matches
   */
  async getHighPriorityMatches(): Promise<JobMatch[]> {
    return this.getMatches({ applicationPriority: ["High"] })
  }

  /**
   * Get matches by company
   */
  async getMatchesByCompany(companyName: string): Promise<JobMatch[]> {
    return this.getMatches({ companyName })
  }

  /**
   * Subscribe to real-time updates for job matches
   */
  subscribeToMatches(
    filters: JobMatchFilters,
    callback: (matches: JobMatch[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const userId = this.getCurrentUserId()
    const constraints: QueryConstraint[] = [where("submittedBy", "==", userId)]

    // Apply filters
    if (filters.minScore !== undefined) {
      constraints.push(where("matchScore", ">=", filters.minScore))
    }

    if (filters.maxScore !== undefined) {
      constraints.push(where("matchScore", "<=", filters.maxScore))
    }

    if (filters.companyName) {
      constraints.push(where("companyName", "==", filters.companyName))
    }

    if (filters.applicationPriority && filters.applicationPriority.length > 0) {
      constraints.push(where("applicationPriority", "in", filters.applicationPriority))
    }

    // Order by creation time (newest first) for subscriptions
    constraints.push(orderBy("createdAt", "desc"))

    // Apply limit
    if (filters.limit) {
      constraints.push(limitQuery(filters.limit))
    }

    const q = query(collection(db, COLLECTION_NAME), ...constraints)

    return onSnapshot(
      q,
      (snapshot) => {
        let matches = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...convertTimestamps(doc.data()),
        })) as JobMatch[]

        // Apply client-side search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          matches = matches.filter((match) => {
            const searchableText = [
              match.jobTitle,
              match.companyName,
              match.location,
              match.jobDescription,
              ...match.matchedSkills,
              ...match.missingSkills,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
            return searchableText.includes(searchLower)
          })
        }

        callback(matches)
      },
      (error) => {
        console.error("Error subscribing to job matches:", error)
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
export const jobMatchesService = new JobMatchesService()
