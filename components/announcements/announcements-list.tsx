"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Announcement } from "@/types"
import { Plus, Megaphone, Trash2, Eye, EyeOff } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  async function fetchAnnouncements() {
    setLoading(true)
    const res = await fetch("/api/announcements?limit=20")
    const data = await res.json()
    setAnnouncements(data.announcements || [])
    setLoading(false)
  }

  useEffect(() => { fetchAnnouncements() }, [])

  async function handleCreate() {
    if (!title || !content) {
      toast({ title: "Error", description: "Title and content are required", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category, isPublished: false }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: "Success", description: "Announcement created" })
      setOpen(false)
      setTitle(""); setContent(""); setCategory("")
      fetchAnnouncements()
    } catch {
      toast({ title: "Error", description: "Failed to create", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(id: string, current: boolean) {
    await fetch(`/api/announcements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !current }),
    })
    fetchAnnouncements()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return
    await fetch(`/api/announcements/${id}`, { method: "DELETE" })
    fetchAnnouncements()
  }

  const categoryColors: Record<string, string> = {
    MEETING: "bg-blue-100 text-blue-700",
    HEALTH: "bg-green-100 text-green-700",
    EMERGENCY: "bg-red-100 text-red-700",
    EVENT: "bg-purple-100 text-purple-700",
    GENERAL: "bg-gray-100 text-gray-700",
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="MEETING">Meeting</SelectItem>
                    <SelectItem value="HEALTH">Health</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                    <SelectItem value="EVENT">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Content *</Label>
                <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Announcement content..." rows={5} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreate} disabled={saving}>
                  {saving ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Megaphone className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <Card key={a.id} className={a.isPublished ? "border-green-200" : "border-gray-200"}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{a.title}</CardTitle>
                    {a.category && (
                      <Badge className={`${categoryColors[a.category] || "bg-gray-100 text-gray-700"} border-0 text-xs`}>{a.category}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={a.isPublished ? "bg-green-100 text-green-700 border-0" : "bg-gray-100 text-gray-600 border-0"}>
                      {a.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => togglePublish(a.id, a.isPublished)}>
                      {a.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2">{a.content}</p>
                <p className="text-xs text-gray-400 mt-2">{format(new Date(a.createdAt), "MMMM d, yyyy")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
