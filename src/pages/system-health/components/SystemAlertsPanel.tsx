import type { SystemAlerts } from "@/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, XCircle, Info, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"

interface SystemAlertsPanelProps {
  alerts: SystemAlerts[]
  onResolveAlert: (alertId: string) => void
}

export function SystemAlertsPanel({ alerts, onResolveAlert }: SystemAlertsPanelProps) {
  const unresolvedAlerts = alerts.filter((alert) => !alert.resolved)
  const resolvedAlerts = alerts.filter((alert) => alert.resolved)

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-gray-400" />
    }
  }

  const getAlertBadgeVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      case "info":
        return "outline"
      default:
        return "outline"
    }
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No Active Alerts</h3>
          <p className="text-sm text-muted-foreground">All systems are operating normally.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Unresolved Alerts */}
      {unresolvedAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Active Alerts ({unresolvedAlerts.length})
          </h3>

          <div className="space-y-3">
            {unresolvedAlerts.map((alert) => (
              <Alert key={alert.id} variant={alert.type === "error" ? "destructive" : "default"}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            getAlertBadgeVariant(alert.type) as
                              | "default"
                              | "secondary"
                              | "destructive"
                              | "outline"
                          }
                        >
                          {alert.type.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {alert.component}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(alert.timestamp, "MMM d, HH:mm")}
                        </span>
                      </div>
                      <AlertDescription className="text-sm">{alert.message}</AlertDescription>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResolveAlert(alert.id)}
                    className="ml-4 flex-shrink-0"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Resolve
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Recently Resolved ({resolvedAlerts.length})
          </h3>

          <div className="space-y-2">
            {resolvedAlerts.slice(0, 5).map((alert) => (
              <Card key={alert.id} className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {alert.component}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(alert.timestamp, "MMM d, HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{alert.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Alert Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alert Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-500">
                {alerts.filter((a) => a.type === "error" && !a.resolved).length}
              </div>
              <div className="text-xs text-muted-foreground">Errors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {alerts.filter((a) => a.type === "warning" && !a.resolved).length}
              </div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {alerts.filter((a) => a.type === "info" && !a.resolved).length}
              </div>
              <div className="text-xs text-muted-foreground">Info</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{resolvedAlerts.length}</div>
              <div className="text-xs text-muted-foreground">Resolved</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
