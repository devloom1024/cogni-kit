"""Akshare ETF Provider"""

from __future__ import annotations

from app.market_data.etf.models import ETFItem
from app.market_data.providers.akshare.etf_client import ETFClient, ServiceError
from app.market_data.providers.base import ETFProvider


class AkshareETFProvider(ETFProvider):
    """基于 akshare 的 ETF Provider"""

    name = "akshare"

    def __init__(self):
        self._client = ETFClient()

    async def get_etf_list(self) -> list[ETFItem]:
        try:
            raw = await self._client.get_etf_list()
        except ServiceError as exc:
            raise self.handle_error(exc) from exc
        except Exception as exc:  # pragma: no cover
            raise self.handle_error(exc) from exc

        return [ETFItem.model_validate(item, by_alias=True) for item in raw]
