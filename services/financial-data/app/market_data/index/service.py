"""指数聚合服务"""

from __future__ import annotations

import logging

from app.market_data import providers as _providers  # noqa: F401 - 触发注册
from app.market_data.providers.exceptions import (
    ProviderSelectionError,
    ProviderUnavailableError,
)
from app.market_data.providers.registry import provider_registry

logger = logging.getLogger(__name__)


class IndexAggregator:
    """通过 ProviderRegistry 聚合指数数据"""

    async def get_list(self, category: str | None = None):
        errors: list[str] = []

        for provider in provider_registry.iter_index_providers():
            try:
                return await provider.get_index_list(category)
            except ProviderUnavailableError as exc:
                logger.warning(
                    "index_provider_failed provider=%s category=%s error=%s",
                    provider.name,
                    category,
                    exc,
                )
                errors.append(str(exc))
            except Exception as exc:  # pragma: no cover - 意外错误
                logger.exception(
                    "index_provider_unexpected_error provider=%s category=%s",
                    provider.name,
                    category,
                )
                errors.append(f"{provider.name}: {exc}")

        raise ProviderSelectionError(errors)


index_aggregator = IndexAggregator()
