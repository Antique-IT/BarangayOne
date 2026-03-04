import { blotterRepository } from "@/lib/repositories/blotter.repository"
import { activityLogRepository } from "@/lib/repositories/activity-log.repository"
import { notFound } from "@/lib/api-error"
import type { CreateBlotterInput, UpdateBlotterInput } from "@/lib/validations/blotter.schema"

export const blotterService = {
  async list(opts: { barangayId?: string; status?: string; page?: number; limit?: number }) {
    return blotterRepository.findMany(opts)
  },

  async getById(id: string, barangayId?: string) {
    const blotter = await blotterRepository.findById(id, barangayId)
    if (!blotter) throw notFound("Blotter case not found")
    return blotter
  },

  async create(barangayId: string, data: CreateBlotterInput, actorId?: string) {
    const blotter = await blotterRepository.createWithCaseNumber(barangayId, data)
    await activityLogRepository.create({
      barangayId,
      userId: actorId,
      action: "CREATE_BLOTTER",
      description: `Filed blotter case ${blotter.caseNumber}`,
    })
    return blotter
  },

  async update(id: string, data: UpdateBlotterInput, actorId?: string, barangayId?: string) {
    await blotterService.getById(id, barangayId)
    const blotter = await blotterRepository.update(id, data)
    await activityLogRepository.create({
      barangayId,
      userId: actorId,
      action: "UPDATE_BLOTTER",
      description: `Updated blotter case ${blotter.caseNumber}`,
    })
    return blotter
  },

  async delete(id: string, actorId?: string, barangayId?: string) {
    const blotter = await blotterService.getById(id, barangayId)
    await blotterRepository.delete(id)
    await activityLogRepository.create({
      barangayId,
      userId: actorId,
      action: "DELETE_BLOTTER",
      description: `Deleted blotter case ${blotter.caseNumber}`,
    })
  },
}
