"""A股财务数据模型"""
from pydantic import BaseModel, Field
from typing import Literal
from .base import FinancialPeriodBase


class StockFinancialCNPeriod(FinancialPeriodBase):
    """A股单个报告期财务数据"""
    # 利润表
    revenue: float | None = Field(None, description="营业总收入 (亿元)")
    operating_cost: float | None = Field(None, description="营业成本 (亿元)", alias="operatingCost")
    gross_profit: float | None = Field(None, description="毛利 (亿元)", alias="grossProfit")
    operating_profit: float | None = Field(None, description="营业利润 (亿元)", alias="operatingProfit")
    net_profit: float | None = Field(None, description="净利润 (亿元)", alias="netProfit")
    net_profit_attributable: float | None = Field(None, description="归母净利润 (亿元)", alias="netProfitAttributable")
    deducted_net_profit: float | None = Field(None, description="扣非净利润 (亿元)", alias="deductedNetProfit")
    # 盈利能力扩展
    gross_margin: float | None = Field(None, description="毛利率 (%)", alias="grossMargin")
    roa: float | None = Field(None, description="总资产收益率 ROA (%)")
    # 偿债能力
    total_assets: float | None = Field(None, description="总资产 (亿元)", alias="totalAssets")
    total_liabilities: float | None = Field(None, description="总负债 (亿元)", alias="totalLiabilities")
    debt_ratio: float | None = Field(None, description="资产负债率 (%)", alias="debtRatio")
    current_ratio: float | None = Field(None, description="流动比率", alias="currentRatio")
    quick_ratio: float | None = Field(None, description="速动比率", alias="quickRatio")
    # 营运能力
    turnover_rate: float | None = Field(None, description="总资产周转率", alias="turnoverRate")
    inventory_turnover: float | None = Field(None, description="存货周转率", alias="inventoryTurnover")
    receivable_turnover: float | None = Field(None, description="应收账款周转率", alias="receivableTurnover")
    # 现金流
    operating_cf: float | None = Field(None, description="经营现金流 (亿元)", alias="operatingCF")
    investing_cf: float | None = Field(None, description="投资现金流 (亿元)", alias="investingCF")
    financing_cf: float | None = Field(None, description="融资现金流 (亿元)", alias="financingCF")
    net_cf: float | None = Field(None, description="净现金流 (亿元)", alias="netCF")
    net_cf_per_share: float | None = Field(None, description="每股经营现金流 (元)", alias="netCFPerShare")


class StockFinancialCNResponse(BaseModel):
    """A股财务数据响应（多期）"""
    symbol: str = Field(..., description="股票代码")
    market: Literal["CN"] = Field(default="CN", description="市场类型", alias="market")
    count: int = Field(..., description="返回的报告期数量")
    data: list[StockFinancialCNPeriod] = Field(..., description="财务数据列表")

    class Config:
        populate_by_name = True
