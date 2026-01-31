"""ETF 数据获取客户端

双数据源策略:
1. fund_etf_spot_em (东方财富) - 首选，字段更丰富
2. fund_etf_spot_ths (同花顺) - 备选
3. fund_etf_category_sina (新浪) - 兜底，需要 symbol="ETF基金"
"""

import akshare as ak
from akshare.utils.context import set_proxies
import structlog
from typing import List, Dict, Any

from app.modules.akshare.settings import proxy_settings

logger = structlog.get_logger(__name__)

# 配置 akshare 代理 (避免本地代理导致连接问题)
if proxy_settings.disabled:
    set_proxies({})


class ETFClient:
    """ETF 数据获取客户端"""

    async def get_etf_list(self) -> List[Dict[str, Any]]:
        """获取 ETF 列表

        Returns:
            ETF 字典列表，包含 symbol, name, market

        Raises:
            ServiceError: 当所有数据源都失败时
        """
        # 1. 优先使用东方财富
        try:
            df = ak.fund_etf_spot_em()
            return self._parse_em_response(df)
        except Exception as e:
            logger.warning(
                "fund_etf_spot_em_failed",
                error=str(e),
                error_type=type(e).__name__,
            )

        # 2. 备选同花顺
        try:
            df = ak.fund_etf_spot_ths()
            return self._parse_ths_response(df)
        except Exception as e:
            logger.warning(
                "fund_etf_spot_ths_failed",
                error=str(e),
                error_type=type(e).__name__,
            )

        # 3. 兜底新浪财经
        try:
            df = ak.fund_etf_category_sina(symbol="ETF基金")
            return self._parse_sina_response(df)
        except Exception as e:
            logger.warning(
                "fund_etf_category_sina_failed",
                error=str(e),
                error_type=type(e).__name__,
            )
            raise ServiceError("Failed to fetch ETF data from all sources")

    def _parse_em_response(self, df) -> List[Dict[str, Any]]:
        """解析东方财富响应

        字段: 代码, 名称
        """
        result = []
        for _, row in df.iterrows():
            result.append(
                {
                    "symbol": str(row.get("代码", "")),
                    "name": str(row.get("名称", "")),
                    "market": "CN",
                    "exchange": None,
                    "fundCompany": None,
                }
            )
        return result

    def _parse_ths_response(self, df) -> List[Dict[str, Any]]:
        """解析同花顺响应

        字段: 基金代码, 基金名称
        """
        result = []
        for _, row in df.iterrows():
            result.append(
                {
                    "symbol": str(row.get("基金代码", "")),
                    "name": str(row.get("基金名称", "")),
                    "market": "CN",
                    "exchange": None,
                    "fundCompany": None,
                }
            )
        return result

    def _parse_sina_response(self, df) -> List[Dict[str, Any]]:
        """解析新浪财经响应

        代码前缀: sz=深圳, sh=上海, bj=北京
        ETF 接口可能无前缀，需要判断
        """
        result = []
        for _, row in df.iterrows():
            code = str(row.get("代码", ""))
            symbol = code
            exchange = None

            # 判断是否有交易所前缀
            if len(code) > 2 and code[:2].lower() in ["sz", "sh", "bj"]:
                prefix = code[:2].lower()
                symbol = code[2:]  # 去掉前缀

                if prefix == "sz":
                    exchange = "SZSE"
                elif prefix == "sh":
                    exchange = "SSE"
                elif prefix == "bj":
                    exchange = "BJSE"

            result.append(
                {
                    "symbol": symbol,
                    "name": str(row.get("名称", "")),
                    "market": "CN",
                    "exchange": exchange,
                    "fundCompany": None,
                }
            )
        return result


class ServiceError(Exception):
    """服务异常"""

    pass

