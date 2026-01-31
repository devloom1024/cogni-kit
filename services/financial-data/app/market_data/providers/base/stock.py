"""股票 Provider 抽象"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

from .core import BaseProvider

if TYPE_CHECKING:  # pragma: no cover
    from app.market_data.stock.models import StockItem


class StockProvider(BaseProvider, ABC):
    """股票数据 Provider 抽象"""

    @abstractmethod
    async def get_stock_list(self) -> list[StockItem]:
        ...
