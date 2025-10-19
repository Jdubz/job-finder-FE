import { useEffect, useState } from "react"
import { db } from "@/config/firebase"
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore"
import type { QueueItem } from "@jsdubzw/job-finder-shared-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface QueueStatusTableProps {
  userId: string
  maxItems?: number
}

export function QueueStatusTable({ userId, maxItems = 10 }: QueueStatusTableProps) {
  const [items, setItems] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Set up real-time listener
    const q = query(
      collection(db, "job-queue"),
      where("submitted_by", "==", userId),
      orderBy("created_at", "desc"),
      limit(maxItems)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const queueItems = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          created_at:
            data.created_at instanceof Timestamp ? data.created_at.toDate() : data.created_at,
          updated_at:
            data.updated_at instanceof Timestamp ? data.updated_at.toDate() : data.updated_at,
          processed_at:
            data.processed_at instanceof Timestamp ? data.processed_at.toDate() : data.processed_at,
          completed_at:
            data.completed_at instanceof Timestamp ? data.completed_at.toDate() : data.completed_at,
        } as QueueItem
      })

      setItems(queueItems)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId, maxItems])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "processing":
        return (
          <Badge variant="default" className="bg-blue-500">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Processing
          </Badge>
        )
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            Success
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "skipped":
        return <Badge variant="outline">Skipped</Badge>
      case "filtered":
        return <Badge variant="outline">Filtered</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (date: Date | string | unknown): string => {
    if (!date) return "N/A"

    const d = date instanceof Date ? date : new Date(date as string)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return d.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No submissions yet. Submit your first job above!
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="hidden md:table-cell">Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{item.company_name}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {item.url}
                  </span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(item.created_at)}
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm">
                {item.result_message || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
