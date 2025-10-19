import type { SystemHealthMetrics } from "@/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity, Clock, Zap, Database } from "lucide-react"

interface HealthChartProps {
  metrics: SystemHealthMetrics
}

export function HealthChart({ metrics }: HealthChartProps) {
  // Mock historical data for demonstration
  const generateMockData = () => {
    const data = []
    const now = Date.now()

    for (let i = 23; i >= 0; i--) {
      const timestamp = now - i * 60 * 60 * 1000 // Last 24 hours
      data.push({
        time: new Date(timestamp),
        apiResponse: Math.random() * 300 + 100, // 100-400ms
        dbResponse: Math.random() * 50 + 20, // 20-70ms
        queueItems: Math.floor(Math.random() * 100) + 50,
        aiRequests: Math.floor(Math.random() * 50) + 10,
        errorRate: Math.random() * 0.05, // 0-5%
      })
    }

    return data
  }

  const historicalData = generateMockData()

  const getPerformanceTrend = (current: number, historical: number[]) => {
    const average = historical.reduce((sum, val) => sum + val, 0) / historical.length
    const change = ((current - average) / average) * 100

    return {
      change: Math.abs(change),
      direction: change > 0 ? "up" : "down",
      isGood: change < 0, // For response times, lower is better
    }
  }

  const apiResponseTrend = getPerformanceTrend(
    metrics.api.responseTime,
    historicalData.map((d) => d.apiResponse)
  )

  const dbResponseTrend = getPerformanceTrend(
    metrics.database.responseTime,
    historicalData.map((d) => d.dbResponse)
  )

  return (
    <div className="space-y-6">
      {/* Performance Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              API Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{Math.round(metrics.api.responseTime)}ms</div>
                <div className="flex items-center gap-1 text-xs">
                  {apiResponseTrend.direction === "up" ? (
                    <TrendingUp
                      className={`h-3 w-3 ${apiResponseTrend.isGood ? "text-red-500" : "text-green-500"}`}
                    />
                  ) : (
                    <TrendingDown
                      className={`h-3 w-3 ${apiResponseTrend.isGood ? "text-green-500" : "text-red-500"}`}
                    />
                  )}
                  <span className={apiResponseTrend.isGood ? "text-green-500" : "text-red-500"}>
                    {apiResponseTrend.change.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Badge variant={metrics.api.responseTime > 500 ? "destructive" : "default"}>
                {metrics.api.responseTime > 500 ? "Slow" : "Fast"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(metrics.database.responseTime)}ms
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {dbResponseTrend.direction === "up" ? (
                    <TrendingUp
                      className={`h-3 w-3 ${dbResponseTrend.isGood ? "text-red-500" : "text-green-500"}`}
                    />
                  ) : (
                    <TrendingDown
                      className={`h-3 w-3 ${dbResponseTrend.isGood ? "text-green-500" : "text-red-500"}`}
                    />
                  )}
                  <span className={dbResponseTrend.isGood ? "text-green-500" : "text-red-500"}>
                    {dbResponseTrend.change.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Badge variant={metrics.database.responseTime > 100 ? "secondary" : "default"}>
                {metrics.database.responseTime > 100 ? "Slow" : "Fast"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Queue Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(metrics.queue.avgProcessingTime / 1000)}s
                </div>
                <div className="text-xs text-muted-foreground">
                  {metrics.queue.pendingItems} pending
                </div>
              </div>
              <Badge variant={metrics.queue.avgProcessingTime > 30000 ? "destructive" : "default"}>
                {metrics.queue.avgProcessingTime > 30000 ? "Slow" : "Normal"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(metrics.ai.successRate * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {metrics.ai.requestsToday} requests today
                </div>
              </div>
              <Badge variant={metrics.ai.successRate > 0.95 ? "default" : "secondary"}>
                {metrics.ai.successRate > 0.95 ? "Excellent" : "Good"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple Chart Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* API Response Time Chart */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">API Response Time</span>
                <span className="text-xs text-muted-foreground">
                  Current: {Math.round(metrics.api.responseTime)}ms
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    metrics.api.responseTime > 500
                      ? "bg-red-500"
                      : metrics.api.responseTime > 200
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min((metrics.api.responseTime / 1000) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Database Response Time Chart */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Database Response Time</span>
                <span className="text-xs text-muted-foreground">
                  Current: {Math.round(metrics.database.responseTime)}ms
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    metrics.database.responseTime > 100
                      ? "bg-red-500"
                      : metrics.database.responseTime > 50
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min((metrics.database.responseTime / 200) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Queue Load Chart */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Queue Load</span>
                <span className="text-xs text-muted-foreground">
                  {metrics.queue.pendingItems + metrics.queue.processingItems} active items
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    metrics.queue.pendingItems + metrics.queue.processingItems > 50
                      ? "bg-red-500"
                      : metrics.queue.pendingItems + metrics.queue.processingItems > 20
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(((metrics.queue.pendingItems + metrics.queue.processingItems) / 100) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* AI Success Rate Chart */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">AI Success Rate</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(metrics.ai.successRate * 100)}% success
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    metrics.ai.successRate > 0.95
                      ? "bg-green-500"
                      : metrics.ai.successRate > 0.9
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${metrics.ai.successRate * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Peak Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {Math.round(Math.max(...historicalData.map((d) => d.apiResponse)))}ms
            </div>
            <p className="text-xs text-muted-foreground">Highest in last 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Average Queue Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {Math.round(
                historicalData.reduce((sum, d) => sum + d.queueItems, 0) / historicalData.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">24h average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total AI Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {historicalData.reduce((sum, d) => sum + d.aiRequests, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
