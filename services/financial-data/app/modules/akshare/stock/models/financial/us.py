"""美股财务数据模型"""
from pydantic import BaseModel, Field
from typing import Literal
from .base import FinancialPeriodBase


class StockFinancialUSPeriod(FinancialPeriodBase):
    """美股单个报告期财务数据"""
    # 利润表
    total_revenue: float | None = Field(None, description="总营收 (百万美元)", alias="totalRevenue")
    cost_of_revenue: float | None = Field(None, description="营收成本 (百万美元)", alias="costOfRevenue")
    gross_profit: float | None = Field(None, description="毛利 (百万美元)", alias="grossProfit")
    operating_income: float | None = Field(None, description="营业利润 (百万美元)", alias="operatingIncome")
    net_income: float | None = Field(None, description="净利润 (百万美元)", alias="netIncome")
    # 盈利能力扩展
    gross_margin: float | None = Field(None, description="毛利率 (%)", alias="grossMargin")


class StockFinancialUSResponse(BaseModel):
    """美股财务数据响应（多期）"""
    symbol: str = Field(..., description="股票代码")
    market: Literal["US"] = Field(default="US", description="市场类型", alias="market")
    currency: Literal["USD"] = Field(default="USD", description="货币单位", alias="currency")
    count: int = Field(..., description="返回的报告期数量")
    data: list[StockFinancialUSPeriod] = Field(..., description="财务数据列表")

    class Config:
        populate_by_name = True
