import type { SystemHealthMetrics } from "@/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Activity,
  Clock,
  Database,
  Zap,
  HardDrive,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Timer,
  TrendingUp
} from "lucide-react"
import { format } from "date-fns"

interface HealthMetricsGridProps {
  metrics: SystemHealthMetrics
}

export function HealthMetricsGrid({ metrics }: HealthMetricsGridProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "unhealthy":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "healthy":
        return "default"
      case "degraded":
        return "secondary" 
      case "unhealthy":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60))
    return `${hours}h`
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${Math.round(ms / 1000)}s`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* API Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            API Service
          </CardTitle>
          {getStatusIcon(metrics.api.status)}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <Badge variant={getStatusBadgeVariant(metrics.api.status) as "default" | "secondary" | "destructive" | "outline"}>
              {metrics.api.status.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">v{metrics.api.version}</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>Response: {Math.round(metrics.api.responseTime)}ms</div>
            <div>Uptime: {formatUptime(metrics.api.uptime)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Job Queue
          </CardTitle>
          {getStatusIcon(metrics.queue.status)}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <Badge variant={getStatusBadgeVariant(metrics.queue.status) as "default" | "secondary" | "destructive" | "outline"}>
              {metrics.queue.status.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">{metrics.queue.totalItems} total</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>Pending: {metrics.queue.pendingItems}</div>
            <div>Processing: {metrics.queue.processingItems}</div>
            <div>Failed: {metrics.queue.failedItems}</div>
            <div>Avg Time: {formatDuration(metrics.queue.avgProcessingTime)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Database Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </CardTitle>
          {getStatusIcon(metrics.database.status)}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <Badge variant={getStatusBadgeVariant(metrics.database.status) as "default" | "secondary" | "destructive" | "outline"}>
              {metrics.database.status.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">{metrics.database.connectionCount} conn</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>Response: {Math.round(metrics.database.responseTime)}ms</div>
            <div>Last Check: {format(metrics.database.lastChecked, "HH:mm")}</div>
          </div>
        </CardContent>
      </Card>

      {/* AI Service Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            AI Service
          </CardTitle>
          {getStatusIcon(metrics.ai.status)}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <Badge variant={getStatusBadgeVariant(metrics.ai.status) as "default" | "secondary" | "destructive" | "outline"}>
              {metrics.ai.status.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {Math.round(metrics.ai.successRate * 100)}% success
            </span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>Requests: {metrics.ai.requestsToday}</div>
            <div>Avg Time: {formatDuration(metrics.ai.avgResponseTime)}</div>
            {metrics.ai.quotaUsage && (
              <div>
                Quota: {metrics.ai.quotaUsage.used}/{metrics.ai.quotaUsage.limit}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Storage Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Storage
          </CardTitle>
          {getStatusIcon(metrics.storage.status)}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <Badge variant={getStatusBadgeVariant(metrics.storage.status) as "default" | "secondary" | "destructive" | "outline"}>
              {metrics.storage.status.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {Math.round(metrics.storage.storageUsed * 100)}% used
            </span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>Documents: {metrics.storage.documentsStored.toLocaleString()}</div>
            {metrics.storage.lastBackup && (
              <div>Backup: {format(metrics.storage.lastBackup, "MMM d")}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>API Response</span>
              <span className={metrics.api.responseTime > 500 ? "text-red-500" : "text-green-500"}>
                {Math.round(metrics.api.responseTime)}ms
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>DB Response</span>
              <span className={metrics.database.responseTime > 100 ? "text-yellow-500" : "text-green-500"}>
                {Math.round(metrics.database.responseTime)}ms
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Queue Processing</span>
              <span className={metrics.queue.avgProcessingTime > 30000 ? "text-red-500" : "text-green-500"}>
                {formatDuration(metrics.queue.avgProcessingTime)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>AI Response</span>
              <span className={metrics.ai.avgResponseTime > 10000 ? "text-yellow-500" : "text-green-500"}>
                {formatDuration(metrics.ai.avgResponseTime)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}