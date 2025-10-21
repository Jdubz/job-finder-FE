/**
 * Firestore Types
 *
 * Re-exports types from @jsdubzw/job-finder-shared-types for convenient importing.
 * Provides a single source of truth for all Firestore document schemas.
 */

// Content Items
export type {
  ContentItemDocument,
  ContentItemType,
  ContentItemVisibility,
} from "@jsdubzw/job-finder-shared-types"

// Job Matches
export type {
  JobMatchDocument,
  JobMatchStatus,
} from "@jsdubzw/job-finder-shared-types"

// Queue Items
export type {
  QueueItemDocument,
  QueueItemDocumentStatus,
  QueueItemDocumentType,
  QueueDocumentSource,
} from "@jsdubzw/job-finder-shared-types"

// Companies
export type {
  CompanyDocument,
  CompanyTier,
} from "@jsdubzw/job-finder-shared-types"

// Job Sources
export type {
  JobSourceDocument,
} from "@jsdubzw/job-finder-shared-types"

// Firestore common types
export type { TimestampLike } from "@jsdubzw/job-finder-shared-types"

/**
 * Frontend-specific type for content items with client-side metadata
 */
export interface ContentItemWithMeta extends Omit<ContentItemDocument, 'createdAt' | 'updatedAt'> {
  id: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Frontend-specific type for job matches with client-side metadata
 */
export interface JobMatchWithMeta extends Omit<JobMatchDocument, 'createdAt' | 'updatedAt' | 'matchedAt'> {
  id: string
  createdAt: Date
  updatedAt: Date
  matchedAt?: Date
}

/**
 * Frontend-specific type for queue items with client-side metadata
 */
export interface QueueItemWithMeta extends Omit<QueueItemDocument, 'created_at' | 'updated_at' | 'processed_at' | 'completed_at'> {
  id: string
  created_at: Date
  updated_at: Date
  processed_at?: Date
  completed_at?: Date
}

/**
 * Sort options for queries
 */
export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

/**
 * Pagination result wrapper
 */
export interface PaginatedResult<T> {
  items: T[]
  total: number
  hasMore: boolean
  lastVisible?: unknown
}
