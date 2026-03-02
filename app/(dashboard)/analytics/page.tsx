import { AnalyticsCharts } from "@/components/analytics/analytics-charts"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500">Visual insights into barangay data and statistics</p>
      </div>
      <AnalyticsCharts />
    </div>
  )
}
