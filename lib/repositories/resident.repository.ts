import { prisma } from "@/lib/prisma"
import type { CreateResidentInput, UpdateResidentInput } from "@/lib/validations/resident.schema"

export interface ResidentListOptions {
  barangayId?: string
  search?: string
  page?: number
  limit?: number
}

export const residentRepository = {
  async findMany({ barangayId, search = "", page = 1, limit = 10 }: ResidentListOptions) {
    const skip = (page - 1) * limit
    const where = {
      barangayId: barangayId ?? undefined,
      isArchived: false,
      OR: search
        ? [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { middleName: { contains: search, mode: "insensitive" as const } },
            { address: { contains: search, mode: "insensitive" as const } },
          ]
        : undefined,
    }
    const [residents, total] = await Promise.all([
      prisma.resident.findMany({ where, skip, take: limit, orderBy: { lastName: "asc" } }),
      prisma.resident.count({ where }),
    ])
    return { residents, total, page, limit }
  },

  async findById(id: string) {
    return prisma.resident.findUnique({ where: { id } })
  },

  async create(barangayId: string, data: CreateResidentInput) {
    return prisma.resident.create({
      data: { ...data, barangayId, birthDate: new Date(data.birthDate) },
    })
  },

  async update(id: string, data: UpdateResidentInput) {
    return prisma.resident.update({
      where: { id },
      data: { ...data, birthDate: data.birthDate ? new Date(data.birthDate) : undefined },
    })
  },

  async archive(id: string) {
    return prisma.resident.update({ where: { id }, data: { isArchived: true } })
  },
}
