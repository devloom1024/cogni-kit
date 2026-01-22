"""ETF 数据 AkShare 客户端"""
import akshare as ak
import pandas as pd
from datetime import datetime
from typing import List
import asyncio
import structlog

from app.core.exceptions import DataSourceError
from app.modules.akshare.etf.schemas import (
    EtfListItem, EtfSpot, KLinePoint, KLineMeta, KLineResponse
)

logger = structlog.get_logger()


class EtfClient:
    """ETF 数据源客户端"""

    async def get_etf_list(self) -> List[EtfListItem]:
        """获取 ETF 列表

        Returns:
            ETF 列表
        """
        try:
            df = await asyncio.to_thread(ak.fund_etf_spot_em)

            etfs = []
            for _, row in df.iterrows():
                etfs.append(EtfListItem(
                    symbol=row['代码'],
                    name=row['名称']
                ))

            logger.info("etf_list_fetched", count=len(etfs))
            return etfs

        except Exception as e:
            logger.error("etf_list_fetch_failed", error=str(e))
            raise DataSourceError(f"获取 ETF 列表失败: {str(e)}")

    async def get_spot(self, symbol: str) -> EtfSpot:
        """获取 ETF 实时行情

        Args:
            symbol: ETF 代码

        Returns:
            实时行情数据
        """
        try:
            df = await asyncio.to_thread(ak.fund_etf_spot_em)
            row = df[df['代码'] == symbol]

            if row.empty:
                raise DataSourceError(f"未找到 ETF: {symbol}")

            row = row.iloc[0]

            spot = EtfSpot(
                symbol=symbol,
                name=str(row.get('名称', '')),
                price=float(row.get('最新价', 0)),
                open=float(row.get('今开', 0)),
                prev_close=float(row.get('昨收', 0)),
                high=float(row.get('最高', 0)),
                low=float(row.get('最低', 0)),
                volume=float(row.get('成交量', 0)),
                amount=float(row.get('成交额', 0)),
                change=float(row.get('涨跌额', 0)),
                change_percent=float(row.get('涨跌幅', 0)),
                timestamp=datetime.now()
            )

            logger.info("etf_spot_fetched", symbol=symbol)
            return spot

        except Exception as e:
            logger.error("etf_spot_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取 ETF 实时行情失败: {str(e)}")

    async def get_kline(
        self,
        symbol: str,
        period: str = "day",
        adjust: str = "qfq",
        limit: int | None = None,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> KLineResponse:
        """获取 ETF K 线数据

        Args:
            symbol: ETF 代码
            period: 周期 (day/week/month)
            adjust: 复权类型 (qfq/hfq/"")
            limit: 数据条数 (仅当 start_date 未指定时生效)
            start_date: 开始日期 (YYYYMMDD)
            end_date: 结束日期 (YYYYMMDD，默认当前日期)

        Returns:
            KLineResponse: K 线数据和元数据
        """
        try:
            # 确定结束日期
            if not end_date:
                end_date = datetime.now().strftime("%Y%m%d")

            # 调用 AkShare 获取历史数据
            df = await asyncio.to_thread(
                ak.fund_etf_hist_em,
                symbol=symbol,
                period="daily" if period == "day" else period,
                start_date=start_date,
                end_date=end_date,
                adjust=adjust if adjust else "qfq"
            )

            # 如果指定了 start_date/limit，取最后 limit 条
            if limit and not start_date:
                df = df.tail(limit)

            # 转换为 KLinePoint
            klines = []
            for _, row in df.iterrows():
                klines.append(KLinePoint(
                    date=str(row['日期']),
                    open=float(row['开盘']),
                    high=float(row['最高']),
                    low=float(row['最低']),
                    close=float(row['收盘']),
                    volume=float(row['成交量'])
                ))

            # 构建元数据
            meta = KLineMeta(
                symbol=symbol,
                period=period,
                count=len(klines),
                first_date=str(df['日期'].iloc[0]) if not df.empty else "",
                last_date=str(df['日期'].iloc[-1]) if not df.empty else ""
            )

            logger.info("etf_kline_fetched", symbol=symbol, period=period,
                       start_date=start_date, end_date=end_date, count=len(klines))

            return KLineResponse(data=klines, meta=meta)

        except Exception as e:
            logger.error("etf_kline_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取 ETF K 线数据失败: {str(e)}")


# 全局客户端实例
etf_client = EtfClient()
