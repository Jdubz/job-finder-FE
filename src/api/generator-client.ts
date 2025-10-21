/**
 * Generator API Client
 *
 * Handles AI resume and cover letter generation.
 * Integrates with Firebase Cloud Functions.
 */

import { BaseApiClient } from "./base-client"
import type {
  GenerationType,
  AIProviderType,
  JobInfo,
} from "@jsdubzw/job-finder-shared-types"

/**
 * Generate Document Request
 * Matches backend validation schema in generator.ts
 */
export interface GenerateDocumentRequest {
  generateType: GenerationType
  provider?: AIProviderType
  job: JobInfo
  preferences?: {
    style?: "modern" | "traditional" | "technical" | "executive"
    emphasize?: string[]
  }
  date?: string
  jobMatchId?: string
}

export interface GenerateDocumentResponse {
  success: boolean
  message: string
  documentUrl?: string
  documentId?: string
  generationId?: string
  error?: string
}

export interface DocumentHistoryItem {
  id: string
  type: "resume" | "cover_letter"
  jobTitle: string
  companyName: string
  documentUrl: string
  createdAt: Date
  jobMatchId?: string
}

export interface UserDefaults {
  name: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
  github?: string
  portfolio?: string
  summary?: string
}

export class GeneratorClient extends BaseApiClient {
  /**
   * Generate a resume or cover letter
   */
  async generateDocument(request: GenerateDocumentRequest): Promise<GenerateDocumentResponse> {
    return this.post<GenerateDocumentResponse>("/manageGenerator/generator/generate", request)
  }

  /**
   * Get document generation history
   */
  async getHistory(userId?: string): Promise<DocumentHistoryItem[]> {
    // Backend route is /generator/requests, not /generator/history
    const params = userId ? `?userId=${userId}` : ""
    const response = await this.get<{
      success: boolean
      data: {
        requests: DocumentHistoryItem[]
        count: number
      }
      requestId?: string
    }>(`/manageGenerator/generator/requests${params}`)

    return response.data?.requests || []
  }

  /**
   * Get user's default settings
   */
  async getUserDefaults(): Promise<UserDefaults> {
    return this.get<UserDefaults>("/manageGenerator/generator/defaults")
  }

  /**
   * Update user's default settings
   */
  async updateUserDefaults(defaults: Partial<UserDefaults>): Promise<{ success: boolean }> {
    return this.put<{ success: boolean }>("/manageGenerator/generator/defaults", defaults)
  }

  /**
   * Delete a document from history
   */
  async deleteDocument(documentId: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/manageGenerator/${documentId}`)
  }
}

// Export singleton instance
import { api } from "@/config/api"
export const generatorClient = new GeneratorClient(api.baseUrl)
