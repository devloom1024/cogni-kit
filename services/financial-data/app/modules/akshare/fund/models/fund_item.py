"""场外基金列表项模型"""

from pydantic import BaseModel, Field
from app.modules.akshare.common.utils.fund_type_map import FundTypeLiteral


class FundItem(BaseModel):
    """场外基金列表项"""

    symbol: str = Field(..., alias="symbol", description="基金代码")
    name: str = Field(..., alias="name", description="基金名称")
    fund_type: FundTypeLiteral | None = Field(None, alias="fundType", description="基金类型")
    pinyin_initial: str | None = Field(
        None, alias="pinyinInitial", description="拼音首字母"
    )
    pinyin_full: str | None = Field(None, alias="pinyinFull", description="完整拼音")

    class Config:
        populate_by_name = True

