"""场外基金业务逻辑层"""

from typing import List
import structlog

from app.config import settings
from app.core.cache import cache
from app.modules.akshare.fund.client import fund_client
from app.modules.akshare.fund.schemas import (
    FundListItem,
    FundNav,
    FundDetail,
    FundHolding,
)

logger = structlog.get_logger(__name__)


class FundService:
    """场外基金服务层（带缓存）"""

    def __init__(self):
        self.client = fund_client

    async def get_fund_list(self) -> List[FundListItem]:
        """获取基金列表（带缓存）"""
        cache_key = "fund:list"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("fund_list_cache_hit")
            return [FundListItem(**item) for item in cached]

        # 从数据源获取
        funds = await self.client.get_fund_list()

        # 缓存结果 (1小时)
        await cache.set(
            cache_key,
            [fund.model_dump() for fund in funds],
            ttl=settings.cache_ttl_fund_list,
        )

        return funds

    async def get_nav(self, symbol: str) -> FundNav:
        """获取基金净值（带缓存）"""
        cache_key = f"fund:nav:{symbol}"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("fund_nav_cache_hit", symbol=symbol)
            return FundNav(**cached)

        # 从数据源获取
        nav = await self.client.get_nav(symbol)

        # 缓存结果 (1小时)
        await cache.set(cache_key, nav.model_dump(), ttl=settings.cache_ttl_fund_nav)

        return nav

    async def get_info(self, symbol: str) -> FundDetail:
        """获取基金详细信息（带缓存）"""
        cache_key = f"fund:info:{symbol}"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("fund_info_cache_hit", symbol=symbol)
            return FundDetail(**cached)

        # 从数据源获取
        info = await self.client.get_info(symbol)

        # 缓存结果 (1小时)
        await cache.set(cache_key, info.model_dump(), ttl=settings.cache_ttl_fund_info)

        return info

    async def get_holdings(
        self, symbol: str, year: str | None = None
    ) -> List[FundHolding]:
        """获取基金持仓（带缓存）"""
        cache_key = f"fund:holdings:{symbol}:{year or 'latest'}"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("fund_holdings_cache_hit", symbol=symbol)
            return [FundHolding(**item) for item in cached]

        # 从数据源获取
        holdings = await self.client.get_holdings(symbol, year)

        # 缓存结果 (1小时)
        await cache.set(
            cache_key,
            [holding.model_dump() for holding in holdings],
            ttl=settings.cache_ttl_fund_holdings,
        )

        return holdings

    async def refresh_fund_list(self) -> int:
        """刷新基金列表缓存（无重试，纯刷新）"""
        funds = await self.client.get_fund_list()
        cache_key = "fund:list"
        await cache.set(
            cache_key,
            [fund.model_dump() for fund in funds],
            ttl=settings.cache_ttl_fund_list,
        )
        logger.info("fund_list_refreshed", count=len(funds))
        return len(funds)


# 全局服务实例
fund_service = FundService()
