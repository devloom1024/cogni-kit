"""指数 Provider 抽象"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

from .core import BaseProvider

if TYPE_CHECKING:  # pragma: no cover
    from app.market_data.index.models.index_item import IndexItem


class IndexProvider(BaseProvider, ABC):
    """指数数据 Provider 抽象"""

    @abstractmethod
    async def get_index_list(self, category: str | None = None) -> list[IndexItem]:
        ...
