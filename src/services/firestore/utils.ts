/**
 * Firestore Utilities
 *
 * Common utilities for Firestore operations including timestamp conversion,
 * error handling, and query helpers.
 */

import { Timestamp } from "firebase/firestore"
import { logError } from "@/lib/logger"

/**
 * Convert Firestore Timestamp to Date
 * Handles both Firestore Timestamp objects and Date objects
 */
export function timestampToDate(timestamp: unknown): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate()
  }
  if (timestamp instanceof Date) {
    return timestamp
  }
  if (typeof timestamp === "string") {
    return new Date(timestamp)
  }
  // Fallback to current date if invalid
  return new Date()
}

/**
 * Convert all timestamp fields in a document to Dates
 * Recursively processes nested objects
 */
export function convertTimestamps<T extends Record<string, unknown>>(data: T): T {
  const converted = { ...data }

  for (const key in converted) {
    const value = converted[key]

    // Handle Timestamp objects
    if (value instanceof Timestamp) {
      converted[key] = value.toDate() as T[Extract<keyof T, string>]
    }
    // Recursively handle nested objects
    else if (value && typeof value === "object" && !Array.isArray(value)) {
      converted[key] = convertTimestamps(value as Record<string, unknown>) as T[Extract<
        keyof T,
        string
      >]
    }
    // Handle arrays of objects
    else if (Array.isArray(value)) {
      converted[key] = value.map((item) =>
        item && typeof item === "object" ? convertTimestamps(item as Record<string, unknown>) : item
      ) as T[Extract<keyof T, string>]
    }
  }

  return converted
}

/**
 * Firestore error wrapper with logging
 */
export class FirestoreError extends Error {
  code: string
  operation: string
  collection?: string

  constructor(message: string, operation: string, originalError?: unknown, collection?: string) {
    super(message)
    this.name = "FirestoreError"

    // Extract error code if available
    const errorCode =
      originalError instanceof Error && "code" in originalError
        ? String((originalError as { code?: string }).code)
        : "unknown"
    this.code = errorCode
    this.operation = operation
    this.collection = collection

    // Log the error
    logError(message, originalError, {
      category: "firestore",
      action: operation,
      collection,
    })
  }
}

/**
 * Wrap Firestore operations with error handling
 */
export async function withErrorHandling<T>(
  operation: string,
  fn: () => Promise<T>,
  collection?: string
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    throw new FirestoreError(`Failed to ${operation}`, operation, error, collection)
  }
}

/**
 * Sanitize user input for Firestore queries
 * Prevents injection and invalid characters
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[^\w\s-]/gi, "") // Remove special characters except spaces and hyphens
    .substring(0, 500) // Limit length
}

/**
 * Build a safe Firestore document path
 */
export function buildDocPath(collection: string, ...segments: string[]): string {
  const sanitized = segments.map((s) => sanitizeInput(s))
  return `${collection}/${sanitized.join("/")}`
}

/**
 * Retry a Firestore operation with exponential backoff
 */
export async function retryOperation<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on permission errors or not found errors
      const errorCode =
        error instanceof Error && "code" in error
          ? String((error as { code?: string }).code)
          : undefined

      if (errorCode === "permission-denied" || errorCode === "not-found") {
        throw error
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error("Operation failed after retries")
}

/**
 * Check if a document exists
 */
export function documentExists(data: unknown): boolean {
  return data !== null && data !== undefined
}

/**
 * Ensure array return value
 */
export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

/**
 * Create audit metadata for document writes
 */
export function createAuditMetadata(userId: string, userEmail?: string) {
  return {
    updatedAt: new Date(),
    updatedBy: userEmail || userId,
  }
}

/**
 * Create creation metadata for new documents
 */
export function createCreationMetadata(userId: string, userEmail?: string) {
  return {
    createdAt: new Date(),
    updatedAt: new Date(),
    userId,
    createdBy: userEmail || userId,
  }
}
