import { NextRequest, NextResponse } from "next/server"
import { withErrorHandler } from "@/lib/api-error"
import { requireAdminRead, requireAdminWrite, requireBarangay, requireSessionUser } from "@/lib/auth-guards"
import { createClearanceSchema } from "@/lib/validations/clearance.schema"
import { clearanceService } from "@/services/clearance.service"

export const GET = withErrorHandler(async (req) => {
  const user = await requireSessionUser()
  requireAdminRead(user)

  const { searchParams } = new URL((req as NextRequest).url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const status = searchParams.get("status") || undefined
  const barangayId = requireBarangay(user)

  const result = await clearanceService.list({ barangayId, status, page, limit })
  return NextResponse.json(result)
})

export const POST = withErrorHandler(async (req) => {
  const user = await requireSessionUser()
  requireAdminWrite(user)
  const barangayId = requireBarangay(user)

  const body = await (req as NextRequest).json()
  const data = createClearanceSchema.parse(body)
  const actorId = user.id

  const clearance = await clearanceService.create(barangayId, data, actorId)
  return NextResponse.json(clearance, { status: 201 })
})

