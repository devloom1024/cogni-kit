"""场外基金数据模型"""
from pydantic import BaseModel, Field
from datetime import date


class FundListItem(BaseModel):
    """基金列表项"""
    symbol: str = Field(..., description="基金代码")
    name: str = Field(..., description="基金名称")


class FundNav(BaseModel):
    """基金净值"""
    symbol: str = Field(..., description="基金代码")
    nav: float = Field(..., description="单位净值")
    accNav: float = Field(..., description="累计净值", alias="acc_nav")
    dailyReturn: float = Field(..., description="日增长率 (%)", alias="daily_return")
    navDate: date = Field(..., description="净值日期", alias="nav_date")
    
    class Config:
        populate_by_name = True


class FundDetail(BaseModel):
    """基金详细信息"""
    symbol: str = Field(..., description="基金代码")
    name: str = Field(..., description="基金名称")
    manager: str | None = Field(None, description="基金经理")
    scale: float | None = Field(None, description="基金规模 (亿元)")
    establishmentDate: date | None = Field(None, description="成立日期", alias="establishment_date")
    riskLevel: str | None = Field(None, description="风险等级", alias="risk_level")
    
    class Config:
        populate_by_name = True


class FundHolding(BaseModel):
    """基金持仓"""
    symbol: str = Field(..., description="持仓股票代码")
    name: str = Field(..., description="持仓股票名称")
    percentage: float = Field(..., description="持仓占比 (%)")
    reportDate: date = Field(..., description="报告期", alias="report_date")
    
    class Config:
        populate_by_name = True
