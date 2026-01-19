"""依赖注入"""
from app.core.cache import cache


async def get_cache():
    """获取缓存实例"""
    return cache
