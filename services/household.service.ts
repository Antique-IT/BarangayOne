import { householdRepository } from "@/lib/repositories/household.repository"
import { activityLogRepository } from "@/lib/repositories/activity-log.repository"
import { notFound } from "@/lib/api-error"
import type {
  CreateHouseholdInput,
  UpdateHouseholdInput,
} from "@/lib/validations/household.schema"

export const householdService = {
  async list(opts: { barangayId?: string; page?: number; limit?: number }) {
    return householdRepository.findMany(opts)
  },

  async getById(id: string) {
    const household = await householdRepository.findById(id)
    if (!household) throw notFound("Household not found")
    return household
  },

  async create(barangayId: string, data: CreateHouseholdInput, actorId?: string) {
    const household = await householdRepository.create(barangayId, data)
    await activityLogRepository.create({
      barangayId,
      userId: actorId,
      action: "CREATE_HOUSEHOLD",
      description: `Created household at ${data.address}`,
    })
    return household
  },

  async update(
    id: string,
    data: UpdateHouseholdInput,
    actorId?: string,
    barangayId?: string,
  ) {
    await householdService.getById(id)
    const household = await householdRepository.update(id, data)
    await activityLogRepository.create({
      barangayId,
      userId: actorId,
      action: "UPDATE_HOUSEHOLD",
      description: `Updated household ${id}`,
    })
    return household
  },

  async delete(id: string, actorId?: string, barangayId?: string) {
    await householdService.getById(id)
    await householdRepository.delete(id)
    await activityLogRepository.create({
      barangayId,
      userId: actorId,
      action: "DELETE_HOUSEHOLD",
      description: `Deleted household ${id}`,
    })
  },
}
