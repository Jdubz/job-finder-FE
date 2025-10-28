/**
 * Job Matches API Client
 *
 * Handles querying job matches from Firestore.
 * Uses Firestore SDK directly for real-time updates.
 */

import { db } from "@/config/firebase"
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
  type Query,
  type Unsubscribe,
  Timestamp,
} from "firebase/firestore"
import type { JobMatch } from "@jsdubzw/job-finder-shared-types"

export interface JobMatchFilters {
  minScore?: number
  maxScore?: number
  companyName?: string
  limit?: number
}

export class JobMatchesClient {
  private collectionName = "job-matches"

  /**
   * Convert Firestore document to JobMatch
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private convertDoc(docData: any): JobMatch {
    return {
      ...docData,
      id: docData.id,
      analyzedAt:
        docData.analyzedAt instanceof Timestamp ? docData.analyzedAt.toDate() : docData.analyzedAt,
      createdAt:
        docData.createdAt instanceof Timestamp ? docData.createdAt.toDate() : docData.createdAt,
    } as JobMatch
  }

  /**
   * Get all job matches
   * Single-owner system - all matches are visible
   */
  async getMatches(filters?: JobMatchFilters): Promise<JobMatch[]> {
    let q: Query = collection(db, this.collectionName)

    // Apply filters
    if (filters?.minScore !== undefined) {
      q = query(q, where("matchScore", ">=", filters.minScore))
    }
    if (filters?.maxScore !== undefined) {
      q = query(q, where("matchScore", "<=", filters.maxScore))
    }
    if (filters?.companyName) {
      q = query(q, where("companyName", "==", filters.companyName))
    }

    // Order by match score (highest first)
    q = query(q, orderBy("matchScore", "desc"))

    // Apply limit
    if (filters?.limit) {
      q = query(q, limit(filters.limit))
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => this.convertDoc({ id: doc.id, ...doc.data() }))
  }

  /**
   * Get a specific job match by ID
   */
  async getMatch(matchId: string): Promise<JobMatch | null> {
    const docRef = doc(db, this.collectionName, matchId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return this.convertDoc({ id: docSnap.id, ...docSnap.data() })
  }

  /**
   * Subscribe to real-time updates for job matches
   * Single-owner system - all matches are visible
   */
  subscribeToMatches(
    callback: (matches: JobMatch[]) => void,
    filters?: JobMatchFilters,
    onError?: (error: Error) => void
  ): Unsubscribe {
    let q: Query = collection(db, this.collectionName)

    // Apply filters
    if (filters?.minScore !== undefined) {
      q = query(q, where("matchScore", ">=", filters.minScore))
    }
    if (filters?.maxScore !== undefined) {
      q = query(q, where("matchScore", "<=", filters.maxScore))
    }
    if (filters?.companyName) {
      q = query(q, where("companyName", "==", filters.companyName))
    }

    // Order by creation time (newest first)
    q = query(q, orderBy("createdAt", "desc"))

    // Apply limit
    if (filters?.limit) {
      q = query(q, limit(filters.limit))
    }

    return onSnapshot(
      q,
      (snapshot) => {
        const matches = snapshot.docs.map((doc) => this.convertDoc({ id: doc.id, ...doc.data() }))
        callback(matches)
      },
      (error) => {
        console.error("Error fetching job matches:", error)
        if (onError) {
          onError(error as Error)
        }
      }
    )
  }

  /**
   * Get match statistics
   * Single-owner system - gets stats for all matches
   */
  async getMatchStats(): Promise<{
    total: number
    highPriority: number
    mediumPriority: number
    lowPriority: number
    averageScore: number
  }> {
    const matches = await this.getMatches()

    const stats = {
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
  }
}

// Export singleton instance
export const jobMatchesClient = new JobMatchesClient()
