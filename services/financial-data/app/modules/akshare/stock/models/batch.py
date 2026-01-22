"""批量请求和列表响应模型"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from .base import MarketType


class BatchSymbolItem(BaseModel):
    """批量请求股票项"""
    symbol: str = Field(..., description="股票代码")
    market: MarketType = Field(..., description="市场类型")


class BatchSpotRequest(BaseModel):
    """批量行情请求"""
    symbols: list[BatchSymbolItem] = Field(..., description="股票列表", max_length=50)


class StockListItem(BaseModel):
    """股票列表项"""
    symbol: str = Field(..., description="股票代码")
    name: str = Field(..., description="股票名称")
    market: MarketType = Field(..., description="所属市场")


class MarketFetchResult(BaseModel):
    """单个市场的获取结果"""
    market: MarketType = Field(..., description="市场类型")
    fetched: bool = Field(..., description="是否成功获取数据")
    count: int = Field(0, description="获取到的数据条数")
    error: Optional[str] = Field(None, description="错误信息")

    class Config:
        populate_by_name = True


class StockListResponse(BaseModel):
    """股票列表响应（含各市场获取状态）"""
    total_count: int = Field(..., description="总数据条数")
    markets: list[MarketFetchResult] = Field(..., description="各市场获取状态")
    data: list[StockListItem] = Field(..., description="股票列表数据")

    class Config:
        populate_by_name = True


# ==================== 旧版本兼容 ====================
class StockFinancial(BaseModel):
    """财务数据摘要（旧版本）"""
    symbol: str = Field(..., description="股票代码")
    report_date: date = Field(..., description="报告期", alias="reportDate")
    revenue: float | None = Field(None, description="营业收入 (亿元)")
    net_profit: float | None = Field(None, description="净利润 (亿元)", alias="netProfit")
    eps: float | None = Field(None, description="每股收益")
    bvps: float | None = Field(None, description="每股净资产")
    roe: float | None = Field(None, description="ROE (%)")
    gross_margin: float | None = Field(None, description="毛利率 (%)", alias="grossMargin")
    debt_ratio: float | None = Field(None, description="资产负债率 (%)", alias="debtRatio")

    class Config:
        populate_by_name = True
