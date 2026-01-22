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
    prevClose: float = Field(..., description="昨收", alias="prev_close")
    high: float = Field(..., description="最高")
    low: float = Field(..., description="最低")
    avgPrice: float | None = Field(None, description="均价", alias="avg_price")

    # 成交信息
    volume: float = Field(..., description="成交量(手)")
    amount: float = Field(..., description="成交额(元)")

    # 涨跌信息
    change: float = Field(..., description="涨跌额")
    changePercent: float = Field(..., description="涨跌幅 (%)", alias="change_percent")

    # 技术指标
    turnoverRate: float | None = Field(None, description="换手率 (%)", alias="turnover_rate")
    amplitude: float | None = Field(None, description="振幅 (%)")
    volumeRatio: float | None = Field(None, description="量比", alias="volume_ratio")

    # 涨跌停
    upperLimit: float | None = Field(None, description="涨停价", alias="upper_limit")
    lowerLimit: float | None = Field(None, description="跌停价", alias="lower_limit")

    # 内外盘
    outerVolume: float | None = Field(None, description="外盘(手)", alias="outer_volume")
    innerVolume: float | None = Field(None, description="内盘(手)", alias="inner_volume")

    # 五档买盘
    bid1: float | None = Field(None, description="买一价")
    bid1Volume: float | None = Field(None, description="买一量(手)", alias="bid1_volume")
    bid2: float | None = Field(None, description="买二价")
    bid2Volume: float | None = Field(None, description="买二量(手)", alias="bid2_volume")
    bid3: float | None = Field(None, description="买三价")
    bid3Volume: float | None = Field(None, description="买三量(手)", alias="bid3_volume")
    bid4: float | None = Field(None, description="买四价")
    bid4Volume: float | None = Field(None, description="买四量(手)", alias="bid4_volume")
    bid5: float | None = Field(None, description="买五价")
    bid5Volume: float | None = Field(None, description="买五量(手)", alias="bid5_volume")

    # 五档卖盘
    ask1: float | None = Field(None, description="卖一价")
    ask1Volume: float | None = Field(None, description="卖一量(手)", alias="ask1_volume")
    ask2: float | None = Field(None, description="卖二价")
    ask2Volume: float | None = Field(None, description="卖二量(手)", alias="ask2_volume")
    ask3: float | None = Field(None, description="卖三价")
    ask3Volume: float | None = Field(None, description="卖三量(手)", alias="ask3_volume")
    ask4: float | None = Field(None, description="卖四价")
    ask4Volume: float | None = Field(None, description="卖四量(手)", alias="ask4_volume")
    ask5: float | None = Field(None, description="卖五价")
    ask5Volume: float | None = Field(None, description="卖五量(手)", alias="ask5_volume")

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
    upperLimit: float | None = Field(None, description="涨停价", alias="upper_limit")
    lowerLimit: float | None = Field(None, description="跌停价", alias="lower_limit")
    outerVolume: float | None = Field(None, description="外盘", alias="outer_volume")
    innerVolume: float | None = Field(None, description="内盘", alias="inner_volume")

    class Config:
        populate_by_name = True
