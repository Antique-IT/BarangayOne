"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Users, Home, Shield, FileCheck } from "lucide-react"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("")
  const [loading, setLoading] = useState(false)

  async function generateReport() {
    if (!reportType) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reports?type=${reportType}&format=pdf`)
      if (!res.ok) throw new Error("Failed to generate report")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${reportType.toLowerCase()}-report.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert("Failed to generate report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const reports = [
    { icon: Users, title: "Resident Census Report", desc: "Complete list of all registered residents with demographic data", type: "RESIDENTS" },
    { icon: Home, title: "Household Report", desc: "Household composition and family structure data", type: "HOUSEHOLDS" },
    { icon: FileCheck, title: "Clearance Summary Report", desc: "Statistics and list of processed clearance requests", type: "CLEARANCES" },
    { icon: Shield, title: "Blotter Cases Report", desc: "Summary of filed and resolved blotter cases", type: "BLOTTER" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500">Generate and export barangay reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(report => (
          <Card key={report.type} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setReportType(report.type)}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${reportType === report.type ? "bg-indigo-100" : "bg-gray-100"}`}>
                  <report.icon className={`h-5 w-5 ${reportType === report.type ? "text-indigo-600" : "text-gray-500"}`} />
                </div>
                <div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{report.desc}</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="max-w-md">
        <CardHeader><CardTitle className="text-base">Generate Report</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger><SelectValue placeholder="Select report type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="RESIDENTS">Resident Census</SelectItem>
              <SelectItem value="HOUSEHOLDS">Household Report</SelectItem>
              <SelectItem value="CLEARANCES">Clearance Summary</SelectItem>
              <SelectItem value="BLOTTER">Blotter Cases</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            onClick={generateReport}
            disabled={!reportType || loading}
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? "Generating..." : "Generate Report"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
