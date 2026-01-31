"""ETF Provider 抽象"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

from .core import BaseProvider

if TYPE_CHECKING:  # pragma: no cover
    from app.market_data.etf.models.etf_item import ETFItem


class ETFProvider(BaseProvider, ABC):
    """ETF 数据 Provider 抽象"""

    @abstractmethod
    async def get_etf_list(self) -> list[ETFItem]:
        ...
