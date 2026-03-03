import { NextRequest, NextResponse } from "next/server"
import { withErrorHandler } from "@/lib/api-error"
import { requireAdminDelete, requireAdminRead, requireAdminWrite, requireBarangay, requireSessionUser } from "@/lib/auth-guards"
import { updateBlotterSchema } from "@/lib/validations/blotter.schema"
import { blotterService } from "@/services/blotter.service"

export const GET = withErrorHandler(async (_req, ctx) => {
  const user = await requireSessionUser()
  requireAdminRead(user)
  const barangayId = requireBarangay(user)
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const blotter = await blotterService.getById(id, barangayId)
  return NextResponse.json(blotter)
})

export const PUT = withErrorHandler(async (req, ctx) => {
  const user = await requireSessionUser()
  requireAdminWrite(user)
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const body = await (req as NextRequest).json()
  const data = updateBlotterSchema.parse(body)
  const actorId = user.id
  const barangayId = requireBarangay(user)
  const blotter = await blotterService.update(id, data, actorId, barangayId)
  return NextResponse.json(blotter)
})

export const DELETE = withErrorHandler(async (_req, ctx) => {
  const user = await requireSessionUser()
  requireAdminDelete(user)
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params
  const actorId = user.id
  const barangayId = requireBarangay(user)
  await blotterService.delete(id, actorId, barangayId)
  return NextResponse.json({ success: true })
})

