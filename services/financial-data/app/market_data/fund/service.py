"""基金聚合服务"""

from __future__ import annotations

import logging

from app.market_data import providers as _providers  # noqa: F401 - 触发注册
from app.market_data.providers.exceptions import (
    ProviderSelectionError,
    ProviderUnavailableError,
)
from app.market_data.providers.registry import provider_registry

logger = logging.getLogger(__name__)


class FundAggregator:
    """通过 ProviderRegistry 聚合基金数据"""

    async def get_list(self):
        errors: list[str] = []

        for provider in provider_registry.iter_fund_providers():
            try:
                return await provider.get_fund_list()
            except ProviderUnavailableError as exc:
                logger.warning(
                    "fund_provider_failed provider=%s error=%s", provider.name, exc
                )
                errors.append(str(exc))
            except Exception as exc:  # pragma: no cover - 意外错误
                logger.exception(
                    "fund_provider_unexpected_error provider=%s", provider.name
                )
                errors.append(f"{provider.name}: {exc}")

        raise ProviderSelectionError(errors)


fund_aggregator = FundAggregator()
