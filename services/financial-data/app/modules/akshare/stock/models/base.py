"""基础类型定义"""
from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime, date


# ==================== 枚举类型 ====================
MarketType = Literal["CN", "HK", "US"]
TradingStatus = Literal["TRADING", "CLOSED", "SUSPENDED"]
