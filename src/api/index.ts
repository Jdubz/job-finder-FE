/**
 * API Clients Export
 *
 * Central export point for all API clients
 */

export { BaseApiClient, ApiError } from "./base-client"
export { generatorClient, GeneratorClient } from "./generator-client"
export { configClient, ConfigClient } from "./config-client"
export { promptsClient, PromptsClient, DEFAULT_PROMPTS } from "./prompts-client"
export { systemHealthClient, SystemHealthClient } from "./system-health-client"

export type { RequestOptions } from "./base-client"
export type { PromptConfig } from "./prompts-client"
export type {
  GenerateDocumentRequest,
  GenerateDocumentResponse,
  DocumentHistoryItem,
  UserDefaults,
} from "./generator-client"
export type { SystemHealthMetrics, SystemAlerts, SystemLogs } from "./system-health-client"
