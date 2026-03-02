"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Household } from "@/types"
import { Plus, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function HouseholdsTable() {
  const [households, setHouseholds] = useState<Household[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 10

  const fetchHouseholds = useCallback(async () => {
    try {
      const res = await fetch(`/api/households?page=${page}&limit=${limit}`)
      const data = await res.json()
      setHouseholds(data.households || [])
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }, [limit, page])

  useEffect(() => { fetchHouseholds() }, [fetchHouseholds])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{total} households registered</p>
        <Link href="/households/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />Add Household
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>House No.</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Purok</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Head of Family</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : households.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No households found</TableCell></TableRow>
            ) : households.map((h) => {
              const head = h.members?.find(m => m.isHead)
              return (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{h.houseNumber || "-"}</TableCell>
                  <TableCell>{h.address}</TableCell>
                  <TableCell>{h.purok || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{h.members?.length || 0} members</Badge>
                  </TableCell>
                  <TableCell>{head?.resident ? `${head.resident.firstName} ${head.resident.lastName}` : "-"}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/households/${h.id}`}>
                      <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
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
