"""实时行情模型"""
from pydantic import BaseModel, Field
from datetime import datetime


class StockSpot(BaseModel):
    """股票实时行情(含五档盘口)"""
    # 基本信息
    symbol: str = Field(..., description="股票代码")
    name: str | None = Field(None, description="股票名称")

    # 价格信息
    price: float = Field(..., description="最新价")
    open: float = Field(..., description="今开")
    prev_close: float = Field(..., description="昨收", alias="prevClose")
    high: float = Field(..., description="最高")
    low: float = Field(..., description="最低")
    avg_price: float | None = Field(None, description="均价", alias="avgPrice")

    # 成交信息
    volume: float = Field(..., description="成交量(手)")
    amount: float = Field(..., description="成交额(元)")

    # 涨跌信息
    change: float = Field(..., description="涨跌额")
    change_percent: float = Field(..., description="涨跌幅 (%)", alias="changePercent")

    # 技术指标
    turnover_rate: float | None = Field(None, description="换手率 (%)", alias="turnoverRate")
    amplitude: float | None = Field(None, description="振幅 (%)")
    volume_ratio: float | None = Field(None, description="量比", alias="volumeRatio")

    # 涨跌停
    upper_limit: float | None = Field(None, description="涨停价", alias="upperLimit")
    lower_limit: float | None = Field(None, description="跌停价", alias="lowerLimit")

    # 内外盘
    outer_volume: float | None = Field(None, description="外盘(手)", alias="outerVolume")
    inner_volume: float | None = Field(None, description="内盘(手)", alias="innerVolume")

    # 五档买盘
    bid1: float | None = Field(None, description="买一价")
    bid1_volume: float | None = Field(None, description="买一量(手)", alias="bid1Volume")
    bid2: float | None = Field(None, description="买二价")
    bid2_volume: float | None = Field(None, description="买二量(手)", alias="bid2Volume")
    bid3: float | None = Field(None, description="买三价")
    bid3_volume: float | None = Field(None, description="买三量(手)", alias="bid3Volume")
    bid4: float | None = Field(None, description="买四价")
    bid4_volume: float | None = Field(None, description="买四量(手)", alias="bid4Volume")
    bid5: float | None = Field(None, description="买五价")
    bid5_volume: float | None = Field(None, description="买五量(手)", alias="bid5Volume")

    # 五档卖盘
    ask1: float | None = Field(None, description="卖一价")
    ask1_volume: float | None = Field(None, description="卖一量(手)", alias="ask1Volume")
    ask2: float | None = Field(None, description="卖二价")
    ask2_volume: float | None = Field(None, description="卖二量(手)", alias="ask2Volume")
    ask3: float | None = Field(None, description="卖三价")
    ask3_volume: float | None = Field(None, description="卖三量(手)", alias="ask3Volume")
    ask4: float | None = Field(None, description="卖四价")
    ask4_volume: float | None = Field(None, description="卖四量(手)", alias="ask4Volume")
    ask5: float | None = Field(None, description="卖五价")
    ask5_volume: float | None = Field(None, description="卖五量(手)", alias="ask5Volume")

    # 状态信息
    timestamp: datetime = Field(..., description="数据更新时间")

    class Config:
        populate_by_name = True


class PriceLevel(BaseModel):
    """价格档位"""
    price: float = Field(..., description="价格")
    volume: float = Field(..., description="数量 (手)")


class BidAsk(BaseModel):
    """五档盘口（仅A股）"""
    symbol: str = Field(..., description="股票代码")
    bids: list[PriceLevel] = Field(..., description="买盘五档")
    asks: list[PriceLevel] = Field(..., description="卖盘五档")
    upper_limit: float | None = Field(None, description="涨停价", alias="upperLimit")
    lower_limit: float | None = Field(None, description="跌停价", alias="lowerLimit")
    outer_volume: float | None = Field(None, description="外盘", alias="outerVolume")
    inner_volume: float | None = Field(None, description="内盘", alias="innerVolume")

    class Config:
        populate_by_name = True
