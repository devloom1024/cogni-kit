"""LOF 响应模型"""

from typing import List
from pydantic import BaseModel, Field
from .lof_item import LOFItem


class LOFListResponse(BaseModel):
    """LOF 列表响应"""

    data: List[LOFItem] = Field(..., description="LOF列表")
    count: int = Field(..., description="总数")

    class Config:
        json_schema_extra = {
            "example": {
                "data": [
                    {
                        "symbol": "161039",
                        "name": "易方达中小盘LOF",
                        "market": "CN",
                        "exchange": "SZSE",
                        "fundCompany": "易方达基金"
                    }
                ],
                "count": 200
            }
        }
