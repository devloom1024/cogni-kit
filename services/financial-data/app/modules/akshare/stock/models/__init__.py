"""股票数据模型统一导出"""
from .base import MarketType
from .spot import StockSpot, PriceLevel, BidAsk
from .kline import KLinePoint, KLineMeta, KLineResponse
from .profile import StockProfile
from .valuation import StockValuation
from .financial import (
    FinancialPeriodBase,
    StockFinancialCNPeriod,
    StockFinancialCNResponse,
    StockFinancialHKPeriod,
    StockFinancialHKResponse,
    StockFinancialUSPeriod,
    StockFinancialUSResponse,
)
from .shareholders import ShareholderItem, StockShareholders
from .fund_flow import FundFlowPeriod, FundFlowResponse
from .batch import (
    BatchSymbolItem,
    BatchSpotRequest,
    StockListItem,
    MarketFetchResult,
    StockListResponse,
    StockFinancial,
)

__all__ = [
    # 基础类型
    "MarketType",
    # 实时行情
    "StockSpot",
    "PriceLevel",
    "BidAsk",
    # K线数据
    "KLinePoint",
    "KLineMeta",
    "KLineResponse",
    # 公司信息
    "StockProfile",
    # 估值数据
    "StockValuation",
    # 财务数据
    "FinancialPeriodBase",
    "StockFinancialCNPeriod",
    "StockFinancialCNResponse",
    "StockFinancialHKPeriod",
    "StockFinancialHKResponse",
    "StockFinancialUSPeriod",
    "StockFinancialUSResponse",
    # 股东信息
    "ShareholderItem",
    "StockShareholders",
    # 资金流向
    "FundFlowPeriod",
    "FundFlowResponse",
    # 批量请求
    "BatchSymbolItem",
    "BatchSpotRequest",
    "StockListItem",
    "MarketFetchResult",
    "StockListResponse",
    # 兼容旧版本
    "StockFinancial",
]
