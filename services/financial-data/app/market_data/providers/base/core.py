"""Provider 抽象层"""

from __future__ import annotations

from abc import ABC
from typing import Protocol

from app.market_data.providers.exceptions import ProviderUnavailableError


class MarketDataProvider(Protocol):
    """所有 Provider 的通用字段/方法"""

    name: str

    def handle_error(self, exc: Exception) -> ProviderUnavailableError:
        """将底层异常转换为统一异常"""
        ...


class BaseProvider(ABC):
    """默认实现 handle_error，子类可覆盖"""

    name: str

    def handle_error(self, exc: Exception) -> ProviderUnavailableError:
        detail = str(exc) or exc.__class__.__name__
        return ProviderUnavailableError(self.name, detail)
