"""AkShare 客户端封装"""
import akshare as ak
import pandas as pd
from datetime import datetime
from typing import List
import structlog

from app.core.exceptions import DataSourceError
from app.modules.akshare.schemas import (
    StockInfo, RealtimeQuote, KLinePoint,
    FundInfo, FundDetail, FundNav, FundHolding,
    MarketType, FundType
)

logger = structlog.get_logger()


class AkShareClient:
    """AkShare 数据源客户端"""
    
    # ==================== 股票数据 ====================
    
    async def get_stock_list(self, market: MarketType | None = None) -> List[StockInfo]:
        """获取股票列表
        
        Args:
            market: 市场过滤 (CN/HK/US)，None 返回所有
            
        Returns:
            股票列表
        """
        try:
            stocks = []
            
            # A股
            if market is None or market == "CN":
                df_cn = ak.stock_zh_a_spot_em()
                for _, row in df_cn.iterrows():
                    stocks.append(StockInfo(
                        symbol=row['代码'],
                        name=row['名称'],
                        market="CN"
                    ))
            
            # 港股 (示例，实际需要调用对应接口)
            if market is None or market == "HK":
                # TODO: 实现港股列表获取
                pass
            
            # 美股 (示例，实际需要调用对应接口)
            if market is None or market == "US":
                # TODO: 实现美股列表获取
                pass
            
            logger.info("stock_list_fetched", count=len(stocks), market=market)
            return stocks
            
        except Exception as e:
            logger.error("stock_list_fetch_failed", error=str(e), market=market)
            raise DataSourceError(f"获取股票列表失败: {str(e)}")
    
    async def search_stock(self, query: str) -> List[StockInfo]:
        """搜索股票
        
        Args:
            query: 搜索关键词
            
        Returns:
            匹配的股票列表
        """
        try:
            # 获取全量列表后过滤
            all_stocks = await self.get_stock_list()
            results = [
                stock for stock in all_stocks
                if query.lower() in stock.symbol.lower() or query in stock.name
            ]
            
            logger.info("stock_search_completed", query=query, count=len(results))
            return results
            
        except Exception as e:
            logger.error("stock_search_failed", error=str(e), query=query)
            raise DataSourceError(f"搜索股票失败: {str(e)}")
    
    async def get_realtime_quote(self, symbol: str, market: MarketType | None = None) -> RealtimeQuote:
        """获取实时行情
        
        Args:
            symbol: 股票代码
            market: 市场类型
            
        Returns:
            实时行情数据
        """
        try:
            # A股实时行情
            df = ak.stock_zh_a_spot_em()
            row = df[df['代码'] == symbol]
            
            if row.empty:
                raise DataSourceError(f"未找到股票: {symbol}")
            
            row = row.iloc[0]
            
            quote = RealtimeQuote(
                price=float(row['最新价']),
                open=float(row['今开']),
                prev_close=float(row['昨收']),
                high=float(row['最高']),
                low=float(row['最低']),
                volume=float(row['成交量']),
                amount=float(row['成交额']),
                change=float(row['涨跌额']),
                change_percent=float(row['涨跌幅']),
                turnover_rate=float(row.get('换手率', 0)),
                market_cap=float(row.get('总市值', 0)),
                pe=float(row.get('市盈率-动态', 0)),
                pb=float(row.get('市净率', 0)),
                trading_status="TRADING",  # 简化处理
                timestamp=datetime.now()
            )
            
            logger.info("realtime_quote_fetched", symbol=symbol)
            return quote
            
        except Exception as e:
            logger.error("realtime_quote_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取实时行情失败: {str(e)}")
    
    async def get_kline(
        self,
        symbol: str,
        market: MarketType | None = None,
        period: str = "day",
        adjust: str = "qfq",
        limit: int = 250
    ) -> List[KLinePoint]:
        """获取 K 线数据
        
        Args:
            symbol: 股票代码
            market: 市场类型
            period: 周期 (day/week/month)
            adjust: 复权类型 (qfq/hfq/"")
            limit: 数据条数
            
        Returns:
            K 线数据列表
        """
        try:
            # 调用 AkShare 获取历史数据
            df = ak.stock_zh_a_hist(
                symbol=symbol,
                period="daily" if period == "day" else period,
                adjust=adjust if adjust else "qfq"
            )
            
            # 限制数据量
            df = df.tail(limit)
            
            # 转换为 KLinePoint
            klines = []
            for _, row in df.iterrows():
                klines.append(KLinePoint(
                    timestamp=int(pd.Timestamp(row['日期']).timestamp() * 1000),
                    open=float(row['开盘']),
                    high=float(row['最高']),
                    low=float(row['最低']),
                    close=float(row['收盘']),
                    volume=float(row['成交量'])
                ))
            
            logger.info("kline_fetched", symbol=symbol, period=period, count=len(klines))
            return klines
            
        except Exception as e:
            logger.error("kline_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取 K 线数据失败: {str(e)}")
    
    # ==================== 基金数据 ====================
    
    async def get_fund_list(self, fund_type: FundType | None = None) -> List[FundInfo]:
        """获取基金列表
        
        Args:
            fund_type: 基金类型过滤 (ETF/FUND)
            
        Returns:
            基金列表
        """
        try:
            funds = []
            
            # ETF 基金
            if fund_type is None or fund_type == "ETF":
                df_etf = ak.fund_etf_spot_em()
                for _, row in df_etf.iterrows():
                    funds.append(FundInfo(
                        symbol=row['代码'],
                        name=row['名称'],
                        type="ETF"
                    ))
            
            # 场外基金
            if fund_type is None or fund_type == "FUND":
                # TODO: 实现场外基金列表获取
                pass
            
            logger.info("fund_list_fetched", count=len(funds), type=fund_type)
            return funds
            
        except Exception as e:
            logger.error("fund_list_fetch_failed", error=str(e), type=fund_type)
            raise DataSourceError(f"获取基金列表失败: {str(e)}")
    
    async def search_fund(self, query: str) -> List[FundInfo]:
        """搜索基金
        
        Args:
            query: 搜索关键词
            
        Returns:
            匹配的基金列表
        """
        try:
            all_funds = await self.get_fund_list()
            results = [
                fund for fund in all_funds
                if query.lower() in fund.symbol.lower() or query in fund.name
            ]
            
            logger.info("fund_search_completed", query=query, count=len(results))
            return results
            
        except Exception as e:
            logger.error("fund_search_failed", error=str(e), query=query)
            raise DataSourceError(f"搜索基金失败: {str(e)}")
    
    async def get_fund_nav(self, symbol: str) -> FundNav:
        """获取基金净值
        
        Args:
            symbol: 基金代码
            
        Returns:
            基金净值数据
        """
        try:
            df = ak.fund_open_fund_info_em(fund=symbol, indicator="单位净值走势")
            
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
    
    async def get_fund_info(self, symbol: str) -> FundDetail:
        """获取基金详细信息
        
        Args:
            symbol: 基金代码
            
        Returns:
            基金详细信息
        """
        try:
            df = ak.fund_open_fund_info_em(fund=symbol, indicator="基金信息")
            
            if df.empty:
                raise DataSourceError(f"未找到基金: {symbol}")
            
            info = df.iloc[0]
            
            detail = FundDetail(
                symbol=symbol,
                name=str(info.get('基金简称', '')),
                type="FUND",  # 简化处理
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
    
    async def get_fund_holdings(self, symbol: str, year: str | None = None) -> List[FundHolding]:
        """获取基金持仓
        
        Args:
            symbol: 基金代码
            year: 年份
            
        Returns:
            持仓列表
        """
        try:
            df = ak.fund_portfolio_hold_em(symbol=symbol, date=year or datetime.now().strftime("%Y"))
            
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
akshare_client = AkShareClient()
