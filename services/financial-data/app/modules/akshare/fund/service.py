"""场外基金数据服务"""

import akshare as ak
from ..base import BaseAkshareService
from ..settings import cache_settings
from .models import FundItem
from app.modules.akshare.common.utils import map_fund_type


class FundService(BaseAkshareService):
    """场外基金数据服务"""

    data_type = "fund"

    def __init__(self):
        self.cache_ttl = cache_settings.fund_cache_ttl

    async def get_list(self) -> list[FundItem]:
        """获取场外基金列表"""

        async def fetch() -> list[FundItem]:
            df = ak.fund_name_em()

            result = []
            for _, row in df.iterrows():
                name = str(row.get("基金简称", ""))
                pinyin_initial, pinyin_full = self.process_pinyin(name)

                item = FundItem.model_validate(
                    {
                        "symbol": str(row.get("基金代码", "")),
                        "name": name,
                        "fundType": map_fund_type(str(row.get("基金类型", ""))),
                        "pinyinInitial": pinyin_initial,
                        "pinyinFull": pinyin_full,
                    }
                )
                result.append(item)

            return result

        return await self.get_with_cache(fetch)


fund_service = FundService()
