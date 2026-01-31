"""Provider 注册入口"""

from app.market_data.config import market_data_settings
from app.market_data.providers.registry import provider_registry
from app.market_data.providers.akshare import AkshareStockProvider

# 注册 akshare Provider
_akshare_stock_provider = AkshareStockProvider()
provider_registry.register_stock_provider(_akshare_stock_provider.name, _akshare_stock_provider)

# 设置优先级（确保至少包含 akshare）
provider_registry.set_priority(market_data_settings.stock_provider_priority)

__all__ = ["provider_registry"]
