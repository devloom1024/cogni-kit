"""交易时段判断和缓存策略"""
from datetime import datetime, time
from typing import Literal

MarketType = Literal["CN", "HK", "US"]


class TradingTimeHelper:
    """交易时段辅助类"""
    
    # A股交易时段 (北京时间)
    CN_MORNING_START = time(9, 30)
    CN_MORNING_END = time(11, 30)
    CN_AFTERNOON_START = time(13, 0)
    CN_AFTERNOON_END = time(15, 0)
    
    # 港股交易时段 (北京时间)
    HK_MORNING_START = time(9, 30)
    HK_MORNING_END = time(12, 0)
    HK_AFTERNOON_START = time(13, 0)
    HK_AFTERNOON_END = time(16, 0)
    
    # 美股交易时段 (北京时间,夏令时)
    US_SUMMER_START = time(21, 30)
    US_SUMMER_END = time(4, 0)  # 次日
    # 美股交易时段 (北京时间,冬令时)
    US_WINTER_START = time(22, 30)
    US_WINTER_END = time(5, 0)  # 次日
    
    @classmethod
    def is_cn_trading_time(cls, now: datetime | None = None) -> bool:
        """判断是否在A股交易时段"""
        if now is None:
            now = datetime.now()
        
        current_time = now.time()
        weekday = now.weekday()
        
        # 周末不交易
        if weekday >= 5:  # 5=周六, 6=周日
            return False
        
        # 上午时段
        if cls.CN_MORNING_START <= current_time <= cls.CN_MORNING_END:
            return True
        
        # 下午时段
        if cls.CN_AFTERNOON_START <= current_time <= cls.CN_AFTERNOON_END:
            return True
        
        return False
    
    @classmethod
    def is_hk_trading_time(cls, now: datetime | None = None) -> bool:
        """判断是否在港股交易时段"""
        if now is None:
            now = datetime.now()
        
        current_time = now.time()
        weekday = now.weekday()
        
        # 周末不交易
        if weekday >= 5:
            return False
        
        # 上午时段
        if cls.HK_MORNING_START <= current_time <= cls.HK_MORNING_END:
            return True
        
        # 下午时段
        if cls.HK_AFTERNOON_START <= current_time <= cls.HK_AFTERNOON_END:
            return True
        
        return False
    
    @classmethod
    def is_us_trading_time(cls, now: datetime | None = None) -> bool:
        """判断是否在美股交易时段(简化版,不考虑夏令时切换)"""
        if now is None:
            now = datetime.now()
        
        current_time = now.time()
        weekday = now.weekday()
        
        # 周末不交易(美股周六周日不交易)
        if weekday >= 5:
            return False
        
        # 使用冬令时时间(更保守)
        # 美股交易时间跨越两天,需要特殊处理
        if current_time >= cls.US_WINTER_START or current_time <= cls.US_WINTER_END:
            return True
        
        return False
    
    @classmethod
    def is_trading_time(cls, market: MarketType | None = None, now: datetime | None = None) -> bool:
        """判断指定市场是否在交易时段"""
        if market == "CN":
            return cls.is_cn_trading_time(now)
        elif market == "HK":
            return cls.is_hk_trading_time(now)
        elif market == "US":
            return cls.is_us_trading_time(now)
        else:
            # 未指定市场,检查是否有任何市场在交易
            return (
                cls.is_cn_trading_time(now) or
                cls.is_hk_trading_time(now) or
                cls.is_us_trading_time(now)
            )
    
    @classmethod
    def get_quote_cache_ttl(cls, market: MarketType | None = None) -> int:
        """获取行情数据的缓存TTL(秒)
        
        从配置文件读取:
        - 交易时段: settings.cache_ttl_quote_trading (默认60秒)
        - 非交易时段: settings.cache_ttl_quote_closed (默认3600秒)
        """
        from app.config import settings
        
        if cls.is_trading_time(market):
            return settings.cache_ttl_quote_trading  # 交易时段
        else:
            return settings.cache_ttl_quote_closed  # 非交易时段
