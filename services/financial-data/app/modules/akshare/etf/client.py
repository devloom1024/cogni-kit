"""ETF 数据 AkShare 客户端"""
import akshare as ak
from datetime import datetime
from typing import List
import asyncio
import structlog

from app.core.exceptions import DataSourceError
from app.modules.akshare.etf.schemas import EtfListItem, EtfSpot

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


# 全局客户端实例
etf_client = EtfClient()
