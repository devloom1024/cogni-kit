"""场外基金模块路由"""
from fastapi import APIRouter, Path, Query
from typing import List

from app.modules.akshare.fund.service import fund_service
from app.modules.akshare.fund.schemas import (
    FundListItem, FundNav, FundDetail, FundHolding
)

router = APIRouter()


@router.get("/list", response_model=List[FundListItem])
async def get_fund_list():
    """获取全量场外基金列表 (用于同步)"""
    return await fund_service.get_fund_list()


@router.get("/{symbol}/nav", response_model=FundNav)
async def get_fund_nav(
    symbol: str = Path(..., description="基金代码")
):
    """获取基金最新净值"""
    return await fund_service.get_nav(symbol)


@router.get("/{symbol}/info", response_model=FundDetail)
async def get_fund_info(
    symbol: str = Path(..., description="基金代码")
):
    """获取基金基本信息"""
    return await fund_service.get_info(symbol)


@router.get("/{symbol}/holdings", response_model=List[FundHolding])
async def get_fund_holdings(
    symbol: str = Path(..., description="基金代码"),
    year: str | None = Query(None, description="年份")
):
    """获取基金持仓 (十大重仓股)"""
    return await fund_service.get_holdings(symbol, year)
