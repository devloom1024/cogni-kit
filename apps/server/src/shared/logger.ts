import pino from 'pino'
import { env } from '../config/env.js'
import { join } from 'path'
import { mkdirSync } from 'fs'

const isDev = env.NODE_ENV === 'development'
const LOG_DIR = join(process.cwd(), 'logs')
const LOG_FILE = join(LOG_DIR, 'app.log')

// 确保日志目录存在
mkdirSync(LOG_DIR, { recursive: true })

export const logger = pino({
  level: isDev ? 'info' : 'info',
  transport: isDev
    ? {
        // 同时输出到控制台和文件
        targets: [
          {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
          {
            target: 'pino/file',
            options: { destination: LOG_FILE },
          },
        ],
      }
    : undefined,
})
