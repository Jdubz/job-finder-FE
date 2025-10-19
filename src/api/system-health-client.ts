import { BaseApiClient } from "./base-client"

export interface SystemHealthMetrics {
  api: {
    status: "healthy" | "degraded" | "unhealthy"
    responseTime: number
    uptime: number
    version: string
    lastChecked: Date
  }
  queue: {
    status: "healthy" | "degraded" | "unhealthy"
    totalItems: number
    pendingItems: number
    processingItems: number
    failedItems: number
    avgProcessingTime: number
    lastProcessed: Date | null
  }
  database: {
    status: "healthy" | "degraded" | "unhealthy"
    connectionCount: number
    responseTime: number
    lastChecked: Date
  }
  ai: {
    status: "healthy" | "degraded" | "unhealthy"
    requestsToday: number
    successRate: number
    avgResponseTime: number
    lastRequest: Date | null
    quotaUsage?: {
      used: number
      limit: number
      resetDate: Date
    }
  }
  storage: {
    status: "healthy" | "degraded" | "unhealthy"
    documentsStored: number
    storageUsed: number
    storageLimit: number
    lastBackup: Date | null
  }
}

export interface SystemAlerts {
  id: string
  type: "error" | "warning" | "info"
  component: "api" | "queue" | "database" | "ai" | "storage"
  message: string
  timestamp: Date
  resolved: boolean
}

export interface SystemLogs {
  timestamp: Date
  level: "error" | "warn" | "info" | "debug"
  component: string
  message: string
  details?: Record<string, unknown>
}

export class SystemHealthClient extends BaseApiClient {
  constructor() {
    super("/system")
  }

  /**
   * Get overall system health metrics
   */
  async getHealthMetrics(): Promise<SystemHealthMetrics> {
    // For now, return mock data since we don't have backend health endpoints
    // In production, this would call: return this.get("/health")

    const now = new Date()

    return {
      api: {
        status: "healthy",
        responseTime: Math.random() * 200 + 50, // 50-250ms
        uptime: Date.now() - (Date.now() % (24 * 60 * 60 * 1000)), // Today's uptime
        version: "1.0.0",
        lastChecked: now,
      },
      queue: {
        status: Math.random() > 0.8 ? "degraded" : "healthy",
        totalItems: Math.floor(Math.random() * 1000) + 100,
        pendingItems: Math.floor(Math.random() * 50) + 5,
        processingItems: Math.floor(Math.random() * 10) + 1,
        failedItems: Math.floor(Math.random() * 20),
        avgProcessingTime: Math.random() * 30000 + 5000, // 5-35 seconds
        lastProcessed: new Date(Date.now() - Math.random() * 60000), // Last minute
      },
      database: {
        status: "healthy",
        connectionCount: Math.floor(Math.random() * 10) + 5,
        responseTime: Math.random() * 50 + 10, // 10-60ms
        lastChecked: now,
      },
      ai: {
        status: Math.random() > 0.9 ? "degraded" : "healthy",
        requestsToday: Math.floor(Math.random() * 500) + 50,
        successRate: 0.92 + Math.random() * 0.07, // 92-99%
        avgResponseTime: Math.random() * 5000 + 2000, // 2-7 seconds
        lastRequest: new Date(Date.now() - Math.random() * 300000), // Last 5 minutes
        quotaUsage: {
          used: Math.floor(Math.random() * 8000) + 1000,
          limit: 10000,
          resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        },
      },
      storage: {
        status: "healthy",
        documentsStored: Math.floor(Math.random() * 5000) + 1000,
        storageUsed: Math.random() * 0.7 + 0.1, // 10-80% usage
        storageLimit: 1, // 100%
        lastBackup: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Last 24 hours
      },
    }
  }

  /**
   * Get system alerts
   */
  async getSystemAlerts(): Promise<SystemAlerts[]> {
    // Mock alerts data
    const alerts: SystemAlerts[] = []

    if (Math.random() > 0.7) {
      alerts.push({
        id: "alert-1",
        type: "warning",
        component: "queue",
        message: "Queue processing is slower than usual",
        timestamp: new Date(Date.now() - Math.random() * 60000),
        resolved: false,
      })
    }

    if (Math.random() > 0.8) {
      alerts.push({
        id: "alert-2",
        type: "info",
        component: "ai",
        message: "AI quota usage is at 80%",
        timestamp: new Date(Date.now() - Math.random() * 300000),
        resolved: false,
      })
    }

    if (Math.random() > 0.9) {
      alerts.push({
        id: "alert-3",
        type: "error",
        component: "database",
        message: "Database connection timeout detected",
        timestamp: new Date(Date.now() - Math.random() * 600000),
        resolved: Math.random() > 0.5,
      })
    }

    return alerts
  }

  /**
   * Get recent system logs
   */
  async getSystemLogs(limit: number = 100): Promise<SystemLogs[]> {
    // Mock logs data
    const logs: SystemLogs[] = []
    const components = ["api", "queue", "database", "ai", "storage"]
    const levels: SystemLogs["level"][] = ["info", "warn", "error", "debug"]
    const messages = [
      "Request processed successfully",
      "Queue item completed",
      "Database query executed",
      "AI request completed",
      "Document generated",
      "Cache miss occurred",
      "Rate limit applied",
      "Authentication successful",
      "Job search initiated",
      "Configuration updated",
    ]

    for (let i = 0; i < Math.min(limit, 50); i++) {
      logs.push({
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        level: levels[Math.floor(Math.random() * levels.length)],
        component: components[Math.floor(Math.random() * components.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        details:
          Math.random() > 0.7
            ? {
                userId: `user-${Math.floor(Math.random() * 100)}`,
                duration: Math.floor(Math.random() * 5000),
                status: Math.random() > 0.8 ? "error" : "success",
              }
            : undefined,
      })
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Resolve a system alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    // In production: return this.patch(`/alerts/${alertId}/resolve`)
    console.log(`Alert ${alertId} resolved`)
  }

  /**
   * Test system connectivity
   */
  async runHealthCheck(): Promise<{
    success: boolean
    message: string
    timestamp: Date
  }> {
    // In production: return this.post("/health-check")

    return {
      success: Math.random() > 0.1, // 90% success rate
      message:
        Math.random() > 0.1 ? "All systems operational" : "Some components are experiencing issues",
      timestamp: new Date(),
    }
  }
}

export const systemHealthClient = new SystemHealthClient()
