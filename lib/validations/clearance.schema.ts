import { z } from "zod"

export const ClearanceTypeEnum = z.enum([
  "BARANGAY_CLEARANCE",
  "RESIDENCY_CERTIFICATE",
  "INDIGENCY_CERTIFICATE",
  "BUSINESS_CLEARANCE",
  "CERTIFICATE_OF_GOOD_MORAL",
])

export const ClearanceStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"])

export const createClearanceSchema = z.object({
  residentId: z.string().cuid("Invalid resident ID"),
  type: ClearanceTypeEnum,
  purpose: z.string().max(500).optional().nullable(),
  remarks: z.string().max(500).optional().nullable(),
})

export const updateClearanceSchema = z.object({
  status: ClearanceStatusEnum.optional(),
  remarks: z.string().max(500).optional().nullable(),
  approvedAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  verificationCode: z.string().optional().nullable(),
  qrCode: z.string().optional().nullable(),
})

export type CreateClearanceInput = z.infer<typeof createClearanceSchema>
export type UpdateClearanceInput = z.infer<typeof updateClearanceSchema>
