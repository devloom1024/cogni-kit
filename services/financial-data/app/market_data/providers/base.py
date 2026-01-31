"""Provider 基础抽象"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

from .exceptions import ProviderUnavailableError

if TYPE_CHECKING:  # pragma: no cover - 仅类型提示
    from app.market_data.stock.models import StockItem


class StockProvider(ABC):
    """股票数据 Provider 抽象"""

    name: str

    @abstractmethod
    async def get_stock_list(self) -> list[StockItem]:
        """返回股票列表。如无法提供数据应抛出 ProviderUnavailableError"""

    def handle_error(self, exc: Exception) -> ProviderUnavailableError:
        """统一错误转换，子类可覆盖提供更精确信息"""
        detail = str(exc) or exc.__class__.__name__
        return ProviderUnavailableError(self.name, detail)
