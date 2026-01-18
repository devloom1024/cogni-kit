import { z } from '@hono/zod-openapi'
import { UserStatus } from '../types/index.js'

export const UserSchema = z.object({
  id: z.string().openapi({ example: '123' }),
  username: z.string().openapi({ example: 'johndoe' }),
  nickname: z.string().nullable().optional().openapi({ example: 'John' }),
  email: z.string().email().nullable().openapi({ example: 'john@example.com' }),
  emailVerified: z.boolean().optional(),
  phone: z.string().nullable().optional(),
  phoneVerified: z.boolean().optional(),
  avatar: z.string().nullable().optional(),
  status: z.nativeEnum(UserStatus).openapi({ example: UserStatus.ACTIVE }),
  createdAt: z.string().openapi({ example: '2024-01-01T00:00:00.000Z' }),
  updatedAt: z.string().openapi({ example: '2024-01-01T00:00:00.000Z' }),
}).openapi('User')

export const updateUserSchema = z.object({
  nickname: z.string().min(2, 'Nickname must be at least 2 characters').max(50, 'Nickname is too long').optional().openapi({ example: 'John Doe' }),
  avatar: z.string().url('Invalid avatar URL').optional().openapi({ example: 'https://example.com/avatar.png' }),
}).openapi('UpdateUserRequest')

export type UpdateUserRequest = z.infer<typeof updateUserSchema>
