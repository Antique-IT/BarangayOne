import { z } from "zod"

export const AnnouncementCategoryEnum = z.enum([
  "GENERAL",
  "MEETING",
  "EVENT",
  "HEALTH",
  "SAFETY",
  "EMERGENCY",
])

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().min(1, "Content is required"),
  category: AnnouncementCategoryEnum.optional().nullable(),
  isPublished: z.boolean().optional().default(false),
})

export const updateAnnouncementSchema = createAnnouncementSchema.partial()

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>
