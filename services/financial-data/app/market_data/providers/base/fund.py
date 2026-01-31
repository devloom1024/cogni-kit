"""基金 Provider 抽象"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

from .core import BaseProvider

if TYPE_CHECKING:  # pragma: no cover
    from app.market_data.fund.models.fund_item import FundItem


class FundProvider(BaseProvider, ABC):
    """基金数据 Provider 抽象"""

    @abstractmethod
    async def get_fund_list(self) -> list[FundItem]:
        ...
