import type { ApiError } from '../types/error.js'

export function formatErrorMessage(error: ApiError): string {
  return error.message || 'An unknown error occurred'
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function parseTokenExpiry(token: string): Date | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    
    const decoded = JSON.parse(atob(payload))
    return decoded.exp ? new Date(decoded.exp * 1000) : null
  } catch {
    return null
  }
}

export function isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
  const expiry = parseTokenExpiry(token)
  if (!expiry) return true
  
  const now = new Date()
  const threshold = thresholdMinutes * 60 * 1000
  return expiry.getTime() - now.getTime() < threshold
}
