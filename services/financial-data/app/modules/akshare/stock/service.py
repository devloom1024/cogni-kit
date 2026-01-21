"""股票业务逻辑层"""

from typing import List
import asyncio
import structlog

from app.config import settings
from app.core.cache import cache
from app.modules.akshare.stock.client import stock_client
from app.modules.akshare.stock.schemas import (
    StockListItem,
    StockSpot,
    KLinePoint,
    MarketType,
    StockProfile,
    StockValuation,
    StockFinancial,
    StockShareholders,
    FundFlow,
    BidAsk,
    BatchSymbolItem,
)

logger = structlog.get_logger()


class StockService:
    """股票服务层（带缓存）"""

    def __init__(self):
        self.client = stock_client

    async def _fetch_market_list(self, market: MarketType) -> List[StockListItem]:
        """获取单个市场的股票列表（带缓存）"""
        cache_key = f"stock:list:{market}"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("stock_list_cache_hit", market=market)
            return [StockListItem(**item) for item in cached]

        # 从数据源获取
        stocks = await self.client.get_stock_list(market)

        # 缓存结果 (24小时)
        await cache.set(
            cache_key,
            [stock.model_dump() for stock in stocks],
            ttl=settings.cache_ttl_stock_list,
        )
        return stocks

    async def get_stock_list(
        self, market: MarketType | None = None
    ) -> List[StockListItem]:
        """获取股票列表（带缓存）

        策略:
        1. 如果指定 market，尝试获取对应缓存
        2. 如果 market 为 None，分别获取 CN/HK/US 缓存并合并
        3. 缓存未命中时并发调用 client 获取并更新缓存
        """
        markets: list[MarketType] = [market] if market else ["CN", "HK", "US"]

        # 并发获取所有市场数据
        results = await asyncio.gather(*[self._fetch_market_list(m) for m in markets])

        all_stocks = []
        for res in results:
            all_stocks.extend(res)

        return all_stocks

    async def refresh_market_list(self, market: MarketType) -> int:
        """刷新单个市场的股票列表缓存（无重试，纯刷新）"""
        stocks = await self.client.get_stock_list(market)
        cache_key = f"stock:list:{market}"
        await cache.set(
            cache_key,
            [stock.model_dump() for stock in stocks],
            ttl=settings.cache_ttl_stock_list,
        )
        logger.info("stock_list_refreshed", market=market, count=len(stocks))
        return len(stocks)

    async def get_spot(
        self, symbol: str, market: MarketType | None = None
    ) -> StockSpot:
        """获取实时行情（带缓存）"""
        cache_key = f"stock:spot:{market or 'AUTO'}:{symbol}"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("stock_spot_cache_hit", symbol=symbol)
            return StockSpot(**cached)

        # 从数据源获取
        spot = await self.client.get_spot(symbol, market)

        # 缓存结果
        await cache.set(cache_key, spot.model_dump(), ttl=settings.cache_ttl_quote)

        return spot

    async def get_kline(
        self,
        symbol: str,
        market: MarketType | None = None,
        period: str = "day",
        adjust: str = "qfq",
        limit: int = 250,
    ) -> List[KLinePoint]:
        """获取 K 线数据（带缓存）"""
        cache_key = f"stock:kline:{market or 'AUTO'}:{symbol}:{period}:{adjust}"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("stock_kline_cache_hit", symbol=symbol, period=period)
            return [KLinePoint(**item) for item in cached]

        # 从数据源获取
        klines = await self.client.get_kline(symbol, market, period, adjust, limit)

        # 缓存结果
        await cache.set(
            cache_key,
            [kline.model_dump() for kline in klines],
            ttl=settings.cache_ttl_kline,
        )

        return klines

    async def get_profile(
        self, symbol: str, market: MarketType | None = None
    ) -> StockProfile:
        """获取公司信息（带缓存 - 24小时）"""
        cache_key = f"stock:profile:{market or 'AUTO'}:{symbol}"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("stock_profile_cache_hit", symbol=symbol)
            return StockProfile(**cached)

        # 从数据源获取
        profile = await self.client.get_profile(symbol, market)

        # 缓存结果 (24小时)
        await cache.set(cache_key, profile.model_dump(), ttl=settings.cache_ttl_profile)

        return profile

    async def get_valuation(
        self, symbol: str, market: MarketType | None = None
    ) -> StockValuation:
        """获取估值数据（带缓存 - 5分钟）"""
        cache_key = f"stock:valuation:{market or 'AUTO'}:{symbol}"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("stock_valuation_cache_hit", symbol=symbol)
            return StockValuation(**cached)

        # 从数据源获取
        valuation = await self.client.get_valuation(symbol, market)

        # 缓存结果 (5分钟)
        await cache.set(
            cache_key, valuation.model_dump(), ttl=settings.cache_ttl_valuation
        )

        return valuation

    async def get_financial(
        self, symbol: str, market: MarketType | None = None
    ) -> StockFinancial:
        """获取财务数据（带缓存 - 1小时）"""
        cache_key = f"stock:financial:{market or 'AUTO'}:{symbol}"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("stock_financial_cache_hit", symbol=symbol)
            return StockFinancial(**cached)

        # 从数据源获取
        financial = await self.client.get_financial(symbol, market)

        # 缓存结果 (1小时)
        await cache.set(
            cache_key, financial.model_dump(), ttl=settings.cache_ttl_financial
        )

        return financial

    async def get_shareholders(self, symbol: str) -> StockShareholders:
        """获取股东信息（带缓存 - 1小时，仅A股）"""
        cache_key = f"stock:shareholders:{symbol}"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("stock_shareholders_cache_hit", symbol=symbol)
            return StockShareholders(**cached)

        # 从数据源获取
        shareholders = await self.client.get_shareholders(symbol)

        # 缓存结果 (1小时)
        await cache.set(
            cache_key, shareholders.model_dump(), ttl=settings.cache_ttl_shareholders
        )

        return shareholders

    async def get_fund_flow(self, symbol: str) -> FundFlow:
        """获取资金流向（带缓存 - 5秒，仅A股）"""
        cache_key = f"stock:fund-flow:{symbol}"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("stock_fund_flow_cache_hit", symbol=symbol)
            return FundFlow(**cached)

        # 从数据源获取
        fund_flow = await self.client.get_fund_flow(symbol)

        # 缓存结果 (5秒)
        await cache.set(
            cache_key, fund_flow.model_dump(), ttl=settings.cache_ttl_fund_flow
        )

        return fund_flow

    async def get_bid_ask(self, symbol: str) -> BidAsk:
        """获取五档盘口（带缓存 - 1秒，仅A股）"""
        cache_key = f"stock:bid-ask:{symbol}"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("stock_bid_ask_cache_hit", symbol=symbol)
            return BidAsk(**cached)

        # 从数据源获取
        bid_ask = await self.client.get_bid_ask(symbol)

        # 缓存结果 (1秒)
        await cache.set(cache_key, bid_ask.model_dump(), ttl=settings.cache_ttl_bid_ask)

        return bid_ask

    async def get_spot_batch(
        self, symbols: List[BatchSymbolItem]
    ) -> dict[str, StockSpot]:
        """批量获取实时行情（无缓存，直接调用单个接口的缓存）"""
        return await self.client.get_spot_batch(symbols)


# 全局服务实例
stock_service = StockService()
