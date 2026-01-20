"""ETF 模块路由"""
from fastapi import APIRouter, Path
from typing import List

from app.modules.akshare.etf.service import etf_service
from app.modules.akshare.etf.schemas import EtfListItem, EtfSpot

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
