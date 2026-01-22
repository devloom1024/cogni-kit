"""定时任务调度器 - 负责缓存预热和定时刷新"""

import asyncio
import time
from typing import Awaitable, Callable, Literal
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import structlog

from app.config import settings
from app.modules.akshare.stock.service import stock_service
from app.modules.akshare.etf.service import etf_service
from app.modules.akshare.fund.service import fund_service

logger = structlog.get_logger(__name__)

# 市场类型
StockMarket = Literal["CN", "HK", "US"]


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

    # ==================== 股票刷新任务 ====================

    def add_stock_list_refresh_job(self):
        """添加股票列表定时刷新任务"""
        if not self.scheduler:
            raise RuntimeError("Scheduler not started")

        cron_expr = settings.cache_refresh_cron
        self.scheduler.add_job(
            self._refresh_stock_list_with_retry,
            CronTrigger.from_crontab(cron_expr),
            id="refresh_stock_list",
            name="Refresh stock list cache",
            replace_existing=True,
        )
        logger.info("scheduled_stock_list_refresh", trigger=cron_expr)

    async def _refresh_stock_list_with_retry(self):
        """带重试的股票列表刷新（遍历三个市场，每个市场独立重试）"""
        markets: list[StockMarket] = ["CN", "HK", "US"]

        for market in markets:
            await self._refresh_single_with_retry(
                category="stock",
                market=market,
                refresh_fn=lambda m=market: stock_service.refresh_market_list(m),
            )

    # ==================== ETF 刷新任务 ====================

    def add_etf_list_refresh_job(self):
        """添加 ETF 列表定时刷新任务"""
        if not self.scheduler:
            raise RuntimeError("Scheduler not started")

        cron_expr = settings.cache_refresh_cron_etf
        self.scheduler.add_job(
            self._refresh_etf_list_with_retry,
            CronTrigger.from_crontab(cron_expr),
            id="refresh_etf_list",
            name="Refresh ETF list cache",
            replace_existing=True,
        )
        logger.info("scheduled_etf_list_refresh", trigger=cron_expr)

    async def _refresh_etf_list_with_retry(self):
        """带重试的 ETF 列表刷新"""
        await self._refresh_single_with_retry(
            category="etf", market=None, refresh_fn=etf_service.refresh_etf_list
        )

    # ==================== 基金刷新任务 ====================

    def add_fund_list_refresh_job(self):
        """添加基金列表定时刷新任务"""
        if not self.scheduler:
            raise RuntimeError("Scheduler not started")

        cron_expr = settings.cache_refresh_cron_fund
        self.scheduler.add_job(
            self._refresh_fund_list_with_retry,
            CronTrigger.from_crontab(cron_expr),
            id="refresh_fund_list",
            name="Refresh fund list cache",
            replace_existing=True,
        )
        logger.info("scheduled_fund_list_refresh", trigger=cron_expr)

    async def _refresh_fund_list_with_retry(self):
        """带重试的基金列表刷新"""
        await self._refresh_single_with_retry(
            category="fund", market=None, refresh_fn=fund_service.refresh_fund_list
        )

    # ==================== 通用重试逻辑 ====================

    async def _refresh_single_with_retry(
        self,
        category: str,
        market: str | None,
        refresh_fn: Callable[[], Awaitable[int]],
    ):
        """通用单类型重试逻辑

        Args:
            category: 类型标识 (stock/etf/fund)
            market: 市场标识 (CN/HK/US 或 None)
            refresh_fn: 刷新函数,返回刷新的数量
        """
        retry_times = settings.cache_refresh_retry_times
        last_error: Exception | None = None

        market_info = f" market={market}" if market else ""
        start_time = time.time()

        for attempt in range(1, retry_times + 1):
            try:
                logger.info(
                    f"{category}_refresh_starting{market_info}",
                    attempt=attempt,
                    max_attempts=retry_times,
                )
                count = await refresh_fn()
                duration_ms = int((time.time() - start_time) * 1000)
                
                logger.info(
                    f"{category}_refresh_success{market_info}",
                    attempt=attempt,
                    count=count,
                    duration_ms=duration_ms
                )
                return
            except Exception as e:
                last_error = e
                duration_ms = int((time.time() - start_time) * 1000)
                
                logger.warning(
                    f"{category}_refresh_failed{market_info}",
                    attempt=attempt,
                    max_attempts=retry_times,
                    error=str(e),
                    error_type=type(e).__name__,
                    duration_ms=duration_ms
                )
                if attempt < retry_times:
                    await asyncio.sleep(5)  # 重试间隔 5 秒

        # 所有重试均失败
        total_duration_ms = int((time.time() - start_time) * 1000)
        logger.error(
            f"{category}_refresh_all_attempts_failed{market_info}",
            attempts=retry_times,
            error=str(last_error),
            error_type=type(last_error).__name__ if last_error else None,
            total_duration_ms=total_duration_ms,
            exc_info=True
        )
        # TODO: 后续可接入告警通知机制
        if last_error:
            raise last_error


# 全局调度器实例
cache_refresh_scheduler = CacheRefreshScheduler()
