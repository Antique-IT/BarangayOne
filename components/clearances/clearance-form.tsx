"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Resident } from "@/types"

export function ClearanceForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [residents, setResidents] = useState<Resident[]>([])
  const [residentId, setResidentId] = useState("")
  const [type, setType] = useState("")

  const { register, handleSubmit } = useForm()

  useEffect(() => {
    fetch("/api/residents?limit=100").then(r => r.json()).then(d => setResidents(d.residents || []))
  }, [])

  async function onSubmit(data: Record<string, string>) {
    if (!residentId || !type) {
      toast({ title: "Error", description: "Please select a resident and document type", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/clearances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, residentId, type }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: "Success", description: "Clearance request submitted" })
      router.push("/clearances")
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to submit request", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="text-base">Request Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Resident *</Label>
            <Select value={residentId} onValueChange={setResidentId}>
              <SelectTrigger><SelectValue placeholder="Select resident" /></SelectTrigger>
              <SelectContent>
                {residents.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.firstName} {r.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Document Type *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BARANGAY_CLEARANCE">Barangay Clearance</SelectItem>
                <SelectItem value="RESIDENCY_CERTIFICATE">Certificate of Residency</SelectItem>
                <SelectItem value="INDIGENCY_CERTIFICATE">Certificate of Indigency</SelectItem>
                <SelectItem value="BUSINESS_CLEARANCE">Business Clearance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Purpose</Label>
            <Textarea {...register("purpose")} placeholder="Employment, School enrollment, etc." rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea {...register("remarks")} placeholder="Additional notes..." rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
