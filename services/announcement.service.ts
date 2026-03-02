import { announcementRepository } from "@/lib/repositories/announcement.repository"
import { activityLogRepository } from "@/lib/repositories/activity-log.repository"
import { notFound } from "@/lib/api-error"
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "@/lib/validations/announcement.schema"

export const announcementService = {
  async list(opts: { barangayId?: string; page?: number; limit?: number }) {
    return announcementRepository.findMany(opts)
  },

  async getById(id: string) {
    const announcement = await announcementRepository.findById(id)
    if (!announcement) throw notFound("Announcement not found")
    return announcement
  },

  async create(barangayId: string, data: CreateAnnouncementInput, actorId?: string) {
    const announcement = await announcementRepository.create(barangayId, data, actorId)
    await activityLogRepository.create({
      barangayId,
      userId: actorId,
      action: "CREATE_ANNOUNCEMENT",
      description: `Created announcement: ${announcement.title}`,
      entityType: "Announcement",
      entityId: announcement.id,
    })
    return announcement
  },

  async update(
    id: string,
    data: UpdateAnnouncementInput,
    actorId?: string,
    barangayId?: string,
  ) {
    const existing = await announcementService.getById(id)
    const announcement = await announcementRepository.update(id, data, existing.publishedAt)
    await activityLogRepository.create({
      barangayId,
      userId: actorId,
      action: "UPDATE_ANNOUNCEMENT",
      description: `Updated announcement: ${announcement.title}`,
    })
    return announcement
  },

  async delete(id: string, actorId?: string, barangayId?: string) {
    const existing = await announcementService.getById(id)
    await announcementRepository.delete(id)
    await activityLogRepository.create({
      barangayId,
      userId: actorId,
      action: "DELETE_ANNOUNCEMENT",
      description: `Deleted announcement: ${existing.title}`,
    })
  },
}
