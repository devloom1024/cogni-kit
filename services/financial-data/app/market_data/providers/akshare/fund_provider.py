"""Akshare 场外基金 Provider"""

from __future__ import annotations

import akshare as ak

from app.market_data.fund.models import FundItem
from app.market_data.providers.base import FundProvider
from app.market_data.fund.utils.fund_type_map import map_fund_type
from app.utils.pinyin import get_pinyin_full, get_pinyin_initial


class AkshareFundProvider(FundProvider):
    """基于 akshare 的场外基金实现"""

    name = "akshare"

    async def get_fund_list(self) -> list[FundItem]:
        try:
            df = ak.fund_name_em()
        except Exception as exc:  # pragma: no cover - 外部请求
            raise self.handle_error(exc) from exc

        items: list[FundItem] = []
        for _, row in df.iterrows():
            name = str(row.get("基金简称", ""))
            pinyin_initial = get_pinyin_initial(name)
            pinyin_full = get_pinyin_full(name)

            items.append(
                FundItem.model_validate(
                    {
                        "symbol": str(row.get("基金代码", "")),
                        "name": name,
                        "fundType": map_fund_type(str(row.get("基金类型", ""))),
                        "pinyinInitial": pinyin_initial,
                        "pinyinFull": pinyin_full,
                    }
                )
            )

        return items
