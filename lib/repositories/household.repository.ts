import { prisma } from "@/lib/prisma"
import type {
  CreateHouseholdInput,
  UpdateHouseholdInput,
} from "@/lib/validations/household.schema"

export interface HouseholdListOptions {
  barangayId?: string
  page?: number
  limit?: number
}

export const householdRepository = {
  async findMany({ barangayId, page = 1, limit = 10 }: HouseholdListOptions) {
    const skip = (page - 1) * limit
    const where = { barangayId: barangayId ?? undefined }
    const [households, total] = await Promise.all([
      prisma.household.findMany({
        where,
        include: { members: { include: { resident: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.household.count({ where }),
    ])
    return { households, total, page, limit }
  },

  async findById(id: string) {
    return prisma.household.findUnique({
      where: { id },
      include: { members: { include: { resident: true } } },
    })
  },

  async create(barangayId: string, data: CreateHouseholdInput) {
    const { members, ...householdData } = data
    const household = await prisma.household.create({ data: { ...householdData, barangayId } })
    if (members && members.length > 0) {
      await prisma.householdMember.createMany({
        data: members.map((m) => ({ ...m, householdId: household.id })),
      })
    }
    return prisma.household.findUnique({
      where: { id: household.id },
      include: { members: { include: { resident: true } } },
    })
  },

  async update(id: string, data: UpdateHouseholdInput) {
    const { members, ...householdData } = data
    void members
    return prisma.household.update({ where: { id }, data: householdData })
  },

  async delete(id: string) {
    return prisma.household.delete({ where: { id } })
  },
}
