"""港股财务数据模型"""
from pydantic import BaseModel, Field
from typing import Literal
from .base import FinancialPeriodBase


class StockFinancialHKPeriod(FinancialPeriodBase):
    """港股单个报告期财务数据"""
    # 利润表
    revenue: float | None = Field(None, description="收入 (亿港币)")
    profit_before_tax: float | None = Field(None, description="除税前溢利 (亿港币)", alias="profitBeforeTax")
    profit_after_tax: float | None = Field(None, description="除税后溢利 (亿港币)", alias="profitAfterTax")
    profit_attributable: float | None = Field(None, description="公司持有人应占溢利 (亿港币)", alias="profitAttributable")


class StockFinancialHKResponse(BaseModel):
    """港股财务数据响应（多期）"""
    symbol: str = Field(..., description="股票代码")
    market: Literal["HK"] = Field(default="HK", description="市场类型", alias="market")
    currency: Literal["HKD"] = Field(default="HKD", description="货币单位", alias="currency")
    count: int = Field(..., description="返回的报告期数量")
    data: list[StockFinancialHKPeriod] = Field(..., description="财务数据列表")

    class Config:
        populate_by_name = True
