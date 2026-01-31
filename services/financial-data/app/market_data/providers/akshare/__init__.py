"""akshare Provider 注册"""

from .stock_provider import AkshareStockProvider
from .etf_provider import AkshareETFProvider
from .fund_provider import AkshareFundProvider
from .lof_provider import AkshareLOFProvider
from .index_provider import AkshareIndexProvider

__all__ = [
    "AkshareStockProvider",
    "AkshareETFProvider",
    "AkshareFundProvider",
    "AkshareLOFProvider",
    "AkshareIndexProvider",
]
