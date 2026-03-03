import { NextRequest, NextResponse } from "next/server"
import { withErrorHandler } from "@/lib/api-error"
import { requireAdminRead, requireAdminWrite, requireBarangay, requireSessionUser } from "@/lib/auth-guards"
import { createBlotterSchema } from "@/lib/validations/blotter.schema"
import { blotterService } from "@/services/blotter.service"

export const GET = withErrorHandler(async (req) => {
  const user = await requireSessionUser()
  requireAdminRead(user)

  const { searchParams } = new URL((req as NextRequest).url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const status = searchParams.get("status") || undefined
  const barangayId = requireBarangay(user)

  const result = await blotterService.list({ barangayId, status, page, limit })
  return NextResponse.json(result)
})

export const POST = withErrorHandler(async (req) => {
  const user = await requireSessionUser()
  requireAdminWrite(user)
  const barangayId = requireBarangay(user)

  const body = await (req as NextRequest).json()
  const data = createBlotterSchema.parse(body)
  const actorId = user.id

  const blotter = await blotterService.create(barangayId, data, actorId)
  return NextResponse.json(blotter, { status: 201 })
})

