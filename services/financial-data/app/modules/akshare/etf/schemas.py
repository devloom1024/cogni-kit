"""ETF 数据模型"""
from pydantic import BaseModel, Field
from datetime import datetime


class EtfListItem(BaseModel):
    """ETF 列表项"""
    symbol: str = Field(..., description="ETF 代码")
    name: str = Field(..., description="ETF 名称")


class EtfSpot(BaseModel):
    """ETF 实时行情"""
    symbol: str = Field(..., description="ETF 代码")
    name: str = Field(..., description="ETF 名称")
    price: float = Field(..., description="最新价")
    open: float = Field(..., description="今开")
    prev_close: float = Field(..., description="昨收", alias="prevClose")
    high: float = Field(..., description="最高")
    low: float = Field(..., description="最低")
    volume: float = Field(..., description="成交量")
    amount: float = Field(..., description="成交额")
    change: float = Field(..., description="涨跌额")
    change_percent: float = Field(..., description="涨跌幅 (%)", alias="changePercent")
    iopv: float = Field(0, description="IOPV 实时估值", alias="iopv")
    discount_rate: float = Field(0, description="基金折价率 (%)", alias="discountRate")
    timestamp: datetime = Field(..., description="数据更新时间")

    class Config:
        populate_by_name = True


# ==================== K 线 ====================
class KLinePoint(BaseModel):
    """K 线数据点"""
    date: str = Field(..., description="日期 (YYYY-MM-DD)")
    open: float = Field(..., description="开盘价")
    high: float = Field(..., description="最高价")
    low: float = Field(..., description="最低价")
    close: float = Field(..., description="收盘价")
    volume: float = Field(..., description="成交量")


class KLineMeta(BaseModel):
    """K 线元数据"""
    symbol: str = Field(..., description="ETF 代码")
    period: str = Field(..., description="K 线周期 (day/week/month)")
    count: int = Field(..., description="数据条数")
    first_date: str = Field(..., description="首条数据日期", alias="firstDate")
    last_date: str = Field(..., description="最后一条数据日期", alias="lastDate")

    class Config:
        populate_by_name = True


class KLineResponse(BaseModel):
    """K 线响应"""
    data: list[KLinePoint] = Field(..., description="K 线数据")
    meta: KLineMeta = Field(..., description="元数据")
