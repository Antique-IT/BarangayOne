import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { withErrorHandler, unauthorized } from "@/lib/api-error"
import { createResidentSchema } from "@/lib/validations/resident.schema"
import { residentService } from "@/services/resident.service"

export const GET = withErrorHandler(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()

  const { searchParams } = new URL((req as NextRequest).url)
  const search = searchParams.get("search") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const barangayId = (session.user as { barangayId?: string }).barangayId

  const result = await residentService.list({ barangayId, search, page, limit })
  return NextResponse.json(result)
})

export const POST = withErrorHandler(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()

  const barangayId = (session.user as { barangayId?: string }).barangayId
  if (!barangayId) throw unauthorized("No barangay assigned")

  const body = await (req as NextRequest).json()
  const data = createResidentSchema.parse(body)
  const actorId = (session.user as { id?: string }).id

  const resident = await residentService.create(barangayId, data, actorId)
  return NextResponse.json(resident, { status: 201 })
})

