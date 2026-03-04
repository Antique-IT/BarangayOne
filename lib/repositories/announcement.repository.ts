import { prisma } from "@/lib/prisma"
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "@/lib/validations/announcement.schema"

export interface AnnouncementListOptions {
  barangayId?: string
  page?: number
  limit?: number
}

export const announcementRepository = {
  async findMany({ barangayId, page = 1, limit = 10 }: AnnouncementListOptions) {
    const skip = (page - 1) * limit
    const where = { barangayId: barangayId ?? undefined }
    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.announcement.count({ where }),
    ])
    return { announcements, total, page, limit }
  },

  async findById(id: string, barangayId?: string) {
    return prisma.announcement.findFirst({
      where: { id, barangayId: barangayId ?? undefined },
    })
  },

  async create(barangayId: string, data: CreateAnnouncementInput, createdBy?: string) {
    return prisma.announcement.create({
      data: {
        ...data,
        barangayId,
        createdBy: createdBy ?? null,
        publishedAt: data.isPublished ? new Date() : null,
      },
    })
  },

  async update(id: string, data: UpdateAnnouncementInput, existingPublishedAt?: Date | null) {
    return prisma.announcement.update({
      where: { id },
      data: {
        ...data,
        publishedAt: data.isPublished && !existingPublishedAt ? new Date() : existingPublishedAt,
      },
    })
  },

  async delete(id: string) {
    return prisma.announcement.delete({ where: { id } })
  },
}
