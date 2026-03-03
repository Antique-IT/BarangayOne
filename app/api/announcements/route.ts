import { NextRequest, NextResponse } from "next/server"
import { withErrorHandler } from "@/lib/api-error"
import { requireAdminRead, requireAdminWrite, requireBarangay, requireSessionUser } from "@/lib/auth-guards"
import { createAnnouncementSchema } from "@/lib/validations/announcement.schema"
import { announcementService } from "@/services/announcement.service"

export const GET = withErrorHandler(async (req) => {
  const user = await requireSessionUser()
  requireAdminRead(user)

  const { searchParams } = new URL((req as NextRequest).url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const barangayId = requireBarangay(user)

  const result = await announcementService.list({ barangayId, page, limit })
  return NextResponse.json(result)
})

export const POST = withErrorHandler(async (req) => {
  const user = await requireSessionUser()
  requireAdminWrite(user)
  const barangayId = requireBarangay(user)

  const body = await (req as NextRequest).json()
  const data = createAnnouncementSchema.parse(body)
  const actorId = user.id

  const announcement = await announcementService.create(barangayId, data, actorId)
  return NextResponse.json(announcement, { status: 201 })
})

