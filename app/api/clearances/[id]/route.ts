import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { withErrorHandler, unauthorized } from "@/lib/api-error"
import { updateClearanceSchema } from "@/lib/validations/clearance.schema"
import { clearanceService } from "@/services/clearance.service"

export const GET = withErrorHandler(async (_req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const clearance = await clearanceService.getById(id)
  return NextResponse.json(clearance)
})

export const PUT = withErrorHandler(async (req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const body = await (req as NextRequest).json()
  const data = updateClearanceSchema.parse(body)
  const actorId = (session.user as { id?: string }).id
  const barangayId = (session.user as { barangayId?: string }).barangayId
  const clearance = await clearanceService.update(id, data, actorId, barangayId)
  return NextResponse.json(clearance)
})

export const DELETE = withErrorHandler(async (_req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const actorId = (session.user as { id?: string }).id
  const barangayId = (session.user as { barangayId?: string }).barangayId
  await clearanceService.delete(id, actorId, barangayId)
  return NextResponse.json({ success: true })
})

