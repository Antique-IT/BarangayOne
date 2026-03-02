import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { withErrorHandler, unauthorized } from "@/lib/api-error"
import { updateAnnouncementSchema } from "@/lib/validations/announcement.schema"
import { announcementService } from "@/services/announcement.service"

export const GET = withErrorHandler(async (_req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const announcement = await announcementService.getById(id)
  return NextResponse.json(announcement)
})

export const PUT = withErrorHandler(async (req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const body = await (req as NextRequest).json()
  const data = updateAnnouncementSchema.parse(body)
  const actorId = (session.user as { id?: string }).id
  const barangayId = (session.user as { barangayId?: string }).barangayId
  const announcement = await announcementService.update(id, data, actorId, barangayId)
  return NextResponse.json(announcement)
})

export const DELETE = withErrorHandler(async (_req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const actorId = (session.user as { id?: string }).id
  const barangayId = (session.user as { barangayId?: string }).barangayId
  await announcementService.delete(id, actorId, barangayId)
  return NextResponse.json({ success: true })
})

