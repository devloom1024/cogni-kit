"""A股数据服务"""

import akshare as ak
from ..base import BaseAkshareService
from ..settings import cache_settings
from .models import StockItem, Exchange, Market


class StockService(BaseAkshareService):
    """A股数据服务"""

    data_type = "stock"

    def __init__(self):
        self.cache_ttl = cache_settings.stock_cache_ttl

    async def get_list(self) -> list[StockItem]:
        """获取 A股列表"""

        async def fetch():
            df = ak.stock_zh_a_spot_em()

            result = []
            for _, row in df.iterrows():
                # 根据代码判断交易所
                symbol = str(row.get("代码", ""))
                exchange = None
                if symbol.startswith("6"):
                    exchange = Exchange.SSE
                elif symbol.startswith("0") or symbol.startswith("3"):
                    exchange = Exchange.SZSE

                result.append(
                    StockItem(
                        symbol=symbol,
                        name=str(row.get("名称", "")),
                        market=Market.CN,
                        exchange=exchange,
                    )
                )

            return result

        return await self.get_with_cache(fetch)


stock_service = StockService()
