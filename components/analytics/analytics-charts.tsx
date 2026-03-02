"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"

interface AnalyticsData {
  stats: {
    totalResidents: number
    totalHouseholds: number
    totalClearances: number
    pendingClearances: number
    activeBlotters: number
    resolvedBlotters: number
    voterCount: number
  }
  genderDistribution: { name: string; value: number }[]
  monthlyClearances: { month: string; count: number }[]
  blotterStatus: { name: string; value: number }[]
}

const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"]

export function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />)}
      </div>
    )
  }

  if (!data) return <p className="text-gray-500">Failed to load analytics</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Clearance Requests</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.monthlyClearances}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Gender Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.genderDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {data.genderDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Blotter Cases by Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.blotterStatus} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""}>
                  {data.blotterStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Quick Stats</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total Residents", value: data.stats.totalResidents },
                { label: "Households", value: data.stats.totalHouseholds },
                { label: "Active Clearance Requests", value: data.stats.pendingClearances },
                { label: "Active Blotters", value: data.stats.activeBlotters },
                { label: "Resolved Blotters", value: data.stats.resolvedBlotters },
                { label: "Registered Voters", value: data.stats.voterCount },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-indigo-600">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
