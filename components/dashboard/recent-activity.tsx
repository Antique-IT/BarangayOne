"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ActivityLog } from "@/types"

export function RecentActivity() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/activity-logs?limit=5")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []))
      .finally(() => setLoading(false))
  }, [])

  const actionColor: Record<string, string> = {
    CREATE_RESIDENT: "bg-green-100 text-green-700",
    CREATE_CLEARANCE: "bg-blue-100 text-blue-700",
    APPROVE_CLEARANCE: "bg-indigo-100 text-indigo-700",
    CREATE_BLOTTER: "bg-red-100 text-red-700",
    CREATE_ANNOUNCEMENT: "bg-yellow-100 text-yellow-700",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${actionColor[log.action] || "bg-gray-100 text-gray-700"}`}>
                  {log.action.replace(/_/g, " ")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{log.description}</p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
