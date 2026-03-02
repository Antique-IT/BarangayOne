"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Resident } from "@/types"

export function BlotterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [residents, setResidents] = useState<Resident[]>([])
  const [complainantId, setComplainantId] = useState("")
  const [respondentId, setRespondentId] = useState("")

  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    fetch("/api/residents?limit=100").then(r => r.json()).then(d => setResidents(d.residents || []))
  }, [])

  async function onSubmit(data: Record<string, string>) {
    setLoading(true)
    try {
      const res = await fetch("/api/blotter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          complainantId: complainantId || null,
          respondentId: respondentId || null,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: "Success", description: "Blotter case filed" })
      router.push("/blotter")
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to file case", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Parties Involved</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Complainant Name *</Label>
              <Input {...register("complainantName", { required: true })} placeholder="Full name" />
              {errors.complainantName && <p className="text-xs text-red-500">Required</p>}
            </div>
            <div className="space-y-2">
              <Label>Complainant (Resident)</Label>
              <Select value={complainantId} onValueChange={setComplainantId}>
                <SelectTrigger><SelectValue placeholder="Link to resident (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {residents.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.firstName} {r.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Respondent Name *</Label>
              <Input {...register("respondentName", { required: true })} placeholder="Full name" />
              {errors.respondentName && <p className="text-xs text-red-500">Required</p>}
            </div>
            <div className="space-y-2">
              <Label>Respondent (Resident)</Label>
              <Select value={respondentId} onValueChange={setRespondentId}>
                <SelectTrigger><SelectValue placeholder="Link to resident (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {residents.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.firstName} {r.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Incident Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Type of Incident *</Label>
              <Input {...register("incident", { required: true })} placeholder="e.g., Physical Assault, Property Dispute" />
              {errors.incident && <p className="text-xs text-red-500">Required</p>}
            </div>
            <div className="space-y-2">
              <Label>Incident Date *</Label>
              <Input type="date" {...register("incidentDate", { required: true })} />
              {errors.incidentDate && <p className="text-xs text-red-500">Required</p>}
            </div>
            <div className="space-y-2">
              <Label>Location *</Label>
              <Input {...register("location", { required: true })} placeholder="Where it happened" />
              {errors.location && <p className="text-xs text-red-500">Required</p>}
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea {...register("description", { required: true })} placeholder="Detailed account of the incident..." rows={4} />
              {errors.description && <p className="text-xs text-red-500">Required</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
          {loading ? "Filing..." : "File Case"}
        </Button>
      </div>
    </form>
  )
}
