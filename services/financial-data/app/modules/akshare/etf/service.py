"""ETF 数据服务"""

from ..base import BaseAkshareService
from ..settings import cache_settings
from .models import ETFItem
from .client import etf_client


class ETFService(BaseAkshareService):
    """ETF 数据服务"""

    data_type = "etf"

    def __init__(self):
        self.cache_ttl = cache_settings.etf_cache_ttl

    async def get_list(self) -> list[ETFItem]:
        """获取 ETF 列表"""

        async def fetch() -> list[ETFItem]:
            data = await etf_client.get_etf_list()
            return [ETFItem.model_validate(item, by_alias=True) for item in data]

        return await self.get_with_cache(fetch)


etf_service = ETFService()
