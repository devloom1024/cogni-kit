import { randomBytes } from 'crypto'

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateUsername(): string {
  return `user_${randomBytes(4).toString('hex')}`
}

export function generateRefreshToken(): string {
  return randomBytes(32).toString('hex')
}
