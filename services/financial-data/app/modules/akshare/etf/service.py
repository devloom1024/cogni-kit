"""ETF 业务逻辑层"""

from typing import List
import structlog

from app.config import settings
from app.core.cache import cache
from app.modules.akshare.etf.client import etf_client
from app.modules.akshare.etf.schemas import EtfListItem, EtfSpot

logger = structlog.get_logger()


class EtfService:
    """ETF 服务层（带缓存）"""

    def __init__(self):
        self.client = etf_client

    async def get_etf_list(self) -> List[EtfListItem]:
        """获取 ETF 列表（带缓存）"""
        cache_key = "etf:list"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("etf_list_cache_hit")
            return [EtfListItem(**item) for item in cached]

        # 从数据源获取
        etfs = await self.client.get_etf_list()

        # 缓存结果 (1小时)
        await cache.set(
            cache_key,
            [etf.model_dump() for etf in etfs],
            ttl=settings.cache_ttl_etf_list,
        )

        return etfs

    async def get_spot(self, symbol: str) -> EtfSpot:
        """获取 ETF 实时行情（带缓存）"""
        cache_key = f"etf:spot:{symbol}"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("etf_spot_cache_hit", symbol=symbol)
            return EtfSpot(**cached)

        # 从数据源获取
        spot = await self.client.get_spot(symbol)

        # 缓存结果
        await cache.set(cache_key, spot.model_dump(), ttl=settings.cache_ttl_quote)

        return spot

    async def refresh_etf_list(self) -> int:
        """刷新 ETF 列表缓存（无重试，纯刷新）"""
        etfs = await self.client.get_etf_list()
        cache_key = "etf:list"
        await cache.set(
            cache_key,
            [etf.model_dump() for etf in etfs],
            ttl=settings.cache_ttl_etf_list,
        )
        logger.info("etf_list_refreshed", count=len(etfs))
        return len(etfs)


# 全局服务实例
etf_service = EtfService()
