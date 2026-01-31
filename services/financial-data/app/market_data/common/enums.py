"""市场/交易所通用枚举"""

from enum import Enum


class Market(str, Enum):
    CN = "CN"
    HK = "HK"
    US = "US"


class Exchange(str, Enum):
    SSE = "SSE"
    SZSE = "SZSE"
    BJSE = "BJSE"
