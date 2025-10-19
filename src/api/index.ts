/**
 * API Clients Export
 *
 * Central export point for all API clients
 */

export { BaseApiClient, ApiError } from "./base-client"
export { jobQueueClient, JobQueueClient } from "./job-queue-client"
export { jobMatchesClient, JobMatchesClient } from "./job-matches-client"
export { generatorClient, GeneratorClient } from "./generator-client"
export { configClient, ConfigClient } from "./config-client"
export { promptsClient, PromptsClient, DEFAULT_PROMPTS } from "./prompts-client"
export { contentItemsClient, ContentItemsClient } from "./content-items-client"

export type { RequestOptions } from "./base-client"
export type { JobMatchFilters } from "./job-matches-client"
export type { PromptConfig } from "./prompts-client"
export type {
  GenerateDocumentRequest,
  GenerateDocumentResponse,
  DocumentHistoryItem,
  UserDefaults,
} from "./generator-client"
export type {
  ContentItem,
  ContentItemWithChildren,
  ContentItemFilters,
  CreateContentItemData,
  UpdateContentItemData,
  ContentItemType,
  ContentItemVisibility,
} from "@/types/content-items"
