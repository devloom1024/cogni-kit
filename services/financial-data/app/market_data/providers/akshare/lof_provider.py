"""Akshare LOF Provider"""

from __future__ import annotations

from app.market_data.lof.models import LOFItem
from app.market_data.providers.akshare.lof_client import LOFClient, ServiceError
from app.market_data.providers.base import LOFProvider


class AkshareLOFProvider(LOFProvider):
    """基于 akshare 的 LOF Provider"""

    name = "akshare"

    def __init__(self):
        self._client = LOFClient()

    async def get_lof_list(self) -> list[LOFItem]:
        try:
            raw = await self._client.get_lof_list()
        except ServiceError as exc:
            raise self.handle_error(exc) from exc
        except Exception as exc:  # pragma: no cover
            raise self.handle_error(exc) from exc

        return [LOFItem.model_validate(item, by_alias=True) for item in raw]
