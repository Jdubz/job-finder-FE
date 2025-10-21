/**
 * Frontend Structured Logger
 *
 * Browser-based structured logging conforming to StructuredLogEntry schema
 * from @jsdubzw/job-finder-shared-types.
 *
 * Features:
 * - Structured JSON logging in browser console
 * - Session ID tracking for error correlation
 * - Optional Cloud Logging via backend API
 * - Development vs Production modes
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/logger'
 *
 * logger.info({
 *   category: 'client',
 *   action: 'page_view',
 *   message: 'User viewed dashboard',
 *   userId: user.uid,
 *   details: { page: '/dashboard' }
 * })
 *
 * logger.error({
 *   category: 'client',
 *   action: 'failed',
 *   message: 'Failed to load job matches',
 *   error: {
 *     type: 'FetchError',
 *     message: error.message,
 *     stack: error.stack
 *   }
 * })
 * ```
 */

import type { StructuredLogEntry, LogLevel } from "@jsdubzw/job-finder-shared-types"

/**
 * Generate a session ID for correlating logs across page loads
 * Stored in sessionStorage for the duration of the browser session
 */
function getSessionId(): string {
  const SESSION_KEY = "job-finder-session-id"

  let sessionId = sessionStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    sessionStorage.setItem(SESSION_KEY, sessionId)
  }

  return sessionId
}

/**
 * Check if running in development mode
 */
function isDevelopment(): boolean {
  return import.meta.env.DEV || import.meta.env.MODE === "development"
}

/**
 * Get environment from Vite env
 */
function getEnvironment(): "development" | "staging" | "production" {
  const mode = import.meta.env.MODE
  if (mode === "production") return "production"
  if (mode === "staging") return "staging"
  return "development"
}

/**
 * Map LogLevel to console methods
 */
function getConsoleMethod(level: LogLevel): "debug" | "log" | "warn" | "error" {
  const methodMap: Record<LogLevel, "debug" | "log" | "warn" | "error"> = {
    debug: "debug",
    info: "log",
    warning: "warn",
    error: "error",
  }
  return methodMap[level]
}

/**
 * Map LogLevel to severity (for Cloud Logging compatibility)
 */
function getSeverity(level: LogLevel): "DEBUG" | "INFO" | "WARNING" | "ERROR" {
  const severityMap: Record<LogLevel, "DEBUG" | "INFO" | "WARNING" | "ERROR"> = {
    debug: "DEBUG",
    info: "INFO",
    warning: "WARNING",
    error: "ERROR",
  }
  return severityMap[level]
}

/**
 * Send logs to dev-monitor backend for centralized file-based logging
 * In development: Sends to dev-monitor backend (http://localhost:5000/api/logs/frontend)
 * In production: Skipped (logs stay in browser only)
 */
async function sendToBackend(entry: StructuredLogEntry, level: LogLevel): Promise<void> {
  // Only send to backend in development (dev-monitor running locally)
  if (!isDevelopment()) {
    return
  }

  try {
    const DEV_MONITOR_URL = import.meta.env.VITE_DEV_MONITOR_URL || "http://localhost:5000"

    const response = await fetch(`${DEV_MONITOR_URL}/api/logs/frontend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        severity: getSeverity(level),
        timestamp: new Date().toISOString(),
        environment: getEnvironment(),
        service: "frontend",
        ...entry,
      }),
    })

    if (!response.ok) {
      // Only log to console debug in development, don't spam errors
      console.debug("Failed to send log to dev-monitor:", response.statusText)
    }
  } catch (err) {
    // Silently fail - don't break the app if logging fails
    // Dev-monitor might not be running, which is fine
    console.debug("Dev-monitor not available:", err)
  }
}

/**
 * Browser logger interface
 */
export interface BrowserLogger {
  debug(
    entry: Omit<StructuredLogEntry, "category" | "sessionId"> & {
      category?: StructuredLogEntry["category"]
    }
  ): void
  info(
    entry: Omit<StructuredLogEntry, "category" | "sessionId"> & {
      category?: StructuredLogEntry["category"]
    }
  ): void
  warning(
    entry: Omit<StructuredLogEntry, "category" | "sessionId"> & {
      category?: StructuredLogEntry["category"]
    }
  ): void
  error(
    entry: Omit<StructuredLogEntry, "category" | "sessionId"> & {
      category?: StructuredLogEntry["category"]
    }
  ): void
}

/**
 * Create a browser logger instance
 */
function createBrowserLogger(): BrowserLogger {
  const sessionId = getSessionId()
  const environment = getEnvironment()

  /**
   * Write a structured log entry to console
   */
  function writeLog(
    level: LogLevel,
    entry: Omit<StructuredLogEntry, "category" | "sessionId"> & {
      category?: StructuredLogEntry["category"]
    }
  ): void {
    // Default category to 'client' for frontend logs
    const fullEntry: StructuredLogEntry = {
      ...entry,
      category: entry.category || "client",
      sessionId,
    }

    // Create structured log object
    const logObject = {
      severity: getSeverity(level),
      timestamp: new Date().toISOString(),
      environment,
      ...fullEntry,
    }

    // In development: Pretty-print with colors
    // In production: JSON string for easier parsing
    const consoleMethod = getConsoleMethod(level)

    if (isDevelopment()) {
      // Development mode: Pretty formatted output
      const styles = {
        debug: "color: #6B7280",
        info: "color: #3B82F6",
        warning: "color: #F59E0B",
        error: "color: #EF4444; font-weight: bold",
      }

      console[consoleMethod](
        `%c[${logObject.severity}] ${logObject.category}:${logObject.action}`,
        styles[level],
        logObject.message,
        logObject.details || {}
      )

      // Show full object in collapsed group for details
      if (logObject.error || logObject.http || Object.keys(logObject.details || {}).length > 0) {
        console.groupCollapsed("%cDetails", "color: #9CA3AF")
        console.log(logObject)
        console.groupEnd()
      }
    } else {
      // Production mode: JSON string for Cloud Logging ingestion
      console[consoleMethod](JSON.stringify(logObject))
    }

    // Send critical logs to backend (async, fire-and-forget)
    sendToBackend(fullEntry, level).catch(() => {
      // Ignore errors from backend logging
    })
  }

  return {
    debug: (entry) => writeLog("debug", entry),
    info: (entry) => writeLog("info", entry),
    warning: (entry) => writeLog("warning", entry),
    error: (entry) => writeLog("error", entry),
  }
}

/**
 * Default logger instance
 * Use this in most cases for structured logging
 */
export const logger = createBrowserLogger()

/**
 * Helper function to log errors with automatic error object extraction
 */
export function logError(
  message: string,
  error: Error | unknown,
  context?: {
    action?: string
    category?: StructuredLogEntry["category"]
    userId?: string
    requestId?: string
    details?: Record<string, string | number | boolean | null | undefined>
  }
): void {
  const errorObj =
    error instanceof Error
      ? {
          type: error.name,
          message: error.message,
          stack: error.stack,
        }
      : {
          type: "UnknownError",
          message: String(error),
        }

  logger.error({
    category: context?.category || "client",
    action: context?.action || "failed",
    message,
    userId: context?.userId,
    requestId: context?.requestId,
    error: errorObj,
    details: context?.details,
  })
}

/**
 * Helper function to log page views
 */
export function logPageView(
  page: string,
  userId?: string,
  details?: Record<string, string | number | boolean | null | undefined>
): void {
  logger.info({
    category: "client",
    action: "page_view",
    message: `User viewed ${page}`,
    userId,
    details: {
      page,
      ...details,
    },
  })
}

/**
 * Helper function to log user actions
 */
export function logUserAction(
  action: string,
  message: string,
  userId?: string,
  details?: Record<string, string | number | boolean | null | undefined>
): void {
  logger.info({
    category: "client",
    action,
    message,
    userId,
    details,
  })
}
