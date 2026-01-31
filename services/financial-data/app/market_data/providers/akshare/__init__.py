"""akshare Provider 注册"""

from .stock_provider import AkshareStockProvider
from .etf_provider import AkshareETFProvider

__all__ = ["AkshareStockProvider", "AkshareETFProvider"]
