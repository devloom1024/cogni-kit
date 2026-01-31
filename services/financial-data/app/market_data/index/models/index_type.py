"""指数类型枚举"""

from enum import Enum


class IndexType(str, Enum):
    """指数类型枚举"""

    BROAD = "BROAD"  # 大盘指数
    SECTOR = "SECTOR"  # 行业指数
    THEME = "THEME"  # 主题指数
    STRATEGY = "STRATEGY"  # 策略指数
