"""定时任务调度器 - 负责缓存预热和定时刷新"""
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import structlog

from app.config import settings
from app.modules.akshare.stock.service import stock_service

logger = structlog.get_logger()


class CacheRefreshScheduler:
    """缓存刷新调度器"""

    def __init__(self):
        self.scheduler: AsyncIOScheduler | None = None

    async def start(self):
        """启动调度器"""
        self.scheduler = AsyncIOScheduler()
        self.scheduler.start()
        logger.info("scheduler_started")

    async def stop(self):
        """停止调度器"""
        if self.scheduler and self.scheduler.running:
            self.scheduler.shutdown(wait=False)
            logger.info("scheduler_stopped")

    def add_stock_list_refresh_job(self):
        """添加股票列表定时刷新任务"""
        if not self.scheduler:
            raise RuntimeError("Scheduler not started")

        cron_expr = settings.cache_refresh_cron
        self.scheduler.add_job(
            self._refresh_stock_list_with_retry,
            CronTrigger(cron=cron_expr),
            id="refresh_stock_list",
            name="Refresh stock list cache",
            replace_existing=True,
        )
        logger.info("scheduled_stock_list_refresh", trigger=cron_expr)

    async def _refresh_stock_list_with_retry(self):
        """带重试的股票列表刷新"""
        retry_times = settings.cache_refresh_retry_times
        last_error: Exception | None = None

        for attempt in range(1, retry_times + 1):
            try:
                logger.info("stock_list_refresh_starting", attempt=attempt, max_attempts=retry_times)
                await stock_service.refresh_stock_list()
                logger.info("stock_list_refresh_success", attempt=attempt)
                return
            except Exception as e:
                last_error = e
                logger.warning(
                    "stock_list_refresh_failed",
                    attempt=attempt,
                    max_attempts=retry_times,
                    error=str(e),
                )
                if attempt < retry_times:
                    await asyncio.sleep(5)  # 重试间隔 5 秒

        # 所有重试均失败
        logger.error(
            "stock_list_refresh_all_attempts_failed",
            attempts=retry_times,
            error=str(last_error),
        )
        # TODO: 后续可接入告警通知机制
        raise last_error


# 全局调度器实例
cache_refresh_scheduler = CacheRefreshScheduler()
