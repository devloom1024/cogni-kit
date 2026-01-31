"""指数数据获取客户端

数据源: stock_zh_index_spot_em (东方财富)
支持的 symbol: "沪深重要指数", "上证系列指数", "深证系列指数", "指数成份", "中证系列指数"
"""

import akshare as ak
from akshare.utils.context import set_proxies
import structlog
from typing import List, Dict, Any

from app.market_data.providers.akshare.settings import proxy_settings

logger = structlog.get_logger(__name__)

# 配置 akshare 代理 (避免本地代理导致连接问题)
if proxy_settings.disabled:
    set_proxies({})


class IndexClient:
    """指数数据获取客户端"""

    # 支持的指数类别
    INDEX_SYMBOLS = [
        "沪深重要指数",
        "上证系列指数",
        "深证系列指数",
        "指数成份",
        "中证系列指数",
    ]

    async def get_index_list(self) -> List[Dict[str, Any]]:
        """获取指数列表 (所有类别)

        Returns:
            指数字典列表
        """
        all_data: List[Dict[str, Any]] = []

        for symbol in self.INDEX_SYMBOLS:
            try:
                data = await self.get_index_by_category(symbol)
                all_data.extend(data)
                logger.info("fetched_index_category", symbol=symbol, count=len(data))
            except Exception as e:
                logger.warning(
                    "fetch_index_failed",
                    symbol=symbol,
                    error=str(e),
                    error_type=type(e).__name__,
                )

        if not all_data:
            raise ServiceError("Failed to fetch index data from all sources")

        return all_data

    async def get_index_by_category(self, category: str) -> List[Dict[str, Any]]:
        """按类别获取指数列表

        Args:
            category: 指数类别

        Returns:
            该类别的指数字典列表
        """
        try:
            df = ak.stock_zh_index_spot_em(symbol=category)
            return self._parse_response(df, category)
        except Exception as e:
            logger.warning(
                "fetch_index_category_failed",
                category=category,
                error=str(e),
                error_type=type(e).__name__,
            )
            raise ServiceError(f"Failed to fetch index data for category: {category}")

    def _parse_response(self, df, category: str) -> List[Dict[str, Any]]:
        """解析东方财富响应

        字段: 序号, 代码, 名称, 最新价, 涨跌额, 涨跌幅, 成交量...
        """
        result = []
        for _, row in df.iterrows():
            result.append(
                {
                    "symbol": str(row.get("代码", "")),
                    "name": str(row.get("名称", "")),
                    "market": "CN",
                    "indexType": None,
                    "category": category,
                }
            )
        return result


class ServiceError(Exception):
    """服务异常"""

    pass

