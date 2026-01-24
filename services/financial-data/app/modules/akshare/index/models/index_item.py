"""指数列表项模型"""

from pydantic import BaseModel, Field
from .market import Market
from .index_type import IndexType


class IndexItem(BaseModel):
    """指数列表项"""

    symbol: str = Field(..., alias="symbol", description="指数代码")
    name: str = Field(..., alias="name", description="指数名称")
    market: Market = Field(..., alias="market", description="市场类型")
    index_type: IndexType | None = Field(
        None, alias="indexType", description="指数类型"
    )

    class Config:
        populate_by_name = True
