"""Akshare Provider 配置"""

from pydantic_settings import BaseSettings


class AkshareProxySettings(BaseSettings):
    """akshare 模块代理配置"""

    # 禁用代理 (避免本地代理导致连接问题)
    disabled: bool = True

    # 代理设置 (当 disabled=False 时生效)
    proxies: dict[str, str] = {}

    class Config:
        env_prefix = "AKSHARE_PROXY_"


proxy_settings = AkshareProxySettings()
