import type { SystemLogs } from "@/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { 
  AlertCircle,
  Info,
  AlertTriangle,
  XCircle,
  Search,
  Filter
} from "lucide-react"
import { format } from "date-fns"

interface SystemLogsPanelProps {
  logs: SystemLogs[]
}

export function SystemLogsPanel({ logs }: SystemLogsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [componentFilter, setComponentFilter] = useState<string>("all")

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-3 w-3 text-red-500" />
      case "warn":
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />
      case "info":
        return <Info className="h-3 w-3 text-blue-500" />
      case "debug":
        return <AlertCircle className="h-3 w-3 text-gray-400" />
      default:
        return <AlertCircle className="h-3 w-3 text-gray-400" />
    }
  }

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "error":
        return "destructive"
      case "warn":
        return "secondary"
      case "info":
        return "outline"
      case "debug":
        return "outline"
      default:
        return "outline"
    }
  }

  // Filter logs based on search and filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.component.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLevel = levelFilter === "all" || log.level === levelFilter
    const matchesComponent = componentFilter === "all" || log.component === componentFilter
    
    return matchesSearch && matchesLevel && matchesComponent
  })

  // Get unique components for filter dropdown
  const uniqueComponents = Array.from(new Set(logs.map(log => log.component)))

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No Logs Available</h3>
          <p className="text-sm text-muted-foreground">
            System logs will appear here when available.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Log Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Log Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={componentFilter} onValueChange={setComponentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Component" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Components</SelectItem>
                {uniqueComponents.map(component => (
                  <SelectItem key={component} value={component}>
                    {component}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} logs
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">System Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No logs match the current filters.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredLogs.map((log, index) => (
                <div
                  key={`${log.timestamp.getTime()}-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                    {getLevelIcon(log.level)}
                    <span className="text-xs text-muted-foreground font-mono">
                      {format(log.timestamp, "HH:mm:ss")}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getLevelBadgeVariant(log.level) as "default" | "secondary" | "destructive" | "outline"} className="text-xs">
                        {log.level.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {log.component}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-foreground">
                      {log.message}
                    </p>
                    
                    {log.details && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs font-mono text-muted-foreground">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-red-500">
                {logs.filter(log => log.level === "error").length}
              </div>
              <div className="text-xs text-muted-foreground">Errors</div>
            </div>
            <div>
              <div className="text-xl font-bold text-yellow-500">
                {logs.filter(log => log.level === "warn").length}
              </div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-500">
                {logs.filter(log => log.level === "info").length}
              </div>
              <div className="text-xs text-muted-foreground">Info</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-500">
                {logs.filter(log => log.level === "debug").length}
              </div>
              <div className="text-xs text-muted-foreground">Debug</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}