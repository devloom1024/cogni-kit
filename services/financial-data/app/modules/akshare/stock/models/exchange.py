"""交易所枚举"""

from enum import Enum


class Exchange(str, Enum):
    """交易所枚举"""

    SSE = "SSE"
    SZSE = "SZSE"
    BJSE = "BJSE"
