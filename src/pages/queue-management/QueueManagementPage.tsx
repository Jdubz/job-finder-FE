import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { jobQueueClient } from "@/api"
import type { QueueItem, QueueStats } from "@jsdubzw/job-finder-shared-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Search, Filter, RotateCcw, Trash2, AlertCircle, Activity } from "lucide-react"
import { QueueItemCard } from "./components/QueueItemCard"
import { QueueStatsGrid } from "./components/QueueStatsGrid"
import { QueueFilters } from "./components/QueueFilters"

interface QueueFiltersType {
  status?: string
  type?: string
  source?: string
  search?: string
  dateRange?: string
}

export function QueueManagementPage() {
  const { user, isEditor } = useAuth()
  const [queueItems, setQueueItems] = useState<QueueItem[]>([])
  const [filteredItems, setFilteredItems] = useState<QueueItem[]>([])
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Filter state
  const [filters, setFilters] = useState<QueueFiltersType>({})
  const [sortBy, setSortBy] = useState<string>("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Load initial data
  useEffect(() => {
    if (!user || !isEditor) {
      setLoading(false)
      return
    }

    loadQueueData()

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadQueueData, 30000)
    return () => clearInterval(interval)
  }, [user, isEditor])

  // Apply filters when items or filters change
  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueItems, filters, sortBy, sortOrder])

  const loadQueueData = async () => {
    try {
      const [items, stats] = await Promise.all([
        jobQueueClient.getQueueItems(),
        jobQueueClient.getQueueStats(),
      ])

      setQueueItems(items)
      setQueueStats(stats)
      setAlert(null)
    } catch (error) {
      console.error("Failed to load queue data:", error)
      setAlert({
        type: "error",
        message: "Failed to load queue data. Please try again.",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadQueueData()
  }

  const applyFilters = () => {
    let filtered = [...queueItems]

    // Apply filters
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((item) => item.status === filters.status)
    }

    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((item) => item.type === filters.type)
    }

    if (filters.source && filters.source !== "all") {
      filtered = filtered.filter((item) => item.source === filters.source)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.url.toLowerCase().includes(searchLower) ||
          item.company_name.toLowerCase().includes(searchLower) ||
          item.result_message?.toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let aValue: any = a[sortBy as keyof QueueItem]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let bValue: any = b[sortBy as keyof QueueItem]

      // Handle dates
      if (aValue instanceof Date) {
        aValue = aValue.getTime()
      } else if (aValue?.toDate) {
        aValue = aValue.toDate().getTime()
      }

      if (bValue instanceof Date) {
        bValue = bValue.getTime()
      } else if (bValue?.toDate) {
        bValue = bValue.toDate().getTime()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredItems(filtered)
  }

  const handleRetryItem = async (id: string) => {
    try {
      await jobQueueClient.retryQueueItem(id)
      setAlert({
        type: "success",
        message: "Queue item queued for retry",
      })
      await loadQueueData()
    } catch (error) {
      console.error("Failed to retry item:", error)
      setAlert({
        type: "error",
        message: "Failed to retry queue item",
      })
    }
  }

  const handleCancelItem = async (id: string) => {
    try {
      await jobQueueClient.cancelQueueItem(id)
      setAlert({
        type: "success",
        message: "Queue item cancelled",
      })
      await loadQueueData()
    } catch (error) {
      console.error("Failed to cancel item:", error)
      setAlert({
        type: "error",
        message: "Failed to cancel queue item",
      })
    }
  }

  const handleBulkAction = async (action: "retry" | "cancel") => {
    if (selectedItems.size === 0) return

    try {
      const promises = Array.from(selectedItems).map((id) =>
        action === "retry" ? jobQueueClient.retryQueueItem(id) : jobQueueClient.cancelQueueItem(id)
      )

      await Promise.all(promises)
      setAlert({
        type: "success",
        message: `${action === "retry" ? "Retried" : "Cancelled"} ${selectedItems.size} items`,
      })
      setSelectedItems(new Set())
      await loadQueueData()
    } catch {
      setAlert({
        type: "error",
        message: `Failed to ${action} selected items`,
      })
    }
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Queue Management</h1>
          <p className="text-muted-foreground mt-2">Please sign in to access queue management</p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to be signed in to access queue management features.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isEditor) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Queue Management</h1>
          <p className="text-muted-foreground mt-2">Monitor and manage the job processing queue</p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need editor permissions to access queue management.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Queue Management</h1>
          <p className="text-muted-foreground mt-2">Monitor and manage the job processing queue</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {selectedItems.size > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("retry")}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry ({selectedItems.size})
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("cancel")}>
                <Trash2 className="h-4 w-4 mr-2" />
                Cancel ({selectedItems.size})
              </Button>
            </>
          )}
        </div>
      </div>

      {alert && (
        <Alert variant={alert.type === "error" ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Queue Statistics */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        queueStats && <QueueStatsGrid stats={queueStats} />
      )}

      {/* Queue Management Interface */}
      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Queue Items
          </TabsTrigger>
          <TabsTrigger value="filters" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters & Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Status:</label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                  <SelectItem value="filtered">Filtered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Type:</label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="job">Job</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="scrape">Scrape</SelectItem>
                  <SelectItem value="source_discovery">Discovery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search URL, company, or message..."
                value={filters.search || ""}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-64"
              />
            </div>
          </div>

          {/* Queue Items List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Queue Items</h3>
                <p className="text-sm text-muted-foreground">
                  {queueItems.length === 0
                    ? "The queue is empty."
                    : "No items match the current filters."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <QueueItemCard
                  key={item.id}
                  item={item}
                  selected={selectedItems.has(item.id!)}
                  onSelect={(id: string, selected: boolean) => {
                    const newSelected = new Set(selectedItems)
                    if (selected) {
                      newSelected.add(id)
                    } else {
                      newSelected.delete(id)
                    }
                    setSelectedItems(newSelected)
                  }}
                  onRetry={handleRetryItem}
                  onCancel={handleCancelItem}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="filters">
          <QueueFilters
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
