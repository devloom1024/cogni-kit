"""AkShare 业务逻辑层"""
from typing import List
import structlog

from app.config import settings
from app.core.cache import cache
from app.modules.akshare.client import akshare_client
from app.modules.akshare.schemas import (
    StockInfo, RealtimeQuote, KLinePoint,
    FundInfo, FundDetail, FundNav, FundHolding,
    MarketType, FundType
)

logger = structlog.get_logger()


class AkShareService:
    """AkShare 服务层（带缓存）"""
    
    def __init__(self):
        self.client = akshare_client
    
    # ==================== 股票服务 ====================
    
    async def get_stock_list(self, market: MarketType | None = None) -> List[StockInfo]:
        """获取股票列表（带缓存）"""
        cache_key = f"stock:list:{market or 'all'}"
        
        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("stock_list_cache_hit", market=market)
            return [StockInfo(**item) for item in cached]
        
        # 从数据源获取
        stocks = await self.client.get_stock_list(market)
        
        # 缓存结果 (1小时)
        await cache.set(
            cache_key,
            [stock.model_dump() for stock in stocks],
            ttl=3600
        )
        
        return stocks
    
    async def search_stock(self, query: str) -> List[StockInfo]:
        """搜索股票"""
        return await self.client.search_stock(query)
    
    async def get_realtime_quote(self, symbol: str, market: MarketType | None = None) -> RealtimeQuote:
        """获取实时行情（带缓存）"""
        cache_key = f"quote:{market or 'CN'}:{symbol}"
        
        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("quote_cache_hit", symbol=symbol)
            return RealtimeQuote(**cached)
        
        # 从数据源获取
        quote = await self.client.get_realtime_quote(symbol, market)
        
        # 缓存结果
        await cache.set(
            cache_key,
            quote.model_dump(),
            ttl=settings.cache_ttl_quote
        )
        
        return quote
    
    async def get_kline(
        self,
        symbol: str,
        market: MarketType | None = None,
        period: str = "day",
        adjust: str = "qfq",
        limit: int = 250
    ) -> List[KLinePoint]:
        """获取 K 线数据（带缓存）"""
        cache_key = f"kline:{market or 'CN'}:{symbol}:{period}:{adjust}"
        
        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("kline_cache_hit", symbol=symbol, period=period)
            return [KLinePoint(**item) for item in cached]
        
        # 从数据源获取
        klines = await self.client.get_kline(symbol, market, period, adjust, limit)
        
        # 缓存结果
        await cache.set(
            cache_key,
            [kline.model_dump() for kline in klines],
            ttl=settings.cache_ttl_kline
        )
        
        return klines
    
    # ==================== 基金服务 ====================
    
    async def get_fund_list(self, fund_type: FundType | None = None) -> List[FundInfo]:
        """获取基金列表（带缓存）"""
        cache_key = f"fund:list:{fund_type or 'all'}"
        
        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("fund_list_cache_hit", type=fund_type)
            return [FundInfo(**item) for item in cached]
        
        # 从数据源获取
        funds = await self.client.get_fund_list(fund_type)
        
        # 缓存结果 (1小时)
        await cache.set(
            cache_key,
            [fund.model_dump() for fund in funds],
            ttl=3600
        )
        
        return funds
    
    async def search_fund(self, query: str) -> List[FundInfo]:
        """搜索基金"""
        return await self.client.search_fund(query)
    
    async def get_fund_nav(self, symbol: str) -> FundNav:
        """获取基金净值（带缓存）"""
        cache_key = f"nav:{symbol}"
        
        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("nav_cache_hit", symbol=symbol)
            return FundNav(**cached)
        
        # 从数据源获取
        nav = await self.client.get_fund_nav(symbol)
        
        # 缓存结果
        await cache.set(
            cache_key,
            nav.model_dump(),
            ttl=settings.cache_ttl_nav
        )
        
        return nav
    
    async def get_fund_info(self, symbol: str) -> FundDetail:
        """获取基金详细信息（带缓存）"""
        cache_key = f"fund:info:{symbol}"
        
        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("fund_info_cache_hit", symbol=symbol)
            return FundDetail(**cached)
        
        # 从数据源获取
        info = await self.client.get_fund_info(symbol)
        
        # 缓存结果 (1小时)
        await cache.set(
            cache_key,
            info.model_dump(),
            ttl=3600
        )
        
        return info
    
    async def get_fund_holdings(self, symbol: str, year: str | None = None) -> List[FundHolding]:
        """获取基金持仓（带缓存）"""
        cache_key = f"fund:holdings:{symbol}:{year or 'latest'}"
        
        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("fund_holdings_cache_hit", symbol=symbol)
            return [FundHolding(**item) for item in cached]
        
        # 从数据源获取
        holdings = await self.client.get_fund_holdings(symbol, year)
        
        # 缓存结果 (1小时)
        await cache.set(
            cache_key,
            [holding.model_dump() for holding in holdings],
            ttl=3600
        )
        
        return holdings


# 全局服务实例
akshare_service = AkShareService()
