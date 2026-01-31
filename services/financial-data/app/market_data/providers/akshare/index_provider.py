"""Akshare 指数 Provider"""

from __future__ import annotations

from typing import Optional

from app.market_data.index.models import IndexItem
from app.market_data.providers.akshare.index_client import IndexClient, ServiceError
from app.market_data.providers.base import IndexProvider


class AkshareIndexProvider(IndexProvider):
    """基于 akshare 的指数实现"""

    name = "akshare"

    def __init__(self):
        self._client = IndexClient()

    async def get_index_list(self, category: Optional[str] = None) -> list[IndexItem]:
        try:
            if category:
                raw = await self._client.get_index_by_category(category)
            else:
                raw = await self._client.get_index_list()
        except ServiceError as exc:
            raise self.handle_error(exc) from exc
        except Exception as exc:  # pragma: no cover
            raise self.handle_error(exc) from exc

        return [IndexItem.model_validate(item, by_alias=True) for item in raw]
