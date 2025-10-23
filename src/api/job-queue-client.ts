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
  /**
   * Submit a job URL for processing
   */
  async submitJob(request: SubmitJobRequest): Promise<SubmitJobResponse> {
    return this.post<SubmitJobResponse>("/submitJob", request)
  }

  /**
   * Submit a scrape request
   */
  async submitScrape(request: SubmitScrapeRequest): Promise<SubmitScrapeResponse> {
    return this.post<SubmitScrapeResponse>("/submitScrape", request)
  }

  /**
   * Submit a company for analysis
   */
  async submitCompany(request: SubmitCompanyRequest): Promise<SubmitCompanyResponse> {
    return this.post<SubmitCompanyResponse>("/submitCompany", request)
  }

  /**
   * Get all queue items
   */
  async getQueueItems(): Promise<QueueItem[]> {
    return this.get<QueueItem[]>("/queue")
  }

  /**
   * Get a specific queue item by ID
   */
  async getQueueItem(id: string): Promise<QueueItem> {
    return this.get<QueueItem>(`/queue/${id}`)
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<QueueStats> {
    return this.get<QueueStats>("/queue/stats")
  }

  /**
   * Retry a failed queue item
   */
  async retryQueueItem(id: string): Promise<{ success: boolean; message: string }> {
    return this.post<{ success: boolean; message: string }>(`/queue/${id}/retry`)
  }

  /**
   * Cancel a pending queue item
   */
  async cancelQueueItem(id: string): Promise<{ success: boolean; message: string }> {
    return this.delete<{ success: boolean; message: string }>(`/queue/${id}`)
  }
}

// Export singleton instance
import { api } from "@/config/api"
export const jobQueueClient = new JobQueueClient(api.functions.manageJobQueue)
