import { z } from "zod"

export const createResidentSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  middleName: z.string().max(100).optional().nullable(),
  lastName: z.string().min(1, "Last name is required").max(100),
  suffix: z.string().max(20).optional().nullable(),
  birthDate: z.string().min(1, "Birth date is required"),
  gender: z.enum(["MALE", "FEMALE"]),
  civilStatus: z.enum(["SINGLE", "MARRIED", "WIDOWED", "DIVORCED", "SEPARATED"]),
  address: z.string().min(1, "Address is required").max(255),
  purok: z.string().max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  occupation: z.string().max(100).optional().nullable(),
  isVoter: z.boolean().optional().default(false),
  isSeniorCitizen: z.boolean().optional().default(false),
  isPWD: z.boolean().optional().default(false),
  photo: z.string().url("Invalid photo URL").optional().nullable(),
})

export const updateResidentSchema = createResidentSchema.partial()

export type CreateResidentInput = z.infer<typeof createResidentSchema>
export type UpdateResidentInput = z.infer<typeof updateResidentSchema>
