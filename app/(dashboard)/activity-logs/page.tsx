"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ActivityLog } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { Activity } from "lucide-react"

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 20

  useEffect(() => {
    fetch(`/api/activity-logs?page=${page}&limit=${limit}`)
      .then(r => r.json())
      .then(d => { setLogs(d.logs || []); setTotal(d.total || 0) })
      .finally(() => setLoading(false))
  }, [page])

  const actionColor: Record<string, string> = {
    CREATE_RESIDENT: "text-green-600 bg-green-50",
    CREATE_CLEARANCE: "text-blue-600 bg-blue-50",
    APPROVE_CLEARANCE: "text-indigo-600 bg-indigo-50",
    CREATE_BLOTTER: "text-red-600 bg-red-50",
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-500">Track all actions performed in the system</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No activity logs yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <Card key={log.id}>
              <CardContent className="py-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap ${actionColor[log.action] || "text-gray-600 bg-gray-50"}`}>
                    {log.action.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{log.description}</p>
                    {log.user && <p className="text-xs text-gray-400">by {log.user.name || log.user.email}</p>}
                  </div>
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing {(page-1)*limit+1}-{Math.min(page*limit, total)} of {total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setLoading(true); setPage(p => Math.max(1, p-1)) }} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => { setLoading(true); setPage(p => Math.min(totalPages, p+1)) }} disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}
