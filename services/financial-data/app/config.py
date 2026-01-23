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

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False
    )


# 全局配置实例
settings = Settings()
