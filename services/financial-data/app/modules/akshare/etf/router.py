"""ETF 模块路由"""
from fastapi import APIRouter, Path, Query
from typing import List

from app.modules.akshare.etf.service import etf_service
from app.modules.akshare.etf.schemas import (
    EtfListItem, EtfSpot, KLineResponse
)

router = APIRouter()


@router.get("/list", response_model=List[EtfListItem])
async def get_etf_list():
    """获取全量 ETF 列表 (用于同步)"""
    return await etf_service.get_etf_list()


@router.get("/{symbol}/spot", response_model=EtfSpot)
async def get_etf_spot(
    symbol: str = Path(..., description="ETF 代码")
):
    """获取 ETF 实时行情"""
    return await etf_service.get_spot(symbol)


@router.get("/{symbol}/kline", response_model=KLineResponse)
async def get_etf_kline(
    symbol: str = Path(..., description="ETF 代码"),
    period: str = Query("day", description="K线周期", pattern="^(day|week|month)$"),
    adjust: str = Query("qfq", description="复权类型", pattern="^(|qfq|hfq)$"),
    limit: int | None = Query(None, description="数据条数 (默认250)", ge=1, le=1000),
    start_date: str | None = Query(None, description="开始日期 (YYYYMMDD)", pattern="^[0-9]{8}$"),
    end_date: str | None = Query(None, description="结束日期 (YYYYMMDD)", pattern="^[0-9]{8}$")
):
    """获取 ETF K 线数据

    支持两种查询模式:
    1. limit 模式: 仅指定 limit,返回最近 N 条数据
    2. 日期范围模式: 指定 start_date/end_date,返回指定范围内的数据
    """
    return await etf_service.get_kline(symbol, period, adjust, limit, start_date, end_date)
