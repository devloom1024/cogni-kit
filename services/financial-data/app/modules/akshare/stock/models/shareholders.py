"""股东信息模型"""
from pydantic import BaseModel, Field


class ShareholderItem(BaseModel):
    """股东信息项"""
    name: str = Field(..., description="股东名称")
    shares: float = Field(..., description="持股数 (万股)")
    percentage: float = Field(..., description="持股比例 (%)")
    change: str | None = Field(None, description="变动情况")


class StockShareholders(BaseModel):
    """股东信息（仅A股）"""
    symbol: str = Field(..., description="股票代码")
    shareholderCount: int | None = Field(None, description="股东人数", alias="shareholder_count")
    fundHoldingRatio: float | None = Field(None, description="基金持股比例 (%)", alias="fund_holding_ratio")
    top10Shareholders: list[ShareholderItem] = Field(default_factory=list, description="十大股东", alias="top10_shareholders")
    top10FloatShareholders: list[ShareholderItem] = Field(default_factory=list, description="十大流通股东", alias="top10_float_shareholders")

    class Config:
        populate_by_name = True
