"""基金类型中文→枚举映射"""

from typing import Dict, Literal, Optional

# 基金类型枚举值 (完整 32 种)
FundTypeLiteral = Literal[
    # 货币型 (2种)
    "MONEY_NORMAL",       # 货币型-普通货币
    "MONEY_FLOATING",     # 货币型-浮动净值
    
    # 债券型 (4种)
    "BOND_LONG",          # 债券型-长债
    "BOND_SHORT",         # 债券型-中短债
    "BOND_MIXED_1",       # 债券型-混合一级
    "BOND_MIXED_2",       # 债券型-混合二级
    
    # 混合型 (5种)
    "MIXED_STOCK",        # 混合型-偏股
    "MIXED_BOND",         # 混合型-偏债
    "MIXED_BALANCED",     # 混合型-平衡
    "MIXED_FLEXIBLE",     # 混合型-灵活
    "MIXED_ABSOLUTE",     # 混合型-绝对收益
    
    # 股票型 (1种)
    "STOCK",              # 股票型
    
    # 指数型 (4种)
    "INDEX_STOCK",        # 指数型-股票
    "INDEX_BOND",         # 指数型-固收
    "INDEX_OVERSEAS",     # 指数型-海外股票
    "INDEX_OTHER",        # 指数型-其他
    
    # QDII (9种)
    "QDII_STOCK",         # QDII-普通股票
    "QDII_MIXED_STOCK",   # QDII-混合偏股
    "QDII_MIXED_BOND",    # QDII-混合债
    "QDII_MIXED_FLEXIBLE",# QDII-混合灵活
    "QDII_MIXED_BALANCED",# QDII-混合平衡
    "QDII_BOND",          # QDII-纯债
    "QDII_COMMODITY",     # QDII-商品
    "QDII_FOF",           # QDII-FOF
    "QDII_REIT",          # QDII-REITs
    
    # FOF (3种)
    "FOF_CONSERVATIVE",   # FOF-稳健型
    "FOF_BALANCED",       # FOF-均衡型
    "FOF_AGGRESSIVE",     # FOF-进取型
    
    # 另类 (3种)
    "REIT",               # Reits/REITs
    "COMMODITY",          # 商品
    "OTHER",              # 其他/空值
]

# akshare 返回的中文基金类型 → 枚举值映射 (完整 33 种)
FUND_TYPE_MAP: Dict[str, FundTypeLiteral] = {
    # 货币型
    "货币型-普通货币": "MONEY_NORMAL",
    "货币型-浮动净值": "MONEY_FLOATING",
    
    # 债券型
    "债券型-长债": "BOND_LONG",
    "债券型-中短债": "BOND_SHORT",
    "债券型-混合一级": "BOND_MIXED_1",
    "债券型-混合二级": "BOND_MIXED_2",
    
    # 混合型
    "混合型-偏股": "MIXED_STOCK",
    "混合型-偏债": "MIXED_BOND",
    "混合型-平衡": "MIXED_BALANCED",
    "混合型-灵活": "MIXED_FLEXIBLE",
    "混合型-绝对收益": "MIXED_ABSOLUTE",
    
    # 股票型
    "股票型": "STOCK",
    
    # 指数型
    "指数型-股票": "INDEX_STOCK",
    "指数型-固收": "INDEX_BOND",
    "指数型-海外股票": "INDEX_OVERSEAS",
    "指数型-其他": "INDEX_OTHER",
    
    # QDII
    "QDII-普通股票": "QDII_STOCK",
    "QDII-混合偏股": "QDII_MIXED_STOCK",
    "QDII-混合债": "QDII_MIXED_BOND",
    "QDII-混合灵活": "QDII_MIXED_FLEXIBLE",
    "QDII-混合平衡": "QDII_MIXED_BALANCED",
    "QDII-纯债": "QDII_BOND",
    "QDII-商品": "QDII_COMMODITY",
    "QDII-FOF": "QDII_FOF",
    "QDII-REITs": "QDII_REIT",
    
    # FOF
    "FOF-稳健型": "FOF_CONSERVATIVE",
    "FOF-均衡型": "FOF_BALANCED",
    "FOF-进取型": "FOF_AGGRESSIVE",
    
    # 另类
    "Reits": "REIT",
    "REITs": "REIT",
    "商品": "COMMODITY",
    "其他": "OTHER",
    "": "OTHER",  # 空字符串也映射为 OTHER
}


def map_fund_type(chinese_type: str) -> Optional[FundTypeLiteral]:
    """将中文基金类型转换为枚举值，未知类型返回 OTHER"""
    return FUND_TYPE_MAP.get(chinese_type, "OTHER")
