"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Blotter } from "@/types"
import { Plus, Eye } from "lucide-react"
import { format } from "date-fns"

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  MEDIATION: "bg-yellow-100 text-yellow-700",
  SETTLED: "bg-green-100 text-green-700",
  REFERRED: "bg-purple-100 text-purple-700",
  CLOSED: "bg-gray-100 text-gray-700",
}

const statusLabels: Record<string, string> = {
  OPEN: "Open",
  MEDIATION: "Mediation",
  SETTLED: "Settled",
  REFERRED: "Referred",
  CLOSED: "Closed",
}

export function BlotterTable() {
  const [blotters, setBlotters] = useState<Blotter[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const limit = 10

  const fetchBlotters = useCallback(async () => {
    try {
      const status = statusFilter !== "all" ? `&status=${statusFilter}` : ""
      const res = await fetch(`/api/blotter?page=${page}&limit=${limit}${status}`)
      const data = await res.json()
      setBlotters(data.blotters || [])
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }, [limit, page, statusFilter])

  useEffect(() => { fetchBlotters() }, [fetchBlotters])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={statusFilter} onValueChange={(v) => { setLoading(true); setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="MEDIATION">Mediation</SelectItem>
            <SelectItem value="SETTLED">Settled</SelectItem>
            <SelectItem value="REFERRED">Referred</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Link href="/dashboard/blotter/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />File Case
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Case No.</TableHead>
              <TableHead>Complainant</TableHead>
              <TableHead>Respondent</TableHead>
              <TableHead>Incident</TableHead>
              <TableHead>Date Filed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : blotters.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No blotter cases found</TableCell></TableRow>
            ) : blotters.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-sm">{b.caseNumber}</TableCell>
                <TableCell>{b.complainantName}</TableCell>
                <TableCell>{b.respondentName}</TableCell>
                <TableCell>{b.incident}</TableCell>
                <TableCell>{format(new Date(b.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <Badge className={`${statusColors[b.status]} border-0`}>{statusLabels[b.status] ?? b.status.replaceAll("_", " ")}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/blotter/${b.id}`}>
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
