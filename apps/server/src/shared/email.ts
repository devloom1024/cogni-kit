import { Resend } from 'resend'
import { env } from '../config/env.js'
import { logger } from './logger.js'

const resend = new Resend(env.RESEND_API_KEY)

export async function sendVerificationCode(email: string, code: string): Promise<void> {
  try {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'CogniKit 验证码',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>验证码</h2>
          <p>您的验证码是：</p>
          <div style="background: #f5f5f5; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center;">
            ${code}
          </div>
          <p style="color: #666; margin-top: 20px;">此验证码将在 10 分钟后过期。</p>
          <p style="color: #999; font-size: 12px;">如果您没有请求此验证码，请忽略此邮件。</p>
        </div>
      `,
    })
    
    logger.info({ email }, 'Verification code email sent')
  } catch (error) {
    logger.error({ email, error }, 'Failed to send verification code')
    throw new Error('Email service error')
  }
}
