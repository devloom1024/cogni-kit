"""LOF Provider 抽象"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

from .core import BaseProvider

if TYPE_CHECKING:  # pragma: no cover
    from app.market_data.lof.models.lof_item import LOFItem


class LOFProvider(BaseProvider, ABC):
    """LOF 数据 Provider 抽象"""

    @abstractmethod
    async def get_lof_list(self) -> list[LOFItem]:
        ...
