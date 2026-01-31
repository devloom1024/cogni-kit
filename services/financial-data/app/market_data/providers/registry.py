"""Provider 注册与选择逻辑"""

from __future__ import annotations

import logging
from typing import Iterable, Iterator

from .base import StockProvider
from .exceptions import ProviderSelectionError, ProviderUnavailableError

logger = logging.getLogger(__name__)


class ProviderRegistry:
    """Provider 注册表，负责按顺序选择可用实现"""

    def __init__(self):
        self._stock_providers: dict[str, StockProvider] = {}
        self._priority: list[str] = []

    def register_stock_provider(self, name: str, provider: StockProvider):
        self._stock_providers[name] = provider
        if name not in self._priority:
            self._priority.append(name)

    def set_priority(self, names: Iterable[str]):
        self._priority = [name for name in names if name in self._stock_providers]
        # 确保注册表中的 provider 也在优先级中
        for name in self._stock_providers:
            if name not in self._priority:
                self._priority.append(name)

    def iter_stock_providers(self) -> Iterator[StockProvider]:
        """按优先级返回所有注册的股票 Provider"""

        yielded = set()
        for name in self._priority:
            provider = self._stock_providers.get(name)
            if provider and name not in yielded:
                yielded.add(name)
                yield provider

        for name, provider in self._stock_providers.items():
            if name not in yielded:
                yield provider


provider_registry = ProviderRegistry()
