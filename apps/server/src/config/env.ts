import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email'),
  
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  /// Financial Data 服务地址
  FINANCIAL_DATA_URL: z.string().url().default('http://localhost:8000'),
})

function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `  - ${issue.path.join('.')}: ${issue.message}`)
      throw new Error(`Environment validation failed:\n${issues.join('\n')}`)
    }
    throw error
  }
}

export const env = validateEnv()
export type Env = z.infer<typeof envSchema>
