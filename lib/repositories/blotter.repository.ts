import { prisma } from "@/lib/prisma"
import type { CreateBlotterInput, UpdateBlotterInput } from "@/lib/validations/blotter.schema"

export interface BlotterListOptions {
  barangayId?: string
  status?: string
  page?: number
  limit?: number
}

export const blotterRepository = {
  async findMany({ barangayId, status, page = 1, limit = 10 }: BlotterListOptions) {
    const skip = (page - 1) * limit
    const where = {
      barangayId: barangayId ?? undefined,
      ...(status ? { status } : {}),
    }
    const [blotters, total] = await Promise.all([
      prisma.blotter.findMany({
        where,
        include: { complainant: true, respondent: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.blotter.count({ where }),
    ])
    return { blotters, total, page, limit }
  },

  async findById(id: string, barangayId?: string) {
    return prisma.blotter.findFirst({
      where: { id, barangayId: barangayId ?? undefined },
      include: { complainant: true, respondent: true },
    })
  },

  async countByBarangay(barangayId: string) {
    return prisma.blotter.count({ where: { barangayId } })
  },

  /** Atomically assign a case number and create the blotter row in a transaction. */
  async createWithCaseNumber(barangayId: string, data: CreateBlotterInput) {
    return prisma.$transaction(async (tx) => {
      const count = await tx.blotter.count({ where: { barangayId } })
      const year = new Date().getFullYear()
      const caseNumber = `BLT-${year}-${String(count + 1).padStart(4, "0")}`
      
      // Check for existing case with same barangayId + caseNumber (should not happen but safe)
      const existing = await tx.blotter.findUnique({
        where: {
          barangayId_caseNumber: {
            barangayId,
            caseNumber,
          },
        },
      })
      
      if (existing) {
        throw new Error(`Case number ${caseNumber} already exists for this barangay`)
      }
      
      return tx.blotter.create({
        data: {
          ...data,
          barangayId,
          caseNumber,
          incidentDate: new Date(data.incidentDate),
          mediationSchedule: data.mediationSchedule ? new Date(data.mediationSchedule) : null,
        },
        include: { complainant: true, respondent: true },
      })
    })
  },

  async update(id: string, data: UpdateBlotterInput) {
    return prisma.blotter.update({
      where: { id },
      data: {
        ...data,
        mediationSchedule: data.mediationSchedule ? new Date(data.mediationSchedule) : undefined,
        resolvedAt: data.resolvedAt ? new Date(data.resolvedAt) : undefined,
      },
      include: { complainant: true, respondent: true },
    })
  },

  async delete(id: string) {
    return prisma.blotter.delete({ where: { id } })
  },
}
