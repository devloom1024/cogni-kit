"""akshare 模块配置 (全局统一)"""

from typing import Dict
from pydantic_settings import BaseSettings


class AkshareCacheSettings(BaseSettings):
    """akshare 模块缓存配置"""

    # 全局开关
    cache_enabled: bool = True

    # 各类数据缓存时间 (秒)
    stock_cache_ttl: int = 86400  # 24小时
    index_cache_ttl: int = 86400  # 24小时
    etf_cache_ttl: int = 86400  # 24小时
    lof_cache_ttl: int = 86400  # 24小时
    fund_cache_ttl: int = 43200  # 12小时

    # Redis key 前缀
    key_prefix: str = "akshare:"

    class Config:
        env_prefix = "AKSHARE_CACHE_"


class AkshareProxySettings(BaseSettings):
    """akshare 模块代理配置"""

    # 禁用代理 (避免本地代理导致连接问题)
    disabled: bool = True

    # 代理设置 (当 disabled=False 时生效)
    proxies: Dict[str, str] = {}

    class Config:
        env_prefix = "AKSHARE_PROXY_"


# 全局单例
cache_settings = AkshareCacheSettings()
proxy_settings = AkshareProxySettings()
