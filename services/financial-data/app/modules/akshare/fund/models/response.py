"""场外基金响应模型"""

from typing import List
from pydantic import BaseModel, Field
from .fund_item import FundItem


class FundListResponse(BaseModel):
    """场外基金列表响应"""

    data: List[FundItem] = Field(..., description="场外基金列表")
    count: int = Field(..., description="总数")

    class Config:
        json_schema_extra = {
            "example": {
                "data": [
                    {
                        "symbol": "005827",
                        "name": "易方达蓝筹精选混合",
                        "fundType": "MIXED",
                        "pinyinInitial": "YFXLJXHH",
                        "pinyinFull": "yi fang da lan li jing xuan hun he"
                    }
                ],
                "count": 10000
            }
        }
