"""A股列表项模型"""

from pydantic import BaseModel, Field
from .market import Market
from .exchange import Exchange


class StockItem(BaseModel):
    """A股列表项"""

    symbol: str = Field(..., alias="symbol", description="股票代码")
    name: str = Field(..., alias="name", description="股票名称")
    market: Market = Field(..., alias="market", description="市场类型")
    exchange: Exchange | None = Field(None, alias="exchange", description="交易所")

    class Config:
        populate_by_name = True
