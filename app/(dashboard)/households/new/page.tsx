"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function NewHouseholdPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [houseNumber, setHouseNumber] = useState("")
  const [address, setAddress] = useState("")
  const [purok, setPurok] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!address) {
      toast({ title: "Error", description: "Address is required", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/households", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ houseNumber, address, purok }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: "Success", description: "Household created" })
      router.push("/households")
    } catch {
      toast({ title: "Error", description: "Failed to create household", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add Household</h1>
        <p className="text-gray-500">Register a new household</p>
      </div>
      <form onSubmit={handleSubmit}>
        <Card className="max-w-lg">
          <CardHeader><CardTitle className="text-base">Household Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>House Number</Label>
              <Input value={houseNumber} onChange={e => setHouseNumber(e.target.value)} placeholder="001" />
            </div>
            <div className="space-y-2">
              <Label>Address *</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Rizal St" required />
            </div>
            <div className="space-y-2">
              <Label>Purok</Label>
              <Input value={purok} onChange={e => setPurok(e.target.value)} placeholder="Purok 1" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                {loading ? "Creating..." : "Create Household"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
