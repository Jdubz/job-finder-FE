/**
 * Generator API Client
 *
 * Handles AI resume and cover letter generation.
 * Integrates with Firebase Cloud Functions.
 */

import { BaseApiClient } from "./base-client"

export interface GenerateDocumentRequest {
  type: "resume" | "cover_letter"
  jobMatchId?: string
  jobUrl?: string
  jobTitle?: string
  companyName?: string
  jobDescription?: string
  customization?: {
    targetSummary?: string
    skillsPriority?: string[]
    experienceHighlights?: Array<{
      company: string
      title: string
      pointsToEmphasize: string[]
    }>
    projectsToInclude?: Array<{
      name: string
      whyRelevant: string
      pointsToHighlight: string[]
    }>
  }
  preferences?: {
    provider?: "openai" | "gemini"
    tone?: string
    includeProjects?: boolean
  }
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
    return this.post<GenerateDocumentResponse>("/manageGenerator", request)
  }

  /**
   * Get document generation history
   */
  async getHistory(userId?: string): Promise<DocumentHistoryItem[]> {
    const params = userId ? `?userId=${userId}` : ""
    return this.get<DocumentHistoryItem[]>(`/manageGenerator/generator/history${params}`)
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
