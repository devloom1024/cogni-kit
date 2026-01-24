"""akshare 服务基类"""

from abc import ABC, abstractmethod
from typing import Any, Callable, Optional
from app.core.cache import cache
from app.utils.pinyin import get_pinyin_initial, get_full_pinyin
from .settings import cache_settings


class BaseAkshareService(ABC):
    """akshare 服务基类"""

    # 子类覆盖
    cache_ttl: int = cache_settings.stock_cache_ttl
    data_type: str = ""

    @property
    def cache_key(self) -> str:
        """缓存 key"""
        return f"{cache_settings.key_prefix}{self.data_type}:list"

    def category_key(self, category: str) -> str:
        """按类别的缓存 key"""
        return f"{cache_settings.key_prefix}{self.data_type}:list:{category}"

    async def get_with_cache(self, fetch_func) -> list:
        """带缓存的数据获取"""
        if not cache_settings.cache_enabled:
            return await fetch_func()

        cached = await cache.get(self.cache_key)
        if cached:
            return cached

        data = await fetch_func()
        await cache.set(self.cache_key, data, self.cache_ttl)
        return data

    async def get_category_with_cache(
        self, category: str, fetch_func: Callable
    ) -> list:
        """按类别带缓存的数据获取

        Args:
            category: 类别名称
            fetch_func: 获取函数 (接受 category 参数)

        Returns:
            该类别的数据
        """
        if not cache_settings.cache_enabled:
            return await fetch_func(category)

        key = self.category_key(category)
        cached = await cache.get(key)
        if cached:
            return cached

        data = await fetch_func(category)
        if data:
            await cache.set(key, data, self.cache_ttl)
        return data

    async def get_all_categories_with_cache(
        self, fetch_func: Callable
    ) -> dict[str, list]:
        """获取所有类别数据，分别缓存

        Args:
            fetch_func: 获取函数 (接受 category 参数)

        Returns:
            {类别: 数据列表} 的字典
        """
        if not cache_settings.cache_enabled:
            return await fetch_func()

        result: dict[str, list] = {}

        for category in self.get_categories():
            cached = await cache.get(self.category_key(category))
            if cached:
                result[category] = cached
            else:
                data = await fetch_func(category)
                if data:
                    await cache.set(self.category_key(category), data, self.cache_ttl)
                result[category] = data or []

        return result

    def get_categories(self) -> list[str]:
        """获取支持的类别列表，子类覆盖"""
        return []

    def process_pinyin(self, name: str) -> tuple[str, str]:
        """处理拼音"""
        return get_pinyin_initial(name), get_full_pinyin(name)
