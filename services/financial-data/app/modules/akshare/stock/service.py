"""股票业务逻辑层"""

from typing import List
import asyncio
import structlog

from app.config import settings
from app.core.cache import cache
from app.utils.trading_time import TradingTimeHelper
from app.modules.akshare.stock.client import stock_client
from app.modules.akshare.stock.schemas import (
    StockListItem,
    StockSpot,
    KLinePoint,
    KLineMeta,
    KLineResponse,
    MarketType,
    StockProfile,
    StockValuation,
    StockFinancial,
    StockShareholders,
    FundFlow,
    BidAsk,
    BatchSymbolItem,
    MarketFetchResult,
    StockListResponse,
)

logger = structlog.get_logger(__name__)


class StockService:
    """股票服务层（带缓存）"""

    def __init__(self):
        self.client = stock_client

    async def _fetch_market_list(self, market: MarketType) -> list[StockListItem]:
        """获取单个市场的股票列表（优先缓存，失败抛异常）

        Args:
            market: 市场类型

        Returns:
            股票列表

        Raises:
            Exception: 获取失败时抛出
        """
        cache_key = f"stock:list:{market}"

        # 1. 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("stock_list_cache_hit", market=market, cache_key=cache_key)
            return [StockListItem(**item) for item in cached]

        # 2. 从数据源获取
        stocks = await self.client.get_stock_list(market)

        # 3. 如果获取成功则缓存
        if stocks:
            await cache.set(
                cache_key,
                [stock.model_dump() for stock in stocks],
                ttl=settings.cache_ttl_stock_list,
            )
            logger.info("stock_list_fetched", market=market, count=len(stocks), cached=True)

        return stocks

    async def get_stock_list(
        self, market: MarketType | None = None
    ) -> StockListResponse:
        """获取股票列表（带部分成功容错）

        策略:
        1. 如果指定 market，尝试获取对应缓存
        2. 如果 market 为 None，分别获取 CN/HK/US 并合并
        3. 部分市场失败时，仍返回成功获取的数据和各市场状态
        """
        markets: list[MarketType] = [market] if market else ["CN", "HK", "US"]

        # 并发获取所有市场数据
        results = await asyncio.gather(
            *[self._fetch_market_list(m) for m in markets],
            return_exceptions=True
        )

        # 聚合结果
        all_stocks: list[StockListItem] = []
        market_results: list[MarketFetchResult] = []

        for market_item, result in zip(markets, results):
            if isinstance(result, Exception):
                market_results.append(MarketFetchResult(
                    market=market_item,
                    fetched=False,
                    count=0,
                    error=str(result)
                ))
                logger.warning("market_fetch_failed", market=market_item, error=str(result))
            else:
                count = len(result)
                all_stocks.extend(result)
                market_results.append(MarketFetchResult(
                    market=market_item,
                    fetched=True,
                    count=count,
                    error=None
                ))

        return StockListResponse(
            total_count=len(all_stocks),
            markets=market_results,
            data=all_stocks
        )

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
        """获取实时行情（带智能缓存）

        缓存策略根据交易时段动态调整,详见 config.py
        """
        cache_key = f"stock:spot:{market or 'AUTO'}:{symbol}"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("stock_spot_cache_hit", symbol=symbol)
            return StockSpot(**cached)

        # 从数据源获取
        spot = await self.client.get_spot(symbol, market)

        # 智能缓存: 根据交易时段动态调整TTL
        ttl = TradingTimeHelper.get_quote_cache_ttl(market)
        await cache.set(cache_key, spot.model_dump(), ttl=ttl)

        logger.info("stock_spot_cached", symbol=symbol, ttl=ttl,
                   is_trading=TradingTimeHelper.is_trading_time(market))

        return spot

    async def get_kline(
        self,
        symbol: str,
        market: MarketType | None = None,
        period: str = "day",
        adjust: str = "qfq",
        limit: int | None = None,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> KLineResponse:
        """获取 K 线数据（带缓存）

        缓存策略:
        - 无日期范围时使用缓存 (limit 模式)
        - 指定日期范围时不使用缓存 (增量获取)
        """
        # 有日期范围时不使用缓存
        if start_date:
            logger.info("stock_kline_fetch_no_cache", symbol=symbol, start_date=start_date, end_date=end_date)
            return await self.client.get_kline(symbol, market, period, adjust, limit, start_date, end_date)

        # 缓存 key (不含日期范围)
        cache_key = f"stock:kline:{market or 'AUTO'}:{symbol}:{period}:{adjust}:{limit or 250}"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("stock_kline_cache_hit", symbol=symbol, period=period)
            # 从缓存恢复响应结构
            return KLineResponse(**cached)

        # 从数据源获取
        result = await self.client.get_kline(symbol, market, period, adjust, limit, start_date, end_date)

        # 缓存结果 (仅缓存 data 部分)
        await cache.set(
            cache_key,
            {"data": [k.model_dump() for k in result.data], "meta": result.meta.model_dump()},
            ttl=settings.cache_ttl_kline,
        )

        return result

    async def get_profile(
        self, symbol: str, market: MarketType | None = None
    ) -> StockProfile:
        """获取公司信息（带缓存）"""
        cache_key = f"stock:profile:{market or 'AUTO'}:{symbol}"

        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("stock_profile_cache_hit", symbol=symbol)
            return StockProfile(**cached)

        # 从数据源获取
        profile = await self.client.get_profile(symbol, market)

        # 缓存结果
        await cache.set(cache_key, profile.model_dump(), ttl=settings.cache_ttl_profile)

        return profile

    # get_valuation 方法已废弃 - /valuation 接口已删除
    # 估值数据现在通过 /profile 接口获取
    # async def get_valuation(...):

    async def get_financial(
        self, symbol: str, market: MarketType | None = None
    ) -> StockFinancial:
        """获取财务数据（带缓存）"""
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
        """获取股东信息（带缓存，仅A股）"""
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
        """获取资金流向（带缓存，仅A股）"""
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

    # get_bid_ask 方法已废弃 - /bid-ask 接口已删除
    # 五档盘口数据现在包含在 /spot 接口的返回中
    # async def get_bid_ask(...):

    async def get_spot_batch(
        self, symbols: List[BatchSymbolItem]
    ) -> dict[str, StockSpot]:
        """批量获取实时行情（无缓存，直接调用单个接口的缓存）"""
        return await self.client.get_spot_batch(symbols)


# 全局服务实例
stock_service = StockService()
