"""Akshare 股票 Provider 实现"""

from __future__ import annotations

import akshare as ak

from app.market_data.providers.base import StockProvider
from app.market_data.stock.models import Exchange, Market, StockItem


class AkshareStockProvider(StockProvider):
    """基于 akshare 的股票实现"""

    name = "akshare"

    async def get_stock_list(self) -> list[StockItem]:  # noqa: D401 - 简短描述
        try:
            df = ak.stock_zh_a_spot_em()
        except Exception as exc:  # pragma: no cover - 网络依赖
            raise self.handle_error(exc) from exc

        items: list[StockItem] = []
        for _, row in df.iterrows():
            symbol = str(row.get("代码", ""))
            items.append(
                StockItem(
                    symbol=symbol,
                    name=str(row.get("名称", "")),
                    market=Market.CN,
                    exchange=self._infer_exchange(symbol),
                )
            )

        return items

    def _infer_exchange(self, symbol: str) -> Exchange | None:
        if symbol.startswith("6"):
            return Exchange.SSE
        if symbol.startswith("0") or symbol.startswith("3"):
            return Exchange.SZSE
        return None
