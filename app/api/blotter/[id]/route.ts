import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { withErrorHandler, unauthorized } from "@/lib/api-error"
import { updateBlotterSchema } from "@/lib/validations/blotter.schema"
import { blotterService } from "@/services/blotter.service"

export const GET = withErrorHandler(async (_req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const blotter = await blotterService.getById(id)
  return NextResponse.json(blotter)
})

export const PUT = withErrorHandler(async (req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const body = await (req as NextRequest).json()
  const data = updateBlotterSchema.parse(body)
  const actorId = (session.user as { id?: string }).id
  const barangayId = (session.user as { barangayId?: string }).barangayId
  const blotter = await blotterService.update(id, data, actorId, barangayId)
  return NextResponse.json(blotter)
})

export const DELETE = withErrorHandler(async (_req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session) throw unauthorized()
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const actorId = (session.user as { id?: string }).id
  const barangayId = (session.user as { barangayId?: string }).barangayId
  await blotterService.delete(id, actorId, barangayId)
  return NextResponse.json({ success: true })
})

