import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { systemHealthClient } from "@/api"
import type { SystemHealthMetrics, SystemAlerts, SystemLogs } from "@/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  RefreshCw, 
  AlertCircle,
  Activity,
  Database,
  Zap,
  HardDrive,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Gauge
} from "lucide-react"
import { format } from "date-fns"
import { HealthMetricsGrid } from "./components/HealthMetricsGrid"
import { SystemAlertsPanel } from "./components/SystemAlertsPanel"
import { SystemLogsPanel } from "./components/SystemLogsPanel"
import { HealthChart } from "./components/HealthChart"

export function SystemHealthPage() {
  const { user, isEditor } = useAuth()
  const [healthMetrics, setHealthMetrics] = useState<SystemHealthMetrics | null>(null)
  const [alerts, setAlerts] = useState<SystemAlerts[]>([])
  const [logs, setLogs] = useState<SystemLogs[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user || !isEditor) {
      setLoading(false)
      return
    }

    loadSystemHealth()
    
    const interval = setInterval(loadSystemHealth, 30000)
    return () => clearInterval(interval)
  }, [user, isEditor])

  const loadSystemHealth = async () => {
    try {
      const [metrics, alertsData, logsData] = await Promise.all([
        systemHealthClient.getHealthMetrics(),
        systemHealthClient.getSystemAlerts(),
        systemHealthClient.getSystemLogs(50)
      ])
      
      setHealthMetrics(metrics)
      setAlerts(alertsData)
      setLogs(logsData)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      console.error("Failed to load system health:", err)
      setError("Failed to load system health data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadSystemHealth()
  }

  const handleRunHealthCheck = async () => {
    try {
      const result = await systemHealthClient.runHealthCheck()
      if (result.success) {
        setError(null)
        await loadSystemHealth()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Health check failed")
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      await systemHealthClient.resolveAlert(alertId)
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ))
    } catch (err) {
      console.error("Failed to resolve alert:", err)
    }
  }

  const getOverallHealthStatus = () => {
    if (!healthMetrics) return "unknown"
    
    const components = [
      healthMetrics.api.status,
      healthMetrics.queue.status,
      healthMetrics.database.status,
      healthMetrics.ai.status,
      healthMetrics.storage.status
    ]
    
    if (components.some(status => status === "unhealthy")) return "unhealthy"
    if (components.some(status => status === "degraded")) return "degraded"
    return "healthy"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "unhealthy":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
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

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground mt-2">
            Please sign in to access system health monitoring
          </p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to be signed in to access system health monitoring.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isEditor) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground mt-2">
            Monitor system health, performance metrics, and alerts
          </p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need editor permissions to access system health monitoring.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const overallStatus = getOverallHealthStatus()
  const unresolvedAlerts = alerts.filter(alert => !alert.resolved)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground mt-2">
            Monitor system health, performance metrics, and alerts
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunHealthCheck}
          >
            <Activity className="h-4 w-4 mr-2" />
            Run Check
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overall Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(overallStatus)}
              <div>
                <CardTitle className="text-lg">Overall System Status</CardTitle>
                <CardDescription>
                  {lastUpdated && `Last updated: ${format(lastUpdated, "MMM d, yyyy 'at' h:mm a")}`}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(overallStatus) as "default" | "secondary" | "destructive" | "outline"}>
                {overallStatus.toUpperCase()}
              </Badge>
              {unresolvedAlerts.length > 0 && (
                <Badge variant="destructive">
                  {unresolvedAlerts.length} Alert{unresolvedAlerts.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Health Metrics */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : healthMetrics && (
        <HealthMetricsGrid metrics={healthMetrics} />
      )}

      {/* Detailed Monitoring */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts ({unresolvedAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Logs
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <SystemAlertsPanel 
              alerts={alerts} 
              onResolveAlert={handleResolveAlert}
            />
          )}
        </TabsContent>

        <TabsContent value="logs">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <SystemLogsPanel logs={logs} />
          )}
        </TabsContent>

        <TabsContent value="performance">
          {loading ? (
            <Skeleton className="h-64" />
          ) : healthMetrics && (
            <HealthChart metrics={healthMetrics} />
          )}
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {healthMetrics && (
              <>
                {/* Database Resources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Database
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Connections</span>
                        <span>{healthMetrics.database.connectionCount}/20</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${(healthMetrics.database.connectionCount / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Response time: {Math.round(healthMetrics.database.responseTime)}ms
                    </div>
                  </CardContent>
                </Card>

                {/* Storage Resources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5" />
                      Storage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage Used</span>
                        <span>{Math.round(healthMetrics.storage.storageUsed * 100)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            healthMetrics.storage.storageUsed > 0.8 
                              ? 'bg-red-500' 
                              : healthMetrics.storage.storageUsed > 0.6 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${healthMetrics.storage.storageUsed * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Documents: {healthMetrics.storage.documentsStored.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Resources */}
                {healthMetrics.ai.quotaUsage && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        AI Quota
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>API Usage</span>
                          <span>{healthMetrics.ai.quotaUsage.used}/{healthMetrics.ai.quotaUsage.limit}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              (healthMetrics.ai.quotaUsage.used / healthMetrics.ai.quotaUsage.limit) > 0.9 
                                ? 'bg-red-500' 
                                : (healthMetrics.ai.quotaUsage.used / healthMetrics.ai.quotaUsage.limit) > 0.7 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-500'
                            }`}
                            style={{ 
                              width: `${(healthMetrics.ai.quotaUsage.used / healthMetrics.ai.quotaUsage.limit) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Resets: {format(healthMetrics.ai.quotaUsage.resetDate, "MMM d, yyyy")}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}