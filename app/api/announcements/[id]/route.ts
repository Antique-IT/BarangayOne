import { NextRequest, NextResponse } from "next/server"
import { withErrorHandler } from "@/lib/api-error"
import { requireAdminDelete, requireAdminRead, requireAdminWrite, requireBarangay, requireSessionUser } from "@/lib/auth-guards"
import { updateAnnouncementSchema } from "@/lib/validations/announcement.schema"
import { announcementService } from "@/services/announcement.service"

export const GET = withErrorHandler(async (_req, ctx) => {
  const user = await requireSessionUser()
  requireAdminRead(user)
  const barangayId = requireBarangay(user)
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const announcement = await announcementService.getById(id, barangayId)
  return NextResponse.json(announcement)
})

export const PUT = withErrorHandler(async (req, ctx) => {
  const user = await requireSessionUser()
  requireAdminWrite(user)
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const body = await (req as NextRequest).json()
  const data = updateAnnouncementSchema.parse(body)
  const actorId = user.id
  const barangayId = requireBarangay(user)
  const announcement = await announcementService.update(id, data, actorId, barangayId)
  return NextResponse.json(announcement)
})

export const DELETE = withErrorHandler(async (_req, ctx) => {
  const user = await requireSessionUser()
  requireAdminDelete(user)
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const actorId = user.id
  const barangayId = requireBarangay(user)
  await announcementService.delete(id, actorId, barangayId)
  return NextResponse.json({ success: true })
})

