"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClearanceRequest } from "@/types"
import { Plus, Eye, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-700",
}

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
}

const typeLabels: Record<string, string> = {
  BARANGAY_CLEARANCE: "Clearance",
  RESIDENCY_CERTIFICATE: "Residency Cert.",
  INDIGENCY_CERTIFICATE: "Indigency",
  BUSINESS_CLEARANCE: "Business Clearance",
  CERTIFICATE_OF_GOOD_MORAL: "Good Moral",
}

export function ClearancesTable() {
  const [clearances, setClearances] = useState<ClearanceRequest[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const limit = 10

  const fetchClearances = useCallback(async () => {
    try {
      const status = statusFilter !== "all" ? `&status=${statusFilter}` : ""
      const res = await fetch(`/api/clearances?page=${page}&limit=${limit}${status}`)
      const data = await res.json()
      setClearances(data.clearances || [])
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }, [limit, page, statusFilter])

  useEffect(() => { fetchClearances() }, [fetchClearances])

  async function updateStatus(id: string, status: string) {
    const body: Record<string, unknown> = { status }
    if (status === "APPROVED") {
      const approvedAt = new Date()
      const expiresAt = new Date(approvedAt)
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)
      body.approvedAt = approvedAt.toISOString()
      body.expiresAt = expiresAt.toISOString()
    }
    await fetch(`/api/clearances/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    fetchClearances()
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={statusFilter} onValueChange={(v) => { setLoading(true); setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Link href="/dashboard/clearances/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />New Request
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Control No.</TableHead>
              <TableHead>Resident</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : clearances.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No clearance requests found</TableCell></TableRow>
            ) : clearances.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-sm">{c.documentNumber}</TableCell>
                <TableCell>{c.resident ? `${c.resident.firstName} ${c.resident.lastName}` : "-"}</TableCell>
                <TableCell>{typeLabels[c.type] || c.type}</TableCell>
                <TableCell className="max-w-32 truncate">{c.purpose || "-"}</TableCell>
                <TableCell>
                  <Badge className={`${statusColors[c.status]} border-0`}>{statusLabels[c.status] ?? c.status.replaceAll("_", " ")}</Badge>
                </TableCell>
                <TableCell>{format(new Date(c.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {c.status === "PENDING" && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => updateStatus(c.id, "APPROVED")} className="text-green-600 hover:text-green-700">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => updateStatus(c.id, "REJECTED")} className="text-red-500 hover:text-red-700">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Link href={`/dashboard/clearances/${c.id}`}>
                      <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                    </Link>
                  </div>
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
