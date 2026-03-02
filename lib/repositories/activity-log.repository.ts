import { prisma } from "@/lib/prisma"

export const activityLogRepository = {
  async create(data: {
    barangayId?: string | null
    userId?: string | null
    action: string
    description?: string | null
    entityType?: string | null
    entityId?: string | null
    metadata?: string | null
  }) {
    return prisma.activityLog.create({ data })
  },

  async findMany({
    barangayId,
    page = 1,
    limit = 20,
  }: {
    barangayId?: string
    page?: number
    limit?: number
  }) {
    const skip = (page - 1) * limit
    const where = { barangayId: barangayId ?? undefined }
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: { user: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.activityLog.count({ where }),
    ])
    return { logs, total, page, limit }
  },
}
