"""AkShare 模块 - 按资产类型分组"""

from app.modules.akshare.stock import router as stock_router
from app.modules.akshare.etf import router as etf_router
from app.modules.akshare.fund import router as fund_router

__all__ = ["stock_router", "etf_router", "fund_router"]
