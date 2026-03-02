import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { withErrorHandler, unauthorized } from "@/lib/api-error"
import { createBlotterSchema } from "@/lib/validations/blotter.schema"
import { blotterService } from "@/services/blotter.service"

export const GET = withErrorHandler(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()

  const { searchParams } = new URL((req as NextRequest).url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const status = searchParams.get("status") || undefined
  const barangayId = (session.user as { barangayId?: string }).barangayId

  const result = await blotterService.list({ barangayId, status, page, limit })
  return NextResponse.json(result)
})

export const POST = withErrorHandler(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()

  const barangayId = (session.user as { barangayId?: string }).barangayId
  if (!barangayId) throw unauthorized("No barangay assigned")

  const body = await (req as NextRequest).json()
  const data = createBlotterSchema.parse(body)
  const actorId = (session.user as { id?: string }).id

  const blotter = await blotterService.create(barangayId, data, actorId)
  return NextResponse.json(blotter, { status: 201 })
})

