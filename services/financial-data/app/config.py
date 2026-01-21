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

    # 缓存 TTL (秒) - 统一在此处配置所有缓存过期时间
    # === 实时行情类 (高频变化) ===
    cache_ttl_bid_ask: int = 1  # 五档盘口 (1秒)
    cache_ttl_fund_flow: int = 5  # 资金流向 (5秒)
    cache_ttl_quote: int = 10  # 实时行情 (10秒)
    cache_ttl_valuation: int = 300  # 估值数据 (5分钟)

    # === K线/指标类 (中频变化) ===
    cache_ttl_kline: int = 300  # K线数据 (5分钟)
    cache_ttl_indicator: int = 120  # 技术指标 (2分钟)

    # === 基础列表类 (低频变化) ===
    cache_ttl_stock_list: int = 86400  # 股票列表 (24小时)
    cache_ttl_etf_list: int = 3600  # ETF列表 (1小时)
    cache_ttl_fund_list: int = 3600  # 基金列表 (1小时)

    # === 定时任务配置 ===
    cache_refresh_retry_times: int = 3  # 缓存刷新重试次数
    cache_refresh_cron: str = "0 2 * * *"  # 股票缓存刷新 cron (每天凌晨 2 点)
    cache_refresh_cron_etf: str = "0 3 * * *"  # ETF 缓存刷新 cron (每天凌晨 3 点)
    cache_refresh_cron_fund: str = "0 4 * * *"  # 基金缓存刷新 cron (每天凌晨 4 点)

    # === 详情/财务类 (较低频变化) ===
    cache_ttl_financial: int = 3600  # 财务数据 (1小时)
    cache_ttl_shareholders: int = 3600  # 股东信息 (1小时)
    cache_ttl_fund_info: int = 3600  # 基金详情 (1小时)
    cache_ttl_fund_nav: int = 3600  # 基金净值 (1小时)
    cache_ttl_fund_holdings: int = 3600  # 基金持仓 (1小时)
    cache_ttl_profile: int = 86400  # 公司信息 (24小时)

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False
    )


# 全局配置实例
settings = Settings()
