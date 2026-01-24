"""LOF 列表项模型"""

from pydantic import BaseModel, Field
from .market import Market
from .exchange import Exchange


class LOFItem(BaseModel):
    """LOF列表项"""

    symbol: str = Field(..., alias="symbol", description="LOF代码")
    name: str = Field(..., alias="name", description="LOF名称")
    market: Market = Field(..., alias="market", description="市场类型")
    exchange: Exchange | None = Field(None, alias="exchange", description="交易所")
    fund_company: str | None = Field(None, alias="fundCompany", description="基金公司")

    class Config:
        populate_by_name = True
