"""K线数据模型"""
from pydantic import BaseModel, Field


class KLinePoint(BaseModel):
    """K 线数据点"""
    date: str = Field(..., description="日期 (YYYY-MM-DD)")
    open: float = Field(..., description="开盘价")
    high: float = Field(..., description="最高价")
    low: float = Field(..., description="最低价")
    close: float = Field(..., description="收盘价")
    volume: float = Field(..., description="成交量 (手)")
    amount: float | None = Field(None, description="成交额 (元)")
    change: float | None = Field(None, description="涨跌额 (元)")
    change_percent: float | None = Field(None, description="涨跌幅 (%)", alias="changePercent")
    amplitude: float | None = Field(None, description="振幅 (%)")
    turnover_rate: float | None = Field(None, description="换手率 (%)", alias="turnoverRate")

    class Config:
        populate_by_name = True


class KLineMeta(BaseModel):
    """K 线元数据"""
    symbol: str = Field(..., description="股票代码")
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
