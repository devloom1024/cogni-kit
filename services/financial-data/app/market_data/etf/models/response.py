"""ETF 响应模型"""

from typing import List
from pydantic import BaseModel, Field
from .etf_item import ETFItem


class ETFListResponse(BaseModel):
    """ETF 列表响应"""

    data: List[ETFItem] = Field(..., description="ETF列表")
    count: int = Field(..., description="总数")

    class Config:
        json_schema_extra = {
            "example": {
                "data": [
                    {
                        "symbol": "510500",
                        "name": "中证500ETF",
                        "market": "CN",
                        "exchange": "SSE",
                        "fundCompany": "华夏基金"
                    }
                ],
                "count": 300
            }
        }
