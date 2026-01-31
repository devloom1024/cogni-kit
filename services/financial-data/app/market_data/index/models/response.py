"""指数响应模型"""

from typing import List
from pydantic import BaseModel, Field
from .index_item import IndexItem


class IndexListResponse(BaseModel):
    """指数列表响应"""

    data: List[IndexItem] = Field(..., description="指数列表")
    count: int = Field(..., description="总数")

    class Config:
        json_schema_extra = {
            "example": {
                "data": [
                    {
                        "symbol": "000001",
                        "name": "上证指数",
                        "market": "CN",
                        "indexType": "BROAD"
                    },
                    {
                        "symbol": "399001",
                        "name": "深证成指",
                        "market": "CN",
                        "indexType": "BROAD"
                    }
                ],
                "count": 500
            }
        }
