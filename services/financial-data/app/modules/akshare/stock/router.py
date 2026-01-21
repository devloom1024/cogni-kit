"""股票模块路由"""
from fastapi import APIRouter, Query, Path
from typing import List, Literal

from app.modules.akshare.stock.service import stock_service
from app.modules.akshare.stock.schemas import (
    StockListItem, StockSpot, KLinePoint, MarketType,
    StockProfile, StockFinancial,
    StockShareholders, FundFlow,
    BatchSpotRequest
)

router = APIRouter()


@router.get("/list", response_model=List[StockListItem])
async def get_stock_list(
    market: MarketType | Literal[""] | None = Query(None, description="市场过滤 (CN/HK/US)")
):
    """获取全量股票列表 (用于同步)"""
    if market == "":
        market = None
    return await stock_service.get_stock_list(market)


@router.get("/{symbol}/spot", response_model=StockSpot)
async def get_stock_spot(
    symbol: str = Path(..., description="股票代码"),
    market: MarketType | None = Query(None, description="市场类型")
):
    """获取股票实时行情(含五档盘口)
    
    A股返回完整行情数据(含五档盘口),港股/美股返回基础行情数据
    """
    return await stock_service.get_spot(symbol, market)


@router.get("/{symbol}/kline", response_model=List[KLinePoint])
async def get_stock_kline(
    symbol: str = Path(..., description="股票代码"),
    market: MarketType | None = Query(None, description="市场类型"),
    period: str = Query("day", description="K线周期", pattern="^(day|week|month)$"),
    adjust: str = Query("qfq", description="复权类型", pattern="^(|qfq|hfq)$"),
    limit: int = Query(250, description="数据条数", ge=1, le=1000)
):
    """获取股票 K 线数据 (纯 OHLCV)"""
    return await stock_service.get_kline(symbol, market, period, adjust, limit)


@router.get("/{symbol}/profile", response_model=StockProfile)
async def get_stock_profile(
    symbol: str = Path(..., description="股票代码"),
    market: MarketType | None = Query(None, description="市场类型")
):
    """获取公司基本信息 (F10)"""
    return await stock_service.get_profile(symbol, market)


# /valuation 接口已删除,估值数据请使用 /profile 接口获取


@router.get("/{symbol}/financial", response_model=StockFinancial)
async def get_stock_financial(
    symbol: str = Path(..., description="股票代码"),
    market: MarketType | None = Query(None, description="市场类型")
):
    """获取财务数据摘要"""
    return await stock_service.get_financial(symbol, market)


@router.get("/{symbol}/shareholders", response_model=StockShareholders)
async def get_stock_shareholders(
    symbol: str = Path(..., description="股票代码")
):
    """获取股东信息（仅A股）"""
    return await stock_service.get_shareholders(symbol)


@router.get("/{symbol}/fund-flow", response_model=FundFlow)
async def get_stock_fund_flow(
    symbol: str = Path(..., description="股票代码")
):
    """获取资金流向（仅A股）"""
    return await stock_service.get_fund_flow(symbol)


# /bid-ask 接口已删除,五档盘口数据已包含在 /spot 接口中


@router.post("/spot/batch", response_model=dict[str, StockSpot])
async def get_stock_spot_batch(
    request: BatchSpotRequest
):
    """批量获取股票实时行情（最多50只）"""
    return await stock_service.get_spot_batch(request.symbols)
