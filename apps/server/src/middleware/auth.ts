import type { Context, Next } from 'hono'
import { verifyAccessToken } from '../shared/lib/jwt.js'
import { prisma } from '../shared/db.js'
import type { User } from 'shared'
import { UserStatus } from 'shared'

declare module 'hono' {
  interface ContextVariableMap {
    user: User
    userId: string
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ code: 'auth.unauthorized', message: 'Missing or invalid authorization header' }, 401)
  }

  const token = authHeader.substring(7)

  verifyAccessToken(token)

  const session = await prisma.session.findUnique({
    where: { accessToken: token },
    include: { user: true },
  })

  if (!session || session.revoked) {
    throw new Error('Session revoked')
  }

  if (session.user.status !== UserStatus.ACTIVE) {
    const statusMessages = {
      [UserStatus.BANNED]: 'Account has been banned',
      [UserStatus.INACTIVE]: 'Account not activated',
      [UserStatus.DELETED]: 'Account has been deleted',
    }
    const message = statusMessages[session.user.status] || 'Account is not active'
    return c.json({ code: `auth.account_${session.user.status.toLowerCase()}`, message }, 403)
  }

  c.set('userId', session.userId)
  c.set('user', {
    id: session.user.id,
    username: session.user.username,
    nickname: session.user.nickname,
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    phone: session.user.phone,
    phoneVerified: session.user.phoneVerified,
    avatar: session.user.avatar,
    status: session.user.status as UserStatus,
    createdAt: session.user.createdAt.toISOString(),
    updatedAt: session.user.updatedAt.toISOString(),
  })

  await next()
}
