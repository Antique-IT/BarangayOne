"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Resident } from "@/types"
import { Search, Plus, Eye, Trash2 } from "lucide-react"

export function ResidentsTable() {
  const [residents, setResidents] = useState<Resident[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const limit = 10

  const fetchResidents = useCallback(async () => {
    try {
      const res = await fetch(`/api/residents?page=${page}&limit=${limit}&search=${search}`)
      const data = await res.json()
      setResidents(data.residents || [])
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }, [limit, page, search])

  useEffect(() => { fetchResidents() }, [fetchResidents])

  async function handleDelete(id: string) {
    if (!confirm("Archive this resident?")) return
    setLoading(true)
    await fetch(`/api/residents/${id}`, { method: "DELETE" })
    fetchResidents()
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search residents..."
            className="pl-9"
            value={search}
            onChange={(e) => { setLoading(true); setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Link href="/residents/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />Add Resident
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Civil Status</TableHead>
              <TableHead>Purok</TableHead>
              <TableHead>Voter</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : residents.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No residents found</TableCell></TableRow>
            ) : residents.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  {r.lastName}, {r.firstName} {r.middleName?.[0]}. {r.suffix || ""}
                  <div className="text-xs text-gray-400">{r.address}</div>
                </TableCell>
                <TableCell>{r.gender}</TableCell>
                <TableCell>{r.civilStatus}</TableCell>
                <TableCell>{r.purok || "-"}</TableCell>
                <TableCell>
                  <Badge variant={r.isVoter ? "default" : "secondary"} className={r.isVoter ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                    {r.isVoter ? "Voter" : "Non-voter"}
                  </Badge>
                </TableCell>
                <TableCell>{r.phone || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/residents/${r.id}`}>
                      <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
