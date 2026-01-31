"""Market Data 模块配置"""

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings


class MarketDataSettings(BaseSettings):
    """Market Data 层的可配置项"""

    stock_provider_priority: list[str] = Field(default_factory=lambda: ["akshare"])
    etf_provider_priority: list[str] = Field(default_factory=lambda: ["akshare"])
    fund_provider_priority: list[str] = Field(default_factory=lambda: ["akshare"])

    @field_validator("stock_provider_priority", "etf_provider_priority", "fund_provider_priority", mode="before")
    @classmethod
    def _split_priority(cls, value):  # noqa: D401 - 简短说明
        """允许逗号分隔的字符串"""
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    class Config:
        env_prefix = "MARKET_DATA_"


market_data_settings = MarketDataSettings()
