"""股票模块路由"""
from fastapi import APIRouter, Query, Path

from app.modules.akshare.stock.service import stock_service
from app.modules.akshare.stock.schemas import (
    StockListItem, StockSpot, KLinePoint, KLineResponse, MarketType,
    StockProfile, StockFinancial,
    StockShareholders, FundFlow,
    BatchSpotRequest, StockListResponse,
    StockFinancialCNResponse, StockFinancialHKResponse, StockFinancialUSResponse
)

router = APIRouter()


@router.get("/list", response_model=StockListResponse)
async def get_stock_list(
    market: MarketType | None = Query(None, description="市场过滤 (CN/HK/US)")
):
    """获取全量股票列表（用于同步）

    返回各市场的获取状态，即使部分市场失败也会返回成功获取的数据。
    """
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


@router.get("/{symbol}/kline", response_model=KLineResponse)
async def get_stock_kline(
    symbol: str = Path(..., description="股票代码"),
    market: MarketType | None = Query(None, description="市场类型"),
    period: str = Query("day", description="K线周期", pattern="^(day|week|month)$"),
    adjust: str = Query("qfq", description="复权类型", pattern="^(|qfq|hfq)$"),
    limit: int | None = Query(None, description="数据条数 (默认250)", ge=1, le=1000),
    start_date: str | None = Query(None, description="开始日期 (YYYYMMDD)", pattern="^[0-9]{8}$"),
    end_date: str | None = Query(None, description="结束日期 (YYYYMMDD)", pattern="^[0-9]{8}$")
):
    """获取股票 K 线数据

    支持两种查询模式:
    1. limit 模式: 仅指定 limit,返回最近 N 条数据
    2. 日期范围模式: 指定 start_date/end_date,返回指定范围内的数据
    """
    return await stock_service.get_kline(symbol, market, period, adjust, limit, start_date, end_date)


@router.get("/{symbol}/profile", response_model=StockProfile)
async def get_stock_profile(
    symbol: str = Path(..., description="股票代码"),
    market: MarketType | None = Query(None, description="市场类型")
):
    """获取公司基本信息 (F10)"""
    return await stock_service.get_profile(symbol, market)


# /valuation 接口已删除,估值数据请使用 /profile 接口获取


@router.get("/{symbol}/financial/cn", response_model=StockFinancialCNResponse)
async def get_stock_financial_cn(
    symbol: str = Path(..., description="股票代码"),
    limit: int = Query(8, ge=1, le=20, description="返回报告期数量"),
    period: str | None = Query(None, description="筛选特定报告期，格式: 2024Q1, 2024H1, 2024")
):
    """获取 A 股财务数据（多期）"""
    return await stock_service.get_financial_cn(symbol, limit, period)


@router.get("/{symbol}/financial/hk", response_model=StockFinancialHKResponse)
async def get_stock_financial_hk(
    symbol: str = Path(..., description="股票代码"),
    limit: int = Query(8, ge=1, le=20, description="返回报告期数量")
):
    """获取港股财务数据（多期）"""
    return await stock_service.get_financial_hk(symbol, limit)


@router.get("/{symbol}/financial/us", response_model=StockFinancialUSResponse)
async def get_stock_financial_us(
    symbol: str = Path(..., description="股票代码"),
    limit: int = Query(8, ge=1, le=20, description="返回报告期数量")
):
    """获取美股财务数据（多期）"""
    return await stock_service.get_financial_us(symbol, limit)


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
