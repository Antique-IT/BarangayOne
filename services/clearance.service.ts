import { clearanceRepository } from "@/lib/repositories/clearance.repository"
import { activityLogRepository } from "@/lib/repositories/activity-log.repository"
import { notFound } from "@/lib/api-error"
import type {
  CreateClearanceInput,
  UpdateClearanceInput,
} from "@/lib/validations/clearance.schema"

import { randomBytes } from "crypto"
import {
  buildVerificationQrDataUrl,
  generateVerificationCode,
  signVerificationCode,
} from "@/lib/document-verification"

function generateDocumentNumber(): string {
  const year = new Date().getFullYear()
  const random = randomBytes(3).toString("hex").toUpperCase()
  return `CLR-${year}-${random}`
}

export const clearanceService = {
  async list(opts: {
    barangayId?: string
    status?: string
    page?: number
    limit?: number
  }) {
    return clearanceRepository.findMany(opts)
  },

  async getById(id: string) {
    const clearance = await clearanceRepository.findById(id)
    if (!clearance) throw notFound("Clearance request not found")
    return clearance
  },

  async create(barangayId: string, data: CreateClearanceInput, actorId?: string) {
    const documentNumber = generateDocumentNumber()
    const clearance = await clearanceRepository.create(barangayId, documentNumber, data)
    await activityLogRepository.create({
      barangayId,
      userId: actorId,
      action: "CREATE_CLEARANCE",
      description: `Created clearance request ${clearance.documentNumber}`,
      entityType: "ClearanceRequest",
      entityId: clearance.id,
    })
    return clearance
  },

  async update(
    id: string,
    data: UpdateClearanceInput,
    actorId?: string,
    barangayId?: string,
  ) {
    const current = await clearanceService.getById(id)

    const shouldGenerateVerification =
      data.status === "APPROVED" && !current.verificationCode

    const verificationCode = shouldGenerateVerification
      ? signVerificationCode(generateVerificationCode())
      : undefined

    const qrCode = verificationCode
      ? await buildVerificationQrDataUrl(verificationCode)
      : undefined

    const clearance = await clearanceRepository.update(id, {
      ...data,
      verificationCode,
      qrCode,
    })
    if (data.status) {
      await activityLogRepository.create({
        barangayId,
        userId: actorId,
        action: "UPDATE_CLEARANCE_STATUS",
        description: `Clearance ${clearance.documentNumber} status changed to ${data.status}`,
        entityType: "ClearanceRequest",
        entityId: clearance.id,
      })
    }
    return clearance
  },

  async delete(id: string, actorId?: string, barangayId?: string) {
    const clearance = await clearanceService.getById(id)
    await clearanceRepository.delete(id)
    await activityLogRepository.create({
      barangayId,
      userId: actorId,
      action: "DELETE_CLEARANCE",
      description: `Deleted clearance request ${clearance.documentNumber}`,
    })
  },
}
