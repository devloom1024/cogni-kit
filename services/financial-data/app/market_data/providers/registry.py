"""Provider 注册与选择逻辑"""

from __future__ import annotations

import logging
from typing import Dict, Iterable, Iterator, TypeVar

from app.market_data.providers.base import ETFProvider, FundProvider, StockProvider

logger = logging.getLogger(__name__)

T = TypeVar("T")


class ProviderRegistry:
    """Provider 注册表，负责按顺序选择可用实现"""

    def __init__(self):
        self._stock_providers: dict[str, StockProvider] = {}
        self._stock_priority: list[str] = []
        self._etf_providers: dict[str, ETFProvider] = {}
        self._etf_priority: list[str] = []
        self._fund_providers: dict[str, FundProvider] = {}
        self._fund_priority: list[str] = []

    def register_stock_provider(self, name: str, provider: StockProvider):
        self._stock_providers[name] = provider
        if name not in self._stock_priority:
            self._stock_priority.append(name)

    def register_etf_provider(self, name: str, provider: ETFProvider):
        self._etf_providers[name] = provider
        if name not in self._etf_priority:
            self._etf_priority.append(name)

    def register_fund_provider(self, name: str, provider: FundProvider):
        self._fund_providers[name] = provider
        if name not in self._fund_priority:
            self._fund_priority.append(name)

    def set_stock_priority(self, names: Iterable[str]):
        self._stock_priority = [name for name in names if name in self._stock_providers]
        for name in self._stock_providers:
            if name not in self._stock_priority:
                self._stock_priority.append(name)

    def set_etf_priority(self, names: Iterable[str]):
        self._etf_priority = [name for name in names if name in self._etf_providers]
        for name in self._etf_providers:
            if name not in self._etf_priority:
                self._etf_priority.append(name)

    def set_fund_priority(self, names: Iterable[str]):
        self._fund_priority = [name for name in names if name in self._fund_providers]
        for name in self._fund_providers:
            if name not in self._fund_priority:
                self._fund_priority.append(name)

    def iter_stock_providers(self) -> Iterator[StockProvider]:
        yield from self._iter_by_priority(self._stock_priority, self._stock_providers)

    def iter_etf_providers(self) -> Iterator[ETFProvider]:
        yield from self._iter_by_priority(self._etf_priority, self._etf_providers)

    def iter_fund_providers(self) -> Iterator[FundProvider]:
        yield from self._iter_by_priority(self._fund_priority, self._fund_providers)

    def _iter_by_priority(self, priority: list[str], items: Dict[str, T]) -> Iterator[T]:
        yielded = set()
        for name in priority:
            provider = items.get(name)
            if provider and name not in yielded:
                yielded.add(name)
                yield provider

        for name, provider in items.items():
            if name not in yielded:
                yield provider


provider_registry = ProviderRegistry()
