/**
 * 投资标的数据同步脚本
 *
 * 功能：从 financial-data 服务同步 A股、指数、ETF、LOF、场外基金数据到本地数据库
 *
 * 使用方式：
 *   bun run --cwd apps/server bin/sync-assets.ts
 *
 * 定时任务配置 (crontab)：
 *   # 每日凌晨 2:00 执行
 *   0 2 * * * cd /path/to/cogni-kit && bun run --cwd apps/server bin/sync-assets.ts >> /var/log/sync-assets.log 2>&1
 */

import { dataSyncService } from '../src/features/data-sync/service.js'
import { logger } from '../src/shared/logger.js'

async function main() {
  logger.info('🚀 Starting asset sync job...')

  const startTime = Date.now()

  try {
    const result = await dataSyncService.syncAllAssets()

    // 打印各数据源的同步结果
    if (result.results) {
      logger.info('📊 Sync results by data source:')
      for (const [type, res] of Object.entries(result.results)) {
        const status = res.success ? '✅' : '❌'
        logger.info(`  ${status} ${type}: ${res.count} records${res.error ? ` (error: ${res.error})` : ''}`)
      }
    }

    // 打印实际写入数据库的记录数
    logger.info({
      written: result.count,
      duration: result.duration,
      durationFormatted: `${(result.duration / 1000).toFixed(2)}s`,
    }, '✅ Asset sync completed')
  } catch (error) {
    logger.error({ error }, '❌ Asset sync job encountered an error')
    process.exit(1)
  }

  const totalDuration = Date.now() - startTime
  logger.info({ totalDuration: `${totalDuration}ms` }, 'Asset sync job finished')

  // 正常退出
  process.exit(0)
}

main()
