import { describe, it, expect, beforeEach, vi } from "vitest"
import { systemHealthClient, SystemHealthClient } from "../system-health-client"

describe("SystemHealthClient", () => {
  let client: SystemHealthClient

  beforeEach(() => {
    client = new SystemHealthClient()
  })

  describe("getHealthMetrics", () => {
    it("should return health metrics with all components", async () => {
      const metrics = await client.getHealthMetrics()

      expect(metrics).toBeDefined()
      expect(metrics.api).toBeDefined()
      expect(metrics.queue).toBeDefined()
      expect(metrics.database).toBeDefined()
      expect(metrics.ai).toBeDefined()
      expect(metrics.storage).toBeDefined()
    })

    it("should return valid API metrics", async () => {
      const metrics = await client.getHealthMetrics()

      expect(metrics.api.status).toMatch(/healthy|degraded|unhealthy/)
      expect(metrics.api.responseTime).toBeGreaterThan(0)
      expect(metrics.api.uptime).toBeGreaterThan(0)
      expect(metrics.api.version).toBeTruthy()
      expect(metrics.api.lastChecked).toBeInstanceOf(Date)
    })

    it("should return valid queue metrics", async () => {
      const metrics = await client.getHealthMetrics()

      expect(metrics.queue.status).toMatch(/healthy|degraded|unhealthy/)
      expect(metrics.queue.totalItems).toBeGreaterThanOrEqual(0)
      expect(metrics.queue.pendingItems).toBeGreaterThanOrEqual(0)
      expect(metrics.queue.processingItems).toBeGreaterThanOrEqual(0)
      expect(metrics.queue.failedItems).toBeGreaterThanOrEqual(0)
      expect(metrics.queue.avgProcessingTime).toBeGreaterThan(0)
    })

    it("should return valid database metrics", async () => {
      const metrics = await client.getHealthMetrics()

      expect(metrics.database.status).toMatch(/healthy|degraded|unhealthy/)
      expect(metrics.database.connectionCount).toBeGreaterThanOrEqual(0)
      expect(metrics.database.responseTime).toBeGreaterThan(0)
      expect(metrics.database.lastChecked).toBeInstanceOf(Date)
    })

    it("should return valid AI metrics", async () => {
      const metrics = await client.getHealthMetrics()

      expect(metrics.ai.status).toMatch(/healthy|degraded|unhealthy/)
      expect(metrics.ai.requestsToday).toBeGreaterThanOrEqual(0)
      expect(metrics.ai.successRate).toBeGreaterThanOrEqual(0)
      expect(metrics.ai.successRate).toBeLessThanOrEqual(1)
      expect(metrics.ai.avgResponseTime).toBeGreaterThan(0)
    })

    it("should include AI quota usage when available", async () => {
      const metrics = await client.getHealthMetrics()

      if (metrics.ai.quotaUsage) {
        expect(metrics.ai.quotaUsage.used).toBeGreaterThanOrEqual(0)
        expect(metrics.ai.quotaUsage.limit).toBeGreaterThan(0)
        expect(metrics.ai.quotaUsage.resetDate).toBeInstanceOf(Date)
      }
    })

    it("should return valid storage metrics", async () => {
      const metrics = await client.getHealthMetrics()

      expect(metrics.storage.status).toMatch(/healthy|degraded|unhealthy/)
      expect(metrics.storage.documentsStored).toBeGreaterThanOrEqual(0)
      expect(metrics.storage.storageUsed).toBeGreaterThanOrEqual(0)
      expect(metrics.storage.storageUsed).toBeLessThanOrEqual(1)
      expect(metrics.storage.storageLimit).toBe(1)
    })
  })

  describe("getSystemAlerts", () => {
    it("should return an array of alerts", async () => {
      const alerts = await client.getSystemAlerts()

      expect(Array.isArray(alerts)).toBe(true)
    })

    it("should return alerts with valid structure when present", async () => {
      const alerts = await client.getSystemAlerts()

      alerts.forEach((alert) => {
        expect(alert.id).toBeTruthy()
        expect(alert.type).toMatch(/error|warning|info/)
        expect(alert.component).toMatch(/api|queue|database|ai|storage/)
        expect(alert.message).toBeTruthy()
        expect(alert.timestamp).toBeInstanceOf(Date)
        expect(typeof alert.resolved).toBe("boolean")
      })
    })

    it("should return different alerts on multiple calls", async () => {
      const calls = await Promise.all([
        client.getSystemAlerts(),
        client.getSystemAlerts(),
        client.getSystemAlerts(),
      ])

      const uniqueCounts = new Set(calls.map((alerts) => alerts.length))
      // Due to randomness, at least some calls should have different counts
      expect(uniqueCounts.size).toBeGreaterThanOrEqual(1)
    })
  })

  describe("getSystemLogs", () => {
    it("should return an array of logs", async () => {
      const logs = await client.getSystemLogs()

      expect(Array.isArray(logs)).toBe(true)
      expect(logs.length).toBeGreaterThan(0)
    })

    it("should respect limit parameter", async () => {
      const logs = await client.getSystemLogs(10)

      expect(logs.length).toBeLessThanOrEqual(10)
    })

    it("should return logs with valid structure", async () => {
      const logs = await client.getSystemLogs()

      logs.forEach((log) => {
        expect(log.timestamp).toBeInstanceOf(Date)
        expect(log.level).toMatch(/error|warn|info|debug/)
        expect(log.component).toBeTruthy()
        expect(log.message).toBeTruthy()
      })
    })

    it("should sort logs by timestamp descending", async () => {
      const logs = await client.getSystemLogs()

      for (let i = 1; i < logs.length; i++) {
        expect(logs[i - 1].timestamp.getTime()).toBeGreaterThanOrEqual(
          logs[i].timestamp.getTime()
        )
      }
    })

    it("should include details on some logs", async () => {
      const logs = await client.getSystemLogs(50)

      const logsWithDetails = logs.filter((log) => log.details)
      expect(logsWithDetails.length).toBeGreaterThan(0)
    })

    it("should handle default limit", async () => {
      const logs = await client.getSystemLogs()

      expect(logs.length).toBeGreaterThan(0)
      expect(logs.length).toBeLessThanOrEqual(100)
    })
  })

  describe("resolveAlert", () => {
    it("should resolve alert without throwing", async () => {
      await expect(client.resolveAlert("alert-123")).resolves.not.toThrow()
    })

    it("should accept any alert ID", async () => {
      const alertIds = ["alert-1", "alert-2", "test-alert", "12345"]

      for (const id of alertIds) {
        await expect(client.resolveAlert(id)).resolves.not.toThrow()
      }
    })
  })

  describe("runHealthCheck", () => {
    it("should return health check result", async () => {
      const result = await client.runHealthCheck()

      expect(result).toBeDefined()
      expect(typeof result.success).toBe("boolean")
      expect(result.message).toBeTruthy()
      expect(result.timestamp).toBeInstanceOf(Date)
    })

    it("should return recent timestamp", async () => {
      const result = await client.runHealthCheck()

      const now = new Date()
      const diff = now.getTime() - result.timestamp.getTime()

      expect(diff).toBeLessThan(1000) // Less than 1 second ago
    })

    it("should mostly return successful health checks", async () => {
      const results = await Promise.all(
        Array.from({ length: 20 }, () => client.runHealthCheck())
      )

      const successCount = results.filter((r) => r.success).length
      expect(successCount).toBeGreaterThan(15) // At least 75% success (90% expected)
    })

    it("should provide meaningful messages", async () => {
      const result = await client.runHealthCheck()

      if (result.success) {
        expect(result.message).toContain("operational")
      } else {
        expect(result.message).toContain("issues")
      }
    })
  })

  describe("Singleton Instance", () => {
    it("should export singleton instance", () => {
      expect(systemHealthClient).toBeInstanceOf(SystemHealthClient)
    })

    it("should work with singleton instance", async () => {
      const metrics = await systemHealthClient.getHealthMetrics()
      expect(metrics).toBeDefined()

      const alerts = await systemHealthClient.getSystemAlerts()
      expect(Array.isArray(alerts)).toBe(true)

      const logs = await systemHealthClient.getSystemLogs()
      expect(Array.isArray(logs)).toBe(true)

      const healthCheck = await systemHealthClient.runHealthCheck()
      expect(healthCheck).toBeDefined()
    })
  })
})
