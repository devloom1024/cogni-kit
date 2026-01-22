"""财务数据基础模型"""
from pydantic import BaseModel, Field
from datetime import date


class FinancialPeriodBase(BaseModel):
    """财务报告期基础模型"""
    report_date: date = Field(..., description="报告期", alias="reportDate")
    report_name: str = Field(..., description="报告名称", alias="reportName")
    # 盈利能力
    eps: float | None = Field(None, description="每股收益")
    net_margin: float | None = Field(None, description="净利润率 (%)", alias="netMargin")
    roe: float | None = Field(None, description="净资产收益率 (%)")

    class Config:
        populate_by_name = True
