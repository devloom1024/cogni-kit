"""估值数据模型"""
from pydantic import BaseModel, Field


class StockValuation(BaseModel):
    """估值数据"""
    symbol: str = Field(..., description="股票代码")
    marketCap: float | None = Field(None, description="总市值 (亿元)", alias="market_cap")
    floatMarketCap: float | None = Field(None, description="流通市值 (亿元)", alias="float_market_cap")
    pe: float | None = Field(None, description="市盈率")
    pb: float | None = Field(None, description="市净率")
    dividendYield: float | None = Field(None, description="股息率 (%)", alias="dividend_yield")
    change60d: float | None = Field(None, description="60日涨跌幅 (%)", alias="change_60d")
    changeYtd: float | None = Field(None, description="年初至今涨跌幅 (%)", alias="change_ytd")

    class Config:
        populate_by_name = True
