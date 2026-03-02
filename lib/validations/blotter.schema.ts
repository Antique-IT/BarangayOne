import { z } from "zod"

export const BlotterStatusEnum = z.enum([
  "OPEN",
  "MEDIATION",
  "SETTLED",
  "REFERRED",
  "CLOSED",
])

export const createBlotterSchema = z.object({
  complainantId: z.string().cuid("Invalid complainant ID").optional().nullable(),
  respondentId: z.string().cuid("Invalid respondent ID").optional().nullable(),
  complainantName: z.string().min(1, "Complainant name is required").max(200),
  respondentName: z.string().min(1, "Respondent name is required").max(200),
  incident: z.string().min(1, "Incident type is required").max(200),
  incidentDate: z.string().min(1, "Incident date is required"),
  location: z.string().min(1, "Location is required").max(255),
  description: z.string().min(1, "Description is required"),
  mediationSchedule: z.string().optional().nullable(),
})

export const updateBlotterSchema = z.object({
  status: BlotterStatusEnum.optional(),
  resolutionNotes: z.string().optional().nullable(),
  resolution: z.string().optional().nullable(),
  mediationSchedule: z.string().optional().nullable(),
  resolvedAt: z.string().optional().nullable(),
  complainantName: z.string().max(200).optional(),
  respondentName: z.string().max(200).optional(),
})

export type CreateBlotterInput = z.infer<typeof createBlotterSchema>
export type UpdateBlotterInput = z.infer<typeof updateBlotterSchema>
