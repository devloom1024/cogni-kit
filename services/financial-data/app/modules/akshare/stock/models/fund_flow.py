"""资金流向模型"""
from pydantic import BaseModel, Field


class FundFlowPeriod(BaseModel):
    """单日资金流向数据"""
    date: str = Field(..., description="日期 (YYYY-MM-DD)", alias="date")
    close: float | None = Field(None, description="收盘价")
    change_percent: float | None = Field(None, description="涨跌幅 (%)", alias="changePercent")
    main_net_inflow: float = Field(..., description="主力净流入 (万元)", alias="mainNetInflow")
    main_net_inflow_ratio: float | None = Field(None, description="主力净流入占比 (%)", alias="mainNetInflowRatio")
    super_large_net_inflow: float | None = Field(None, description="超大单净流入 (万元)", alias="superLargeNetInflow")
    super_large_net_inflow_ratio: float | None = Field(None, description="超大单净流入占比 (%)", alias="superLargeNetInflowRatio")
    large_net_inflow: float | None = Field(None, description="大单净流入 (万元)", alias="largeNetInflow")
    large_net_inflow_ratio: float | None = Field(None, description="大单净流入占比 (%)", alias="largeNetInflowRatio")
    medium_net_inflow: float | None = Field(None, description="中单净流入 (万元)", alias="mediumNetInflow")
    medium_net_inflow_ratio: float | None = Field(None, description="中单净流入占比 (%)", alias="mediumNetInflowRatio")
    small_net_inflow: float | None = Field(None, description="小单净流入 (万元)", alias="smallNetInflow")
    small_net_inflow_ratio: float | None = Field(None, description="小单净流入占比 (%)", alias="smallNetInflowRatio")

    class Config:
        populate_by_name = True


class FundFlowResponse(BaseModel):
    """资金流向响应（多期）"""
    symbol: str = Field(..., description="股票代码")
    market: str = Field(default="CN", description="市场类型")
    count: int = Field(..., description="返回的数据条数")
    data: list[FundFlowPeriod] = Field(..., description="资金流向数据列表")

    class Config:
        populate_by_name = True
