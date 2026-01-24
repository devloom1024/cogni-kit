"""LOF 数据服务"""

from ..base import BaseAkshareService
from ..settings import cache_settings
from .models import LOFItem
from .client import lof_client


class LOFService(BaseAkshareService):
    """LOF 数据服务"""

    data_type = "lof"

    def __init__(self):
        self.cache_ttl = cache_settings.lof_cache_ttl

    async def get_list(self) -> list[LOFItem]:
        """获取 LOF 列表"""

        async def fetch() -> list[LOFItem]:
            data = await lof_client.get_lof_list()
            return [LOFItem.model_validate(item, by_alias=True) for item in data]

        return await self.get_with_cache(fetch)


lof_service = LOFService()
