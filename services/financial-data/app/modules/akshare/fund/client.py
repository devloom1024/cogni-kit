"""场外基金数据 AkShare 客户端"""
import akshare as ak
import pandas as pd
from datetime import datetime
from typing import List
import asyncio
import structlog

from app.core.exceptions import DataSourceError
from app.modules.akshare.fund.schemas import (
    FundListItem, FundNav, FundDetail, FundHolding
)

logger = structlog.get_logger()


class FundClient:
    """场外基金数据源客户端"""
    
    async def get_fund_list(self) -> List[FundListItem]:
        """获取场外基金列表
        
        Returns:
            基金列表
        """
        try:
            df = await asyncio.to_thread(ak.fund_name_em)
            
            funds = []
            for _, row in df.iterrows():
                funds.append(FundListItem(
                    symbol=str(row['基金代码']),
                    name=str(row['基金简称'])
                ))
            
            logger.info("fund_list_fetched", count=len(funds))
            return funds
            
        except Exception as e:
            logger.error("fund_list_fetch_failed", error=str(e))
            raise DataSourceError(f"获取基金列表失败: {str(e)}")
    
    async def get_nav(self, symbol: str) -> FundNav:
        """获取基金净值
        
        Args:
            symbol: 基金代码
            
        Returns:
            基金净值数据
        """
        try:
            df = await asyncio.to_thread(
                ak.fund_open_fund_info_em,
                symbol=symbol,
                indicator="单位净值走势"
            )
            
            if df.empty:
                raise DataSourceError(f"未找到基金: {symbol}")
            
            latest = df.iloc[-1]
            prev = df.iloc[-2] if len(df) > 1 else latest
            
            nav = FundNav(
                symbol=symbol,
                nav=float(latest['单位净值']),
                acc_nav=float(latest.get('累计净值', latest['单位净值'])),
                daily_return=float((latest['单位净值'] - prev['单位净值']) / prev['单位净值'] * 100),
                nav_date=pd.to_datetime(latest['净值日期']).date()
            )
            
            logger.info("fund_nav_fetched", symbol=symbol)
            return nav
            
        except Exception as e:
            logger.error("fund_nav_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取基金净值失败: {str(e)}")
    
    async def get_info(self, symbol: str) -> FundDetail:
        """获取基金详细信息
        
        Args:
            symbol: 基金代码
            
        Returns:
            基金详细信息
        """
        try:
            df = await asyncio.to_thread(
                ak.fund_open_fund_info_em,
                symbol=symbol,
                indicator="基金信息"
            )
            
            if df.empty:
                raise DataSourceError(f"未找到基金: {symbol}")
            
            info = df.iloc[0]
            
            detail = FundDetail(
                symbol=symbol,
                name=str(info.get('基金简称', '')),
                manager=str(info.get('基金经理', '')),
                scale=float(info.get('基金规模', 0)),
                establishment_date=pd.to_datetime(info.get('成立日期')).date() if '成立日期' in info else None,
                risk_level=str(info.get('风险等级', ''))
            )
            
            logger.info("fund_info_fetched", symbol=symbol)
            return detail
            
        except Exception as e:
            logger.error("fund_info_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取基金信息失败: {str(e)}")
    
    async def get_holdings(self, symbol: str, year: str | None = None) -> List[FundHolding]:
        """获取基金持仓
        
        Args:
            symbol: 基金代码
            year: 年份
            
        Returns:
            持仓列表
        """
        try:
            df = await asyncio.to_thread(
                ak.fund_portfolio_hold_em,
                symbol=symbol,
                date=year or datetime.now().strftime("%Y")
            )
            
            holdings = []
            for _, row in df.head(10).iterrows():  # 只取前10
                holdings.append(FundHolding(
                    symbol=row['股票代码'],
                    name=row['股票名称'],
                    percentage=float(row['占净值比例']),
                    report_date=pd.to_datetime(row['报告期']).date()
                ))
            
            logger.info("fund_holdings_fetched", symbol=symbol, count=len(holdings))
            return holdings
            
        except Exception as e:
            logger.error("fund_holdings_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取基金持仓失败: {str(e)}")


# 全局客户端实例
fund_client = FundClient()
