import { NextRequest, NextResponse } from "next/server"
import { withErrorHandler } from "@/lib/api-error"
import { requireAdminRead, requireAdminWrite, requireBarangay, requireSessionUser } from "@/lib/auth-guards"
import { createHouseholdSchema } from "@/lib/validations/household.schema"
import { householdService } from "@/services/household.service"

export const GET = withErrorHandler(async (req) => {
  const user = await requireSessionUser()
  requireAdminRead(user)

  const { searchParams } = new URL((req as NextRequest).url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const barangayId = requireBarangay(user)

  const result = await householdService.list({ barangayId, page, limit })
  return NextResponse.json(result)
})

export const POST = withErrorHandler(async (req) => {
  const user = await requireSessionUser()
  requireAdminWrite(user)
  const barangayId = requireBarangay(user)

  const body = await (req as NextRequest).json()
  const data = createHouseholdSchema.parse(body)
  const actorId = user.id

  const household = await householdService.create(barangayId, data, actorId)
  return NextResponse.json(household, { status: 201 })
})

