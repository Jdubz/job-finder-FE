/**
 * Firestore Services
 *
 * Central export for all Firestore services and types.
 * These services provide direct Firestore access replacing Cloud Functions API.
 */

// Services
export { contentItemsService, ContentItemsService } from "./content-items.service"
export { jobMatchesService, JobMatchesService } from "./job-matches.service"
export { jobQueueService, JobQueueService } from "./job-queue.service"

// Service-specific types
export type {
  ContentItemFilters,
  ContentItemWithChildren,
} from "./content-items.service"

export type {
  JobMatchFilters,
  JobMatchStats,
} from "./job-matches.service"

export type {
  QueueItemFilters,
  CreateQueueItemData,
  UpdateQueueItemData,
} from "./job-queue.service"

// Shared types and utilities
export type {
  ContentItemDocument,
  ContentItemType,
  ContentItemVisibility,
  JobMatchDocument,
  JobMatchStatus,
  QueueItemDocument,
  QueueItemDocumentStatus,
  QueueItemDocumentType,
  QueueDocumentSource,
  CompanyDocument,
  CompanyTier,
  JobSourceDocument,
  TimestampLike,
  ContentItemWithMeta,
  JobMatchWithMeta,
  QueueItemWithMeta,
  SortOptions,
  PaginatedResult,
} from "./types"

export {
  timestampToDate,
  convertTimestamps,
  FirestoreError,
  withErrorHandling,
  sanitizeInput,
  buildDocPath,
  retryOperation,
  documentExists,
  ensureArray,
  createAuditMetadata,
  createCreationMetadata,
} from "./utils"
