"""场外基金类型枚举"""

from enum import Enum


class FundType(str, Enum):
    """场外基金类型枚举"""

    MONEY = "MONEY"  # 货币型
    BOND = "BOND"  # 债券型
    MIXED = "MIXED"  # 混合型
    STOCK = "STOCK"  # 股票型
    QDII = "QDII"  # QDII
    REIT = "REIT"  # REITs
