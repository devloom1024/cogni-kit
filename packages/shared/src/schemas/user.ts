import { z } from 'zod'

export const updateUserSchema = z.object({
  nickname: z.string().min(2, 'Nickname must be at least 2 characters').max(50, 'Nickname is too long').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
})

export type UpdateUserRequest = z.infer<typeof updateUserSchema>
