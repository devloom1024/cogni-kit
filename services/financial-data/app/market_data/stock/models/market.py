"""市场枚举"""

from enum import Enum


class Market(str, Enum):
    """市场枚举"""

    CN = "CN"
    HK = "HK"
    US = "US"
