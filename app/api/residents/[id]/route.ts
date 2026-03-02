import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { withErrorHandler, unauthorized } from "@/lib/api-error"
import { updateResidentSchema } from "@/lib/validations/resident.schema"
import { residentService } from "@/services/resident.service"

export const GET = withErrorHandler(async (_req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const resident = await residentService.getById(id)
  return NextResponse.json(resident)
})

export const PUT = withErrorHandler(async (req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const body = await (req as NextRequest).json()
  const data = updateResidentSchema.parse(body)
  const actorId = (session.user as { id?: string }).id
  const barangayId = (session.user as { barangayId?: string }).barangayId
  const resident = await residentService.update(id, data, actorId, barangayId)
  return NextResponse.json(resident)
})

export const DELETE = withErrorHandler(async (_req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const actorId = (session.user as { id?: string }).id
  const barangayId = (session.user as { barangayId?: string }).barangayId
  await residentService.archive(id, actorId, barangayId)
  return NextResponse.json({ success: true })
})

