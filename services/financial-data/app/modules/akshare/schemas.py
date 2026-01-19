"""AkShare 模块数据模型"""
from pydantic import BaseModel, Field
from typing import Literal
from datetime import date, datetime


# ==================== 枚举类型 ====================
MarketType = Literal["CN", "HK", "US"]
FundType = Literal["ETF", "FUND"]
TradingStatus = Literal["TRADING", "CLOSED", "SUSPENDED"]


# ==================== 股票模型 ====================
class StockInfo(BaseModel):
    """股票基本信息"""
    symbol: str = Field(..., description="股票代码")
    name: str = Field(..., description="股票名称")
    market: MarketType = Field(..., description="所属市场")


class RealtimeQuote(BaseModel):
    """实时行情"""
    price: float = Field(..., description="最新价")
    open: float = Field(..., description="今开")
    prevClose: float = Field(..., description="昨收", alias="prev_close")
    high: float = Field(..., description="最高")
    low: float = Field(..., description="最低")
    volume: float = Field(..., description="成交量")
    amount: float = Field(..., description="成交额")
    change: float = Field(..., description="涨跌额")
    changePercent: float = Field(..., description="涨跌幅", alias="change_percent")
    turnoverRate: float | None = Field(None, description="换手率", alias="turnover_rate")
    marketCap: float | None = Field(None, description="总市值", alias="market_cap")
    pe: float | None = Field(None, description="市盈率")
    pb: float | None = Field(None, description="市净率")
    tradingStatus: TradingStatus = Field(..., description="交易状态", alias="trading_status")
    timestamp: datetime = Field(..., description="数据更新时间")
    
    class Config:
        populate_by_name = True


class KLinePoint(BaseModel):
    """K 线数据点"""
    timestamp: int = Field(..., description="时间戳 (毫秒)")
    open: float = Field(..., description="开盘价")
    high: float = Field(..., description="最高价")
    low: float = Field(..., description="最低价")
    close: float = Field(..., description="收盘价")
    volume: float = Field(..., description="成交量")


# ==================== 基金模型 ====================
class FundInfo(BaseModel):
    """基金基本信息"""
    symbol: str = Field(..., description="基金代码")
    name: str = Field(..., description="基金名称")
    type: FundType = Field(..., description="基金类型")


class FundDetail(BaseModel):
    """基金详细信息"""
    symbol: str = Field(..., description="基金代码")
    name: str = Field(..., description="基金名称")
    type: FundType = Field(..., description="基金类型")
    manager: str | None = Field(None, description="基金经理")
    scale: float | None = Field(None, description="基金规模 (亿元)")
    establishmentDate: date | None = Field(None, description="成立日期", alias="establishment_date")
    riskLevel: str | None = Field(None, description="风险等级", alias="risk_level")
    
    class Config:
        populate_by_name = True


class FundNav(BaseModel):
    """基金净值"""
    symbol: str = Field(..., description="基金代码")
    nav: float = Field(..., description="单位净值")
    accNav: float = Field(..., description="累计净值", alias="acc_nav")
    dailyReturn: float = Field(..., description="日增长率 (%)", alias="daily_return")
    navDate: date = Field(..., description="净值日期", alias="nav_date")
    
    class Config:
        populate_by_name = True


class FundHolding(BaseModel):
    """基金持仓"""
    symbol: str = Field(..., description="持仓股票代码")
    name: str = Field(..., description="持仓股票名称")
    percentage: float = Field(..., description="持仓占比 (%)")
    reportDate: date = Field(..., description="报告期", alias="report_date")
    
    class Config:
        populate_by_name = True
