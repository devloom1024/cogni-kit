"""应用配置管理"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置"""
    
    # 环境配置（共享变量）
    node_env: str = "development"  # development | production | test
    
    # 服务配置
    port: int = 8000
    log_level: str = "INFO"
    
    # Redis 配置
    redis_url: str = "redis://localhost:6379"
    
    # 缓存 TTL (秒)
    cache_ttl_quote: int = 10          # 实时行情
    cache_ttl_kline: int = 300         # K线数据 (5分钟)
    cache_ttl_nav: int = 3600          # 基金净值 (1小时)
    cache_ttl_indicator: int = 120     # 技术指标 (2分钟)
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


# 全局配置实例
settings = Settings()
