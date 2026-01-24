"""指数数据服务"""

from typing import Optional
from app.core.cache import cache
from ..base import BaseAkshareService
from ..settings import cache_settings
from .models import IndexItem
from .client import index_client


class IndexService(BaseAkshareService):
    """指数数据服务"""

    data_type = "index"

    def __init__(self):
        self.cache_ttl = cache_settings.index_cache_ttl

    def get_categories(self) -> list[str]:
        """获取支持的指数类别"""
        return index_client.INDEX_SYMBOLS

    async def get_list(self, category: Optional[str] = None) -> list[IndexItem]:
        """获取指数列表

        Args:
            category: 可选，按类别筛选
        """
        if category:
            return await self._get_by_category(category)
        return await self._get_all()

    async def _get_by_category(self, category: str) -> list[IndexItem]:
        """按类别获取，带缓存"""
        if not cache_settings.cache_enabled:
            data = await index_client.get_index_by_category(category)
            return [IndexItem.model_validate(item, by_alias=True) for item in data]

        key = self.category_key(category)
        cached = await cache.get(key)
        if cached:
            return cached

        data = await index_client.get_index_by_category(category)
        result = [IndexItem.model_validate(item, by_alias=True) for item in data]
        if result:
            await cache.set(key, result, self.cache_ttl)
        return result

    async def _get_all(self) -> list[IndexItem]:
        """获取全部，分类别缓存"""
        all_items: list[IndexItem] = []

        for cat in self.get_categories():
            items = await self._get_by_category(cat)
            all_items.extend(items)

        return all_items


index_service = IndexService()
