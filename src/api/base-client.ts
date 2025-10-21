/**
 * Base API Client
 *
 * Provides common HTTP methods with:
 * - Automatic auth token injection
 * - Error handling and retry logic
 * - Request/response logging
 */

import { auth } from "@/config/firebase"
import { logError } from "@/lib/logger"

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
}

export class ApiError extends Error {
  statusCode?: number
  response?: unknown

  constructor(message: string, statusCode?: number, response?: unknown) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.response = response
  }
}

export class BaseApiClient {
  baseUrl: string
  defaultTimeout: number
  defaultRetryAttempts: number
  defaultRetryDelay: number

  constructor(
    baseUrl: string,
    options?: {
      timeout?: number
      retryAttempts?: number
      retryDelay?: number
    }
  ) {
    this.baseUrl = baseUrl
    this.defaultTimeout = options?.timeout || 30000
    this.defaultRetryAttempts = options?.retryAttempts || 3
    this.defaultRetryDelay = options?.retryDelay || 1000
  }

  /**
   * Get current user's auth token
   */
  async getAuthToken(): Promise<string | null> {
    const user = auth.currentUser
    if (!user) {
      return null
    }

    try {
      return await user.getIdToken()
    } catch (error) {
      logError("Failed to get auth token", error, {
        category: 'auth',
        action: 'token_fetch_failed',
        userId: user.uid,
      })
      return null
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = "GET",
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retryAttempts = this.defaultRetryAttempts,
      retryDelay = this.defaultRetryDelay,
    } = options

    // Ensure proper URL construction with exactly one '/' separator
    const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = `${baseUrl}${path}`

    // Get auth token
    const token = await this.getAuthToken()

    // Build headers
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    }

    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`
    }

    // Build request options
    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout),
    }

    if (body && method !== "GET") {
      fetchOptions.body = JSON.stringify(body)
    }

    // Retry logic
    let lastError: Error | null = null
    for (let attempt = 0; attempt < retryAttempts; attempt++) {
      try {
        const response = await fetch(url, fetchOptions)

        // Handle non-2xx responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new ApiError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData
          )
        }

        // Parse response
        const contentType = response.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          return (await response.json()) as T
        }

        // Return empty object for non-JSON responses
        return {} as T
      } catch (error) {
        lastError = error as Error

        // Don't retry on client errors (4xx) or auth errors
        if (
          error instanceof ApiError &&
          error.statusCode &&
          error.statusCode >= 400 &&
          error.statusCode < 500
        ) {
          throw error
        }

        // Wait before retry (exponential backoff)
        if (attempt < retryAttempts - 1) {
          const delay = retryDelay * Math.pow(2, attempt)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    // All retries failed
    throw lastError || new Error("Request failed after all retry attempts")
  }

  /**
   * HTTP GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  /**
   * HTTP POST request
   */
  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body })
  }

  /**
   * HTTP PUT request
   */
  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body })
  }

  /**
   * HTTP DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }

  /**
   * HTTP PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body })
  }
}
