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
    prevClose: float = Field(..., description="昨收", alias="prev_close")
    high: float = Field(..., description="最高")
    low: float = Field(..., description="最低")
    volume: float = Field(..., description="成交量")
    amount: float = Field(..., description="成交额")
    change: float = Field(..., description="涨跌额")
    changePercent: float = Field(..., description="涨跌幅 (%)", alias="change_percent")
    timestamp: datetime = Field(..., description="数据更新时间")
    
    class Config:
        populate_by_name = True
