"""定时任务调度器"""

import structlog
from apscheduler.schedulers.asyncio import AsyncIOScheduler

logger = structlog.get_logger(__name__)

class CacheRefreshScheduler:
    """缓存刷新调度器"""

    def __init__(self):
        self._scheduler: AsyncIOScheduler | None = None

    @property
    def scheduler(self) -> AsyncIOScheduler | None:
        return self._scheduler

    @scheduler.setter
    def scheduler(self, value: AsyncIOScheduler | None) -> None:
        self._scheduler = value

    async def start(self):
        """启动调度器"""
        self._scheduler = AsyncIOScheduler()
        self._scheduler.start()
        logger.info("scheduler_started")

    async def stop(self):
        """停止调度器"""
        scheduler = self._scheduler
        if scheduler and scheduler.running:
            scheduler.shutdown(wait=False)
            logger.info("scheduler_stopped")


# 全局调度器实例
cache_refresh_scheduler = CacheRefreshScheduler()
