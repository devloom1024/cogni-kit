"""Provider 注册入口"""

from app.market_data.config import market_data_settings
from app.market_data.providers.registry import provider_registry
from app.market_data.providers.akshare import (
    AkshareStockProvider,
    AkshareETFProvider,
    AkshareFundProvider,
)

# 注册 akshare Provider
_akshare_stock_provider = AkshareStockProvider()
provider_registry.register_stock_provider(_akshare_stock_provider.name, _akshare_stock_provider)

_akshare_etf_provider = AkshareETFProvider()
provider_registry.register_etf_provider(_akshare_etf_provider.name, _akshare_etf_provider)

_akshare_fund_provider = AkshareFundProvider()
provider_registry.register_fund_provider(_akshare_fund_provider.name, _akshare_fund_provider)

# 设置优先级（确保至少包含 akshare）
provider_registry.set_stock_priority(market_data_settings.stock_provider_priority)
provider_registry.set_etf_priority(market_data_settings.etf_provider_priority)
provider_registry.set_fund_priority(market_data_settings.fund_provider_priority)

__all__ = ["provider_registry"]
