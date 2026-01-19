import { z } from '@hono/zod-openapi'
import { UserStatus } from '../types/index.js'

export const UserSchema = z.object({
  id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
  username: z.string().min(3).max(20).openapi({ example: 'johndoe' }),
  nickname: z.string().nullable().optional().openapi({ example: 'John' }),
  email: z.string().email().nullable().openapi({ example: 'john@example.com' }),
  emailVerified: z.boolean(),
  phone: z.string().nullable().optional(),
  phoneVerified: z.boolean().optional(),
  avatar: z.string().nullable().optional(),
  status: z.nativeEnum(UserStatus).openapi({ example: UserStatus.ACTIVE }),
  createdAt: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' }),
  updatedAt: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' }),
}).openapi('User')

export const updateUserSchema = z.object({
  nickname: z.string().min(2, 'Nickname must be at least 2 characters').max(50, 'Nickname is too long').optional().openapi({ example: 'John Doe' }),
  avatar: z.string().url('Invalid avatar URL').optional().openapi({ example: 'https://example.com/avatar.png' }),
}).openapi('UpdateUserRequest')

export type User = z.infer<typeof UserSchema>
export type UpdateUserRequest = z.infer<typeof updateUserSchema>
