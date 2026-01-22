"""估值数据模型"""
from pydantic import BaseModel, Field


class StockValuation(BaseModel):
    """估值数据"""
    symbol: str = Field(..., description="股票代码")
    market_cap: float | None = Field(None, description="总市值 (亿元)", alias="marketCap")
    float_market_cap: float | None = Field(None, description="流通市值 (亿元)", alias="floatMarketCap")
    pe: float | None = Field(None, description="市盈率")
    pb: float | None = Field(None, description="市净率")
    dividend_yield: float | None = Field(None, description="股息率 (%)", alias="dividendYield")
    change_60d: float | None = Field(None, description="60日涨跌幅 (%)", alias="change60d")
    change_ytd: float | None = Field(None, description="年初至今涨跌幅 (%)", alias="changeYtd")

    class Config:
        populate_by_name = True
