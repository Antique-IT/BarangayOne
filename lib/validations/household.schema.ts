import { z } from "zod"

export const createHouseholdSchema = z.object({
  houseNumber: z.string().max(50).optional().nullable(),
  address: z.string().min(1, "Address is required").max(255),
  purok: z.string().max(100).optional().nullable(),
  members: z
    .array(
      z.object({
        residentId: z.string().cuid("Invalid resident ID"),
        relationship: z.string().min(1, "Relationship is required").max(100),
        isHead: z.boolean().optional().default(false),
      }),
    )
    .optional(),
})

export const updateHouseholdSchema = createHouseholdSchema.partial()

export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>
export type UpdateHouseholdInput = z.infer<typeof updateHouseholdSchema>
