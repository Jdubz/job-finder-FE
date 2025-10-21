/**
 * Job Queue API Client
 *
 * Handles job submission and queue management.
 * Integrates with Firebase Cloud Functions for job queue operations.
 */

import { BaseApiClient } from "./base-client"
import type {
  QueueItem,
  SubmitJobRequest,
  SubmitJobResponse,
  SubmitScrapeRequest,
  SubmitScrapeResponse,
  SubmitCompanyRequest,
  SubmitCompanyResponse,
  QueueStats,
} from "@jsdubzw/job-finder-shared-types"

export class JobQueueClient extends BaseApiClient {
  private readonly baseEndpoint = "/manageJobQueue"

  /**
   * Submit a job URL for processing
   */
  async submitJob(request: SubmitJobRequest): Promise<SubmitJobResponse> {
    return this.post<SubmitJobResponse>(`${this.baseEndpoint}/submit`, request)
  }

  /**
   * Submit a scrape request
   */
  async submitScrape(request: SubmitScrapeRequest): Promise<SubmitScrapeResponse> {
    return this.post<SubmitScrapeResponse>(`${this.baseEndpoint}/submit-scrape`, request)
  }

  /**
   * Submit a company for analysis
   */
  async submitCompany(request: SubmitCompanyRequest): Promise<SubmitCompanyResponse> {
    return this.post<SubmitCompanyResponse>(`${this.baseEndpoint}/submit-company`, request)
  }

  /**
   * Get all queue items
   * Note: Backend does not have a /queue list endpoint yet
   * This method is not currently functional
   */
  async getQueueItems(): Promise<QueueItem[]> {
    // TODO: Backend needs to implement GET /queue endpoint
    throw new Error("getQueueItems not implemented in backend - use Firestore direct access instead")
  }

  /**
   * Get a specific queue item by ID
   */
  async getQueueItem(id: string): Promise<QueueItem> {
    return this.get<QueueItem>(`${this.baseEndpoint}/status/${id}`)
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<QueueStats> {
    return this.get<QueueStats>(`${this.baseEndpoint}/stats`)
  }

  /**
   * Retry a failed queue item
   */
  async retryQueueItem(id: string): Promise<{ success: boolean; message: string }> {
    return this.post<{ success: boolean; message: string }>(`${this.baseEndpoint}/retry/${id}`)
  }

  /**
   * Cancel a pending queue item
   */
  async cancelQueueItem(id: string): Promise<{ success: boolean; message: string }> {
    return this.delete<{ success: boolean; message: string }>(`${this.baseEndpoint}/queue/${id}`)
  }
}

// Export singleton instance
import { api } from "@/config/api"
export const jobQueueClient = new JobQueueClient(api.baseUrl)
