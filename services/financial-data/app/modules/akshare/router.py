"""AkShare 模块路由"""
from fastapi import APIRouter, Query, Path
from typing import List

from app.modules.akshare.service import akshare_service
from app.modules.akshare.schemas import (
    StockInfo, RealtimeQuote, KLinePoint,
    FundInfo, FundDetail, FundNav, FundHolding,
    MarketType, FundType
)

router = APIRouter()


# ==================== 股票路由 ====================

@router.get("/stock/list", response_model=List[StockInfo])
async def get_stock_list(
    market: MarketType | None = Query(None, description="市场过滤 (CN/HK/US)")
):
    """获取全量股票列表 (用于同步)"""
    return await akshare_service.get_stock_list(market)


@router.get("/stock/search", response_model=List[StockInfo])
async def search_stock(
    q: str = Query(..., description="搜索关键词 (代码/名称)")
):
    """搜索股票 (A股/港股/美股)"""
    return await akshare_service.search_stock(q)


@router.get("/stock/{symbol}/spot", response_model=RealtimeQuote)
async def get_realtime_quote(
    symbol: str = Path(..., description="股票代码"),
    market: MarketType | None = Query(None, description="市场类型")
):
    """获取实时行情"""
    return await akshare_service.get_realtime_quote(symbol, market)


@router.get("/stock/{symbol}/kline", response_model=List[KLinePoint])
async def get_kline(
    symbol: str = Path(..., description="股票代码"),
    market: MarketType | None = Query(None, description="市场类型"),
    period: str = Query("day", description="K线周期", pattern="^(day|week|month)$"),
    adjust: str = Query("qfq", description="复权类型", pattern="^(|qfq|hfq)$"),
    limit: int = Query(250, description="数据条数", ge=1, le=1000)
):
    """获取 K 线数据 (纯 OHLCV)"""
    return await akshare_service.get_kline(symbol, market, period, adjust, limit)


# ==================== 基金路由 ====================

@router.get("/fund/list", response_model=List[FundInfo])
async def get_fund_list(
    type: FundType | None = Query(None, description="基金类型过滤 (ETF/FUND)")
):
    """获取全量基金列表 (用于同步)"""
    return await akshare_service.get_fund_list(type)


@router.get("/fund/search", response_model=List[FundInfo])
async def search_fund(
    q: str = Query(..., description="搜索关键词")
):
    """搜索基金"""
    return await akshare_service.search_fund(q)


@router.get("/fund/{symbol}/nav", response_model=FundNav)
async def get_fund_nav(
    symbol: str = Path(..., description="基金代码")
):
    """获取场外基金最新净值"""
    return await akshare_service.get_fund_nav(symbol)


@router.get("/fund/{symbol}/info", response_model=FundDetail)
async def get_fund_info(
    symbol: str = Path(..., description="基金代码")
):
    """获取基金基本信息"""
    return await akshare_service.get_fund_info(symbol)


@router.get("/fund/{symbol}/holdings", response_model=List[FundHolding])
async def get_fund_holdings(
    symbol: str = Path(..., description="基金代码"),
    year: str | None = Query(None, description="年份")
):
    """获取基金持仓 (十大重仓股)"""
    return await akshare_service.get_fund_holdings(symbol, year)
