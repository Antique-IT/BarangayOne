import { NextRequest, NextResponse } from "next/server"
import { withErrorHandler } from "@/lib/api-error"
import { requireAdminRead, requireAdminWrite, requireBarangay, requireSessionUser } from "@/lib/auth-guards"
import { createResidentSchema } from "@/lib/validations/resident.schema"
import { residentService } from "@/services/resident.service"

export const GET = withErrorHandler(async (req) => {
  const user = await requireSessionUser()
  requireAdminRead(user)

  const { searchParams } = new URL((req as NextRequest).url)
  const search = searchParams.get("search") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const barangayId = requireBarangay(user)

  const result = await residentService.list({ barangayId, search, page, limit })
  return NextResponse.json(result)
})

export const POST = withErrorHandler(async (req) => {
  const user = await requireSessionUser()
  requireAdminWrite(user)
  const barangayId = requireBarangay(user)

  const body = await (req as NextRequest).json()
  const data = createResidentSchema.parse(body)
  const actorId = user.id

  const resident = await residentService.create(barangayId, data, actorId)
  return NextResponse.json(resident, { status: 201 })
})

