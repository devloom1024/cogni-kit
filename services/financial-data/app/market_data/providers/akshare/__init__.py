"""akshare Provider 注册"""

from .stock_provider import AkshareStockProvider
from .etf_provider import AkshareETFProvider
from .fund_provider import AkshareFundProvider

__all__ = ["AkshareStockProvider", "AkshareETFProvider", "AkshareFundProvider"]
