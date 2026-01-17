import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { TOKEN_CONFIG } from 'shared'

interface JwtPayload {
  userId: string
}

export function generateAccessToken(userId: string): string {
  return jwt.sign(
    { userId } satisfies JwtPayload,
    env.JWT_SECRET,
    { expiresIn: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRES_IN }
  )
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET)
    return decoded as JwtPayload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}
