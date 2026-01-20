"""Redis 缓存管理"""
import json
from typing import Any, Optional
import redis.asyncio as redis
from app.config import settings
import structlog

logger = structlog.get_logger()


class CacheManager:
    """Redis 缓存管理器"""
    
    def __init__(self):
        self._client: Optional[redis.Redis] = None
    
    async def connect(self):
        """连接 Redis"""
        try:
            self._client = await redis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            await self._client.ping()
            logger.info("redis_connected", url=settings.redis_url)
        except Exception as e:
            logger.error("redis_connection_failed", error=str(e))
            raise
    
    async def disconnect(self):
        """断开 Redis 连接"""
        if self._client:
            await self._client.close()
            logger.info("redis_disconnected")
    
    async def get(self, key: str) -> Optional[Any]:
        """获取缓存
        
        Args:
            key: 缓存键
            
        Returns:
            缓存值（JSON 解析后），不存在返回 None
        """
        if not self._client:
            return None
        
        try:
            value = await self._client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.warning("cache_get_failed", key=key, error=str(e))
            return None
    
    async def set(self, key: str, value: Any, ttl: int):
        """设置缓存
        
        Args:
            key: 缓存键
            value: 缓存值（会被 JSON 序列化）
            ttl: 过期时间（秒）
        """
        if not self._client:
            return
        
        try:
            await self._client.setex(
                key,
                ttl,
                json.dumps(value, ensure_ascii=False)
            )
        except Exception as e:
            logger.warning("cache_set_failed", key=key, error=str(e))
    
    async def delete(self, key: str):
        """删除缓存
        
        Args:
            key: 缓存键
        """
        if not self._client:
            return
        
        try:
            await self._client.delete(key)
        except Exception as e:
            logger.warning("cache_delete_failed", key=key, error=str(e))
    
    async def exists(self, key: str) -> bool:
        """检查缓存是否存在
        
        Args:
            key: 缓存键
            
        Returns:
            是否存在
        """
        if not self._client:
            return False
        
        try:
            return await self._client.exists(key) > 0
        except Exception as e:
            logger.warning("cache_exists_failed", key=key, error=str(e))
            return False
    
    async def ttl(self, key: str) -> int:
        """获取缓存剩余过期时间
        
        Args:
            key: 缓存键
            
        Returns:
            剩余秒数，-1 表示永不过期，-2 表示不存在
        """
        if not self._client:
            return -2
        
        try:
            return await self._client.ttl(key)
        except Exception as e:
            logger.warning("cache_ttl_failed", key=key, error=str(e))
            return -2


# 全局缓存实例
cache = CacheManager()
