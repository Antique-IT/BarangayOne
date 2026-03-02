import { prisma } from "@/lib/prisma"
import type {
  CreateClearanceInput,
  UpdateClearanceInput,
} from "@/lib/validations/clearance.schema"

export interface ClearanceListOptions {
  barangayId?: string
  status?: string
  page?: number
  limit?: number
}

export const clearanceRepository = {
  async findMany({ barangayId, status, page = 1, limit = 10 }: ClearanceListOptions) {
    const skip = (page - 1) * limit
    const where = {
      barangayId: barangayId ?? undefined,
      ...(status ? { status } : {}),
    }
    const [clearances, total] = await Promise.all([
      prisma.clearanceRequest.findMany({
        where,
        include: { resident: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.clearanceRequest.count({ where }),
    ])
    return { clearances, total, page, limit }
  },

  async findById(id: string) {
    return prisma.clearanceRequest.findUnique({ where: { id }, include: { resident: true } })
  },

  async create(barangayId: string, documentNumber: string, data: CreateClearanceInput) {
    return prisma.clearanceRequest.create({
      data: { ...data, barangayId, documentNumber },
      include: { resident: true },
    })
  },

  async update(id: string, data: UpdateClearanceInput) {
    return prisma.clearanceRequest.update({
      where: { id },
      data: {
        ...data,
        verificationCode: data.verificationCode,
        approvedAt: data.approvedAt ? new Date(data.approvedAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
      include: { resident: true },
    })
  },

  async delete(id: string) {
    return prisma.clearanceRequest.delete({ where: { id } })
  },
}
