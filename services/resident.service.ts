import { residentRepository } from "@/lib/repositories/resident.repository"
import { activityLogRepository } from "@/lib/repositories/activity-log.repository"
import { notFound } from "@/lib/api-error"
import type { CreateResidentInput, UpdateResidentInput } from "@/lib/validations/resident.schema"

export const residentService = {
  async list(opts: { barangayId?: string; search?: string; page?: number; limit?: number }) {
    return residentRepository.findMany(opts)
  },

  async getById(id: string, barangayId?: string) {
    const resident = await residentRepository.findById(id, barangayId)
    if (!resident) throw notFound("Resident not found")
    return resident
  },

  async create(
    barangayId: string,
    data: CreateResidentInput,
    actorId?: string,
  ) {
    const resident = await residentRepository.create(barangayId, data)
    await activityLogRepository.create({
      barangayId,
      userId: actorId,
      action: "CREATE_RESIDENT",
      description: `Created resident: ${resident.firstName} ${resident.lastName}`,
    })
    return resident
  },

  async update(id: string, data: UpdateResidentInput, actorId?: string, barangayId?: string) {
    await residentService.getById(id, barangayId) // throws 404 if missing
    const resident = await residentRepository.update(id, data)
    await activityLogRepository.create({
      barangayId,
      userId: actorId,
      action: "UPDATE_RESIDENT",
      description: `Updated resident: ${resident.firstName} ${resident.lastName}`,
    })
    return resident
  },

  async archive(id: string, actorId?: string, barangayId?: string) {
    const existing = await residentService.getById(id, barangayId)
    await residentRepository.archive(id)
    await activityLogRepository.create({
      barangayId,
      userId: actorId,
      action: "ARCHIVE_RESIDENT",
      description: `Archived resident: ${existing.firstName} ${existing.lastName}`,
    })
  },
}
