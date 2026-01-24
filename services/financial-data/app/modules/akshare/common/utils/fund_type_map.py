"""基金类型中文→枚举映射"""

from typing import Dict, Literal

# 基金类型枚举值
FundTypeLiteral = Literal["MONEY", "BOND", "MIXED", "STOCK", "QDII", "REIT", "ETF"]

# akshare 返回的中文基金类型 → 枚举值映射
FUND_TYPE_MAP: Dict[str, FundTypeLiteral] = {
    "货币型": "MONEY",
    "债券型": "BOND",
    "混合型": "MIXED",
    "股票型": "STOCK",
    "QDII": "QDII",
    "REITs": "REIT",
    "ETF-联接": "ETF",
}


def map_fund_type(chinese_type: str) -> FundTypeLiteral:
    """将中文基金类型转换为枚举值"""
    return FUND_TYPE_MAP.get(chinese_type, "STOCK")
