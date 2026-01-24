"""A股响应模型"""

from typing import List
from pydantic import BaseModel, Field
from .stock_item import StockItem


class StockListResponse(BaseModel):
    """A股列表响应"""

    data: List[StockItem] = Field(..., description="A股列表")
    count: int = Field(..., description="总数")

    class Config:
        json_schema_extra = {
            "example": {
                "data": [
                    {
                        "symbol": "600519",
                        "name": "贵州茅台",
                        "market": "CN",
                        "exchange": "SSE"
                    },
                    {
                        "symbol": "000001",
                        "name": "上证指数",
                        "market": "CN",
                        "exchange": "SSE"
                    }
                ],
                "count": 5000
            }
        }
