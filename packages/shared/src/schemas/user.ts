import { z } from '@hono/zod-openapi'
import { UserStatus } from '../types/index.js'

export const UserSchema = z.object({
  id: z.string().uuid().openapi({ description: '用户唯一标识', example: '550e8400-e29b-41d4-a716-446655440000' }),
  username: z.string().min(3).max(20).openapi({ description: '用户名 (3-20 个字符，仅支持字母、数字、下划线)', example: 'johndoe' }),
  nickname: z.string().nullable().optional().openapi({ description: '用户昵称 (可选)', example: 'John' }),
  email: z.string().email().nullable().openapi({ description: '邮箱地址', example: 'john@example.com' }),
  emailVerified: z.boolean().openapi({ description: '邮箱是否已验证', example: true }),
  phone: z.string().nullable().optional().openapi({ description: '手机号码', example: '+86 138 0000 0000' }),
  phoneVerified: z.boolean().optional().openapi({ description: '手机号码是否已验证', example: false }),
  avatar: z.string().nullable().optional().openapi({ description: '头像 URL', example: 'https://example.com/avatar.png' }),
  status: z.nativeEnum(UserStatus).openapi({ description: '用户状态 (ACTIVE: 正常, INACTIVE: 未激活, BANNED: 已封禁, DELETED: 已删除)', example: UserStatus.ACTIVE }),
  createdAt: z.string().datetime().openapi({ description: '账号创建时间 (UTC)', example: '2024-01-01T00:00:00.000Z' }),
  updatedAt: z.string().datetime().openapi({ description: '账号更新时间 (UTC)', example: '2024-01-01T00:00:00.000Z' }),
}).openapi('User')

export const updateUserSchema = z.object({
  nickname: z.string().min(2, 'validation.nickname.min').max(50, 'validation.nickname.max').optional().openapi({ description: '用户昵称 (2-50 个字符)', example: 'John Doe' }),
  avatar: z.string().url('validation.avatar.invalid').optional().openapi({ description: '头像 URL', example: 'https://example.com/avatar.png' }),
}).openapi('UpdateUserRequest')

export type User = z.infer<typeof UserSchema>
export type UpdateUserRequest = z.infer<typeof updateUserSchema>
