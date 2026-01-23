"""股票数据 AkShare 客户端"""
import akshare as ak
import pandas as pd
from datetime import datetime, date
from typing import List, Optional
import asyncio
import structlog

from app.core.exceptions import DataSourceError
from app.modules.akshare.stock.models import (
    StockListItem, StockSpot, KLinePoint, KLineMeta, KLineResponse, MarketType,
    StockProfile, StockValuation, StockFinancial,
    FundFlowResponse, FundFlowPeriod,
    BidAsk, PriceLevel, BatchSymbolItem,
    StockFinancialCNResponse, StockFinancialCNPeriod,
    StockFinancialHKResponse, StockFinancialHKPeriod,
    StockFinancialUSResponse, StockFinancialUSPeriod
)

logger = structlog.get_logger(__name__)


class StockClient:
    """股票数据源客户端"""

    async def _fetch_market_stocks(self, market: MarketType) -> list[StockListItem]:
        """获取单个市场的股票列表（内部方法，失败抛异常）

        Args:
            market: 市场类型 (CN/HK/US)

        Returns:
            股票列表
        """
        stocks = []

        if market == "CN":
            df_cn = await asyncio.to_thread(ak.stock_zh_a_spot_em)
            for _, row in df_cn.iterrows():
                stocks.append(StockListItem(
                    symbol=row['代码'],
                    name=row['名称'],
                    market="CN"
                ))
        elif market == "HK":
            df_hk = await asyncio.to_thread(ak.stock_hk_spot_em)
            for _, row in df_hk.iterrows():
                stocks.append(StockListItem(
                    symbol=str(row['代码']),
                    name=str(row['名称']),
                    market="HK"
                ))
        elif market == "US":
            df_us = await asyncio.to_thread(ak.stock_us_spot_em)
            for _, row in df_us.iterrows():
                stocks.append(StockListItem(
                    symbol=str(row['代码']).split('.')[-1] if '.' in str(row['代码']) else str(row['代码']),
                    name=str(row['名称']),
                    market="US"
                ))

        return stocks

    async def get_stock_list(self, market: MarketType | None = None) -> List[StockListItem]:
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
                df_cn = await asyncio.to_thread(ak.stock_zh_a_spot_em)
                for _, row in df_cn.iterrows():
                    stocks.append(StockListItem(
                        symbol=row['代码'],
                        name=row['名称'],
                        market="CN"
                    ))

            # 港股
            if market is None or market == "HK":
                df_hk = await asyncio.to_thread(ak.stock_hk_spot_em)
                for _, row in df_hk.iterrows():
                    stocks.append(StockListItem(
                        symbol=str(row['代码']),
                        name=str(row['名称']),
                        market="HK"
                    ))

            # 美股
            if market is None or market == "US":
                df_us = await asyncio.to_thread(ak.stock_us_spot_em)
                for _, row in df_us.iterrows():
                    stocks.append(StockListItem(
                        symbol=str(row['代码']).split('.')[-1] if '.' in str(row['代码']) else str(row['代码']),
                        name=str(row['名称']),
                        market="US"
                    ))

            logger.info("stock_list_fetched", count=len(stocks), market=market)
            return stocks

        except Exception as e:
            logger.error("stock_list_fetch_failed", error=str(e), market=market)
            raise DataSourceError(f"获取股票列表失败: {str(e)}")

    async def get_stock_list_safe(self, market: MarketType) -> list[StockListItem]:
        """安全获取单个市场的股票列表（失败抛异常，由调用方处理）

        Args:
            market: 市场类型 (CN/HK/US)

        Returns:
            股票列表

        Raises:
            Exception: 获取失败时抛出异常
        """
        stocks = await self._fetch_market_stocks(market)
        logger.info("stock_list_fetched", count=len(stocks), market=market)
        return stocks
    
    async def get_spot(self, symbol: str, market: MarketType | None = None) -> StockSpot:
        """获取实时行情
        
        Args:
            symbol: 股票代码
            market: 市场类型
            
        Returns:
            实时行情数据
        """
        try:
            # A股: 使用优化的 stock_bid_ask_em
            if market == "CN" or (market is None and (symbol.isdigit() and len(symbol) == 6)):
                return await self._get_spot_cn_optimized(symbol)
            
            # 港股: 保持原实现
            elif market == "HK" or (market is None and (symbol.isdigit() and len(symbol) == 5)):
                df = await asyncio.to_thread(ak.stock_hk_spot_em)
                row = df[df['代码'] == symbol]
            # 美股: 保持原实现
            elif market == "US" or market is None:
                df = await asyncio.to_thread(ak.stock_us_spot_em)
                row = df[df['代码'].astype(str).str.endswith(f".{symbol}")]
                if row.empty:
                    row = df[df['代码'] == symbol]
            else:
                raise DataSourceError(f"未知市场或代码格式: {symbol}")
            
            # 港股/美股的数据处理
            if row.empty:
                raise DataSourceError(f"未找到股票: {symbol}")
            
            row = row.iloc[0]
            
            # 构建响应数据(港股/美股不含五档盘口)
            spot = StockSpot(
                symbol=symbol,
                name=str(row.get('名称', '')),
                price=float(row.get('最新价', 0)),
                open=float(row.get('今开', row.get('开盘价', 0))),
                prev_close=float(row.get('昨收', row.get('昨收价', 0))),
                high=float(row.get('最高', row.get('最高价', 0))),
                low=float(row.get('最低', row.get('最低价', 0))),
                volume=float(row.get('成交量', 0)),
                amount=float(row.get('成交额', 0)),
                change=float(row.get('涨跌额', 0)),
                change_percent=float(row.get('涨跌幅', 0)),
                turnover_rate=float(row.get('换手率', 0)) if '换手率' in row else None,
                amplitude=float(row.get('振幅', 0)) if '振幅' in row else None,
                volume_ratio=float(row.get('量比', 0)) if '量比' in row else None,
                timestamp=datetime.now()
            )
            
            logger.info("stock_spot_fetched", symbol=symbol, market=market)
            return spot
            
        except Exception as e:
            logger.error("stock_spot_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取实时行情失败: {str(e)}")
    
    async def _get_spot_cn_optimized(self, symbol: str) -> StockSpot:
        """使用 stock_bid_ask_em 获取A股实时行情(优化版)
        
        Args:
            symbol: 股票代码
            
        Returns:
            实时行情数据(含五档盘口)
        """
        try:
            # 调用 stock_bid_ask_em 获取完整行情数据
            df = await asyncio.to_thread(ak.stock_bid_ask_em, symbol=symbol)
            
            # 转换 item/value 格式为字典
            data_dict = dict(zip(df['item'], df['value']))
            
            # 计算振幅
            amplitude = None
            if all(k in data_dict for k in ['最高', '最低', '昨收']):
                high = float(data_dict['最高'])
                low = float(data_dict['最低'])
                prev_close = float(data_dict['昨收'])
                if prev_close > 0:
                    amplitude = (high - low) / prev_close * 100
            
            # 从列表缓存中获取股票名称
            name = await self._get_stock_name_from_cache(symbol)
            
            # 构建 StockSpot 对象
            spot = StockSpot(
                symbol=symbol,
                name=name,
                price=float(data_dict.get('最新', 0)),
                open=float(data_dict.get('今开', 0)),
                prev_close=float(data_dict.get('昨收', 0)),
                high=float(data_dict.get('最高', 0)),
                low=float(data_dict.get('最低', 0)),
                avg_price=float(data_dict.get('均价', 0)) if '均价' in data_dict else None,
                volume=float(data_dict.get('总手', 0)),
                amount=float(data_dict.get('金额', 0)),
                change=float(data_dict.get('涨跌', 0)),
                change_percent=float(data_dict.get('涨幅', 0)),
                turnover_rate=float(data_dict.get('换手', 0)) if '换手' in data_dict else None,
                amplitude=amplitude,
                volume_ratio=float(data_dict.get('量比', 0)) if '量比' in data_dict else None,
                upper_limit=float(data_dict.get('涨停', 0)) if '涨停' in data_dict else None,
                lower_limit=float(data_dict.get('跌停', 0)) if '跌停' in data_dict else None,
                outer_volume=float(data_dict.get('外盘', 0)) if '外盘' in data_dict else None,
                inner_volume=float(data_dict.get('内盘', 0)) if '内盘' in data_dict else None,
                # 五档买盘
                bid1=float(data_dict.get('buy_1', 0)) if 'buy_1' in data_dict else None,
                bid1_volume=float(data_dict.get('buy_1_vol', 0)) if 'buy_1_vol' in data_dict else None,
                bid2=float(data_dict.get('buy_2', 0)) if 'buy_2' in data_dict else None,
                bid2_volume=float(data_dict.get('buy_2_vol', 0)) if 'buy_2_vol' in data_dict else None,
                bid3=float(data_dict.get('buy_3', 0)) if 'buy_3' in data_dict else None,
                bid3_volume=float(data_dict.get('buy_3_vol', 0)) if 'buy_3_vol' in data_dict else None,
                bid4=float(data_dict.get('buy_4', 0)) if 'buy_4' in data_dict else None,
                bid4_volume=float(data_dict.get('buy_4_vol', 0)) if 'buy_4_vol' in data_dict else None,
                bid5=float(data_dict.get('buy_5', 0)) if 'buy_5' in data_dict else None,
                bid5_volume=float(data_dict.get('buy_5_vol', 0)) if 'buy_5_vol' in data_dict else None,
                # 五档卖盘
                ask1=float(data_dict.get('sell_1', 0)) if 'sell_1' in data_dict else None,
                ask1_volume=float(data_dict.get('sell_1_vol', 0)) if 'sell_1_vol' in data_dict else None,
                ask2=float(data_dict.get('sell_2', 0)) if 'sell_2' in data_dict else None,
                ask2_volume=float(data_dict.get('sell_2_vol', 0)) if 'sell_2_vol' in data_dict else None,
                ask3=float(data_dict.get('sell_3', 0)) if 'sell_3' in data_dict else None,
                ask3_volume=float(data_dict.get('sell_3_vol', 0)) if 'sell_3_vol' in data_dict else None,
                ask4=float(data_dict.get('sell_4', 0)) if 'sell_4' in data_dict else None,
                ask4_volume=float(data_dict.get('sell_4_vol', 0)) if 'sell_4_vol' in data_dict else None,
                ask5=float(data_dict.get('sell_5', 0)) if 'sell_5' in data_dict else None,
                ask5_volume=float(data_dict.get('sell_5_vol', 0)) if 'sell_5_vol' in data_dict else None,
                timestamp=datetime.now()
            )
            
            logger.info("stock_spot_cn_optimized_fetched", symbol=symbol)
            return spot
            
        except Exception as e:
            logger.error("stock_spot_cn_optimized_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取A股实时行情失败: {str(e)}")
    
    async def _get_stock_name_from_cache(self, symbol: str) -> str | None:
        """从列表缓存中获取股票名称
        
        Args:
            symbol: 股票代码
            
        Returns:
            股票名称,未找到则返回None
        """
        try:
            # 尝试从缓存的股票列表中获取名称
            from app.core.cache import cache
            cache_key = "stock:list:CN"
            cached = await cache.get(cache_key)
            if cached:
                for item in cached:
                    if item.get('symbol') == symbol:
                        return item.get('name')
        except Exception as e:
            logger.warning("get_stock_name_from_cache_failed", error=str(e), symbol=symbol)
        
        return None
    
    async def get_kline(
        self,
        symbol: str,
        market: MarketType | None = None,
        period: str = "day",
        adjust: str = "qfq",
        limit: int | None = None,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> KLineResponse:
        """获取 K 线数据

        Args:
            symbol: 股票代码
            market: 市场类型
            period: 周期 (day/week/month)
            adjust: 复权类型 (qfq/hfq/"")
            limit: 数据条数 (仅当 start_date 未指定时生效)
            start_date: 开始日期 (YYYYMMDD)
            end_date: 结束日期 (YYYYMMDD，默认当前日期）

        Returns:
            KLineResponse: K 线数据和元数据
        """
        try:
            # 确定结束日期
            if not end_date:
                end_date = datetime.now().strftime("%Y%m%d")

            # 调用 AkShare 获取历史数据
            df = await asyncio.to_thread(
                ak.stock_zh_a_hist,
                symbol=symbol,
                period="daily" if period == "day" else period,
                start_date=start_date or "19700101",
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
                    volume=float(row['成交量']),
                    amount=float(row['成交额']) if '成交额' in row else None,
                    change=float(row['涨跌额']) if '涨跌额' in row else None,
                    change_percent=float(row['涨跌幅']) if '涨跌幅' in row else None,
                    amplitude=float(row['振幅']) if '振幅' in row else None,
                    turnover_rate=float(row['换手率']) if '换手率' in row else None
                ))

            # 构建元数据
            meta = KLineMeta(
                symbol=symbol,
                period=period,
                count=len(klines),
                first_date=str(df['日期'].iloc[0]) if not df.empty else "",
                last_date=str(df['日期'].iloc[-1]) if not df.empty else ""
            )

            logger.info("stock_kline_fetched", symbol=symbol, period=period,
                       start_date=start_date, end_date=end_date, count=len(klines))

            return KLineResponse(data=klines, meta=meta)

        except Exception as e:
            logger.error("stock_kline_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取 K 线数据失败: {str(e)}")
    
    async def get_profile(self, symbol: str, market: MarketType | None = None) -> StockProfile:
        """获取公司基本信息（纯公司信息，不含交易数据）

        Args:
            symbol: 股票代码
            market: 市场类型

        Returns:
            公司信息
        """
        try:
            # A股：使用雪球接口获取纯公司信息
            if market == "CN" or (market is None and symbol.isdigit() and len(symbol) == 6):
                # 需要添加交易所前缀
                ts_symbol = f"SH{symbol}" if symbol.startswith('6') else f"SZ{symbol}"
                df = await asyncio.to_thread(ak.stock_individual_basic_info_xq, symbol=ts_symbol)
                if df.empty:
                    raise DataSourceError(f"未找到股票: {symbol}")

                # 转换为字典方便访问
                info_dict = dict(zip(df['item'], df['value']))

                # 处理行业字段（可能是字典格式）
                industry = None
                affiliate_industry = info_dict.get('affiliate_industry')
                if affiliate_industry:
                    if isinstance(affiliate_industry, dict):
                        industry = affiliate_industry.get('ind_name')
                    else:
                        industry = str(affiliate_industry)

                # 处理日期字段（毫秒时间戳）
                def parse_timestamp(ts):
                    if ts:
                        try:
                            return pd.to_datetime(int(ts), unit='ms').date()
                        except (ValueError, TypeError):
                            return None
                    return None

                profile = StockProfile(
                    symbol=symbol,
                    name=info_dict.get('org_short_name_cn', ''),
                    full_name=info_dict.get('org_name_cn'),
                    english_name=info_dict.get('org_name_en'),
                    industry=industry,
                    province=info_dict.get('provincial_name'),
                    listing_date=parse_timestamp(info_dict.get('listed_date')),
                    established_date=parse_timestamp(info_dict.get('established_date')),
                    main_business=info_dict.get('main_operation_business'),
                    operating_scope=info_dict.get('operating_scope'),
                    introduction=info_dict.get('org_cn_introduction'),
                    # 注册资本单位是元，转换为亿元
                    registered_capital=float(info_dict.get('reg_asset', 0)) / 100000000 if info_dict.get('reg_asset') else None,
                    employee_count=int(info_dict.get('staff_num', 0)) if info_dict.get('staff_num') else None,
                    legal_representative=info_dict.get('legal_representative'),
                    chairman=info_dict.get('chairman'),
                    general_manager=info_dict.get('general_manager'),
                    secretary=info_dict.get('secretary'),
                    website=info_dict.get('org_website'),
                    email=info_dict.get('email'),
                    phone=info_dict.get('telephone'),
                    fax=info_dict.get('fax'),
                    postcode=info_dict.get('postcode'),
                    reg_address=info_dict.get('reg_address_cn'),
                    office_address=info_dict.get('office_address_cn'),
                    pre_name=info_dict.get('pre_name_cn'),
                    actual_controller=info_dict.get('actual_controller')
                )
            else:
                # 港股和美股暂时返回基本信息
                profile = StockProfile(
                    symbol=symbol,
                    name=symbol
                )

            logger.info("stock_profile_fetched", symbol=symbol, market=market)
            return profile

        except Exception as e:
            logger.error("stock_profile_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取公司信息失败: {str(e)}")
    
    async def get_valuation(self, symbol: str, market: MarketType | None = None) -> StockValuation:
        """获取估值数据
        
        Args:
            symbol: 股票代码
            market: 市场类型
            
        Returns:
            估值数据
        """
        try:
            # A股：从实时行情中提取
            if market == "CN" or (market is None and symbol.isdigit() and len(symbol) == 6):
                df = await asyncio.to_thread(ak.stock_zh_a_spot_em)
                row = df[df['代码'] == symbol]
                
                if row.empty:
                    raise DataSourceError(f"未找到股票: {symbol}")
                
                row = row.iloc[0]
                
                valuation = StockValuation(
                    symbol=symbol,
                    market_cap=float(row.get('总市值', 0)) / 100000000 if '总市值' in row else None,
                    float_market_cap=float(row.get('流通市值', 0)) / 100000000 if '流通市值' in row else None,
                    pe=float(row.get('市盈率-动态', row.get('市盈率', 0))) if '市盈率' in row or '市盈率-动态' in row else None,
                    pb=float(row.get('市净率', 0)) if '市净率' in row else None,
                    dividend_yield=float(row.get('股息率', 0)) if '股息率' in row else None,
                    change_60d=float(row.get('60日涨跌幅', 0)) if '60日涨跌幅' in row else None,
                    change_ytd=float(row.get('年初至今涨跌幅', 0)) if '年初至今涨跌幅' in row else None
                )
            else:
                # 港股和美股暂时返回基本数据
                valuation = StockValuation(symbol=symbol)
            
            logger.info("stock_valuation_fetched", symbol=symbol, market=market)
            return valuation

        except Exception as e:
            logger.error("stock_valuation_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取估值数据失败: {str(e)}")

    def _parse_period_filter(self, period: str | None) -> Optional[str]:
        """解析 period 参数为过滤字符串

        Args:
            period: 格式如 2024Q1, 2024H1, 2024

        Returns:
            过滤字符串，用于匹配 report_name
        """
        if not period:
            return None

        # 2024Q1 -> 2024.*1季报
        # 2024H1 -> 2024.*半年报
        # 2024 -> 2024
        if period.endswith('Q1'):
            return f"{period[:4]}.*一季报"
        elif period.endswith('Q2'):
            return f"{period[:4]}.*中报"
        elif period.endswith('Q3'):
            return f"{period[:4]}.*三季报"
        elif period.endswith('Q4'):
            return f"{period[:4]}.*年报"
        elif period.endswith('H1'):
            return f"{period[:4]}.*半年报"
        elif period.endswith('H2'):
            return f"{period[:4]}.*年报"
        else:
            # 年度，直接匹配
            return period

    async def get_financial_cn(
        self, symbol: str, limit: int = 8, period: str | None = None
    ) -> StockFinancialCNResponse:
        """获取 A 股财务数据（多期）

        Args:
            symbol: 股票代码
            limit: 返回报告期数量，默认 8
            period: 筛选特定报告期，格式 2024Q1, 2024H1, 2024

        Returns:
            A 股财务数据响应
        """
        try:
            # 需要添加市场前缀
            ts_symbol = f"sh{symbol}" if symbol.startswith('6') else f"sz{symbol}"

            # 并发获取三种报表数据
            df_income, df_balance, df_cashflow = await asyncio.gather(
                asyncio.to_thread(
                    ak.stock_financial_report_sina,
                    stock=ts_symbol,
                    symbol="利润表"
                ),
                asyncio.to_thread(
                    ak.stock_financial_report_sina,
                    stock=ts_symbol,
                    symbol="资产负债表"
                ),
                asyncio.to_thread(
                    ak.stock_financial_report_sina,
                    stock=ts_symbol,
                    symbol="现金流量表"
                )
            )

            if df_income.empty:
                raise DataSourceError(f"未找到财务数据: {symbol}")

            # 构建以报告日为键的字典
            income_dict = {}
            for _, row in df_income.iterrows():
                report_date = str(int(row['报告日']))
                income_dict[report_date] = row

            balance_dict = {}
            for _, row in df_balance.iterrows():
                report_date = str(int(row['报告日']))
                balance_dict[report_date] = row

            cashflow_dict = {}
            for _, row in df_cashflow.iterrows():
                report_date = str(int(row['报告日']))
                cashflow_dict[report_date] = row

            # 获取所有报告日并排序
            all_dates = sorted(set(income_dict.keys()) & set(balance_dict.keys()) & set(cashflow_dict.keys()),
                               reverse=True)

            # 过滤特定报告期
            period_filter = self._parse_period_filter(period)
            if period_filter:
                all_dates = [d for d in all_dates if period_filter in d]

            # 取最近的 N 个报告期
            all_dates = all_dates[:limit]

            # 构建响应
            periods = []
            for report_date in all_dates:
                income_row = income_dict.get(report_date)
                balance_row = balance_dict.get(report_date)
                cashflow_row = cashflow_dict.get(report_date)

                if income_row is None or income_row.empty or balance_row is None or balance_row.empty or cashflow_row is None or cashflow_row.empty:
                    continue

                # 解析报告名称
                report_name = str(int(report_date))
                if report_date.endswith('0331'):
                    report_name += 'Q1'
                elif report_date.endswith('0630'):
                    report_name += 'Q2'
                elif report_date.endswith('0930'):
                    report_name += 'Q3'
                elif report_date.endswith('1231'):
                    report_name += 'Q4'

                period_data = StockFinancialCNPeriod(
                    report_date=pd.to_datetime(report_date).date(),
                    report_name=report_name,
                    # 利润表
                    revenue=self._to_float(income_row.get('营业总收入')) / 100000000 if income_row.get('营业总收入') else None,
                    operating_cost=self._to_float(income_row.get('营业成本')) / 100000000 if income_row.get('营业成本') else None,
                    gross_profit=self._to_float(income_row.get('毛利')) / 100000000 if income_row.get('毛利') else None,
                    operating_profit=self._to_float(income_row.get('营业利润')) / 100000000 if income_row.get('营业利润') else None,
                    net_profit=self._to_float(income_row.get('净利润')) / 100000000 if income_row.get('净利润') else None,
                    net_profit_attributable=self._to_float(income_row.get('归属于母公司所有者的净利润')) / 100000000 if income_row.get('归属于母公司所有者的净利润') else None,
                    deducted_net_profit=None,  # 利润表不包含扣非净利润
                    # 盈利能力
                    eps=self._to_float(income_row.get('基本每股收益')),
                    gross_margin=self._to_float(income_row.get('销售毛利率')),
                    net_margin=self._to_float(income_row.get('销售净利率')),
                    roe=None,  # 需要计算
                    roa=None,  # 需要计算
                    # 偿债能力
                    total_assets=self._to_float(balance_row.get('资产总计')) / 100000000 if balance_row.get('资产总计') else None,
                    total_liabilities=self._to_float(balance_row.get('负债合计')) / 100000000 if balance_row.get('负债合计') else None,
                    debt_ratio=self._to_float(balance_row.get('负债合计')) / self._to_float(balance_row.get('资产总计')) * 100 if balance_row.get('负债合计') and balance_row.get('资产总计') else None,
                    current_ratio=self._to_float(balance_row.get('流动资产合计')) / self._to_float(balance_row.get('流动负债合计')) if balance_row.get('流动资产合计') and balance_row.get('流动负债合计') else None,
                    quick_ratio=None,  # 需要流动资产-存货计算
                    # 营运能力
                    turnover_rate=None,  # 需要收入/平均资产计算
                    inventory_turnover=None,
                    receivable_turnover=None,
                    # 现金流
                    operating_cf=self._to_float(cashflow_row.get('经营活动产生的现金流量净额')) / 100000000 if cashflow_row.get('经营活动产生的现金流量净额') else None,
                    investing_cf=self._to_float(cashflow_row.get('投资活动产生的现金流量净额')) / 100000000 if cashflow_row.get('投资活动产生的现金流量净额') else None,
                    financing_cf=self._to_float(cashflow_row.get('筹资活动产生的现金流量净额')) / 100000000 if cashflow_row.get('筹资活动产生的现金流量净额') else None,
                    net_cf=self._to_float(cashflow_row.get('现金及现金等价物净增加额')) / 100000000 if cashflow_row.get('现金及现金等价物净增加额') else None,
                    net_cf_per_share=None,  # 需要每股数据
                )
                periods.append(period_data)

            response = StockFinancialCNResponse(
                symbol=symbol,
                market="CN",
                count=len(periods),
                data=periods
            )

            logger.info("stock_financial_cn_fetched", symbol=symbol, count=len(periods))
            return response

        except Exception as e:
            logger.error("stock_financial_cn_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取A股财务数据失败: {str(e)}")

    async def get_financial_hk(
        self, symbol: str, limit: int = 8
    ) -> StockFinancialHKResponse:
        """获取港股财务数据（多期）

        Args:
            symbol: 股票代码
            limit: 返回报告期数量，默认 8

        Returns:
            港股财务数据响应
        """
        try:
            # 获取利润表数据
            df_income = await asyncio.to_thread(
                ak.stock_financial_hk_report_em,
                stock=symbol,
                symbol="利润表",
                indicator="年度"
            )

            if df_income.empty:
                raise DataSourceError(f"未找到港股财务数据: {symbol}")

            # 按日期排序，取最近的 N 个
            df_income = df_income.sort_values('REPORT_DATE', ascending=False).head(limit)

            # 构建响应
            periods = []
            for _, row in df_income.iterrows():
                # 港股返回的金额单位是元，转换为亿港币
                amount = float(row.get('AMOUNT', 0)) / 100000000 if row.get('AMOUNT') else None

                period_data = StockFinancialHKPeriod(
                    report_date=pd.to_datetime(row.get('REPORT_DATE')).date() if row.get('REPORT_DATE') else None,
                    report_name=row.get('REPORT_NAME', ''),
                    revenue=amount,
                    profit_before_tax=None,  # 需要从资产负债表获取
                    profit_after_tax=None,
                    profit_attributable=None,
                    eps=None,  # 需要额外计算
                    net_margin=None,
                    roe=None,
                )
                periods.append(period_data)

            response = StockFinancialHKResponse(
                symbol=symbol,
                market="HK",
                currency="HKD",
                count=len(periods),
                data=periods
            )

            logger.info("stock_financial_hk_fetched", symbol=symbol, count=len(periods))
            return response

        except Exception as e:
            logger.error("stock_financial_hk_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取港股财务数据失败: {str(e)}")

    async def get_financial_us(
        self, symbol: str, limit: int = 8
    ) -> StockFinancialUSResponse:
        """获取美股财务数据（多期）

        Args:
            symbol: 股票代码
            limit: 返回报告期数量，默认 8

        Returns:
            美股财务数据响应
        """
        try:
            # 获取利润表数据
            df_income = await asyncio.to_thread(
                ak.stock_financial_us_report_em,
                stock=symbol,
                symbol="综合损益表",
                indicator="年报"
            )

            if df_income.empty:
                raise DataSourceError(f"未找到美股财务数据: {symbol}")

            # 按日期排序，取最近的 N 个
            df_income = df_income.sort_values('REPORT_DATE', ascending=False).head(limit)

            # 构建响应
            periods = []
            for _, row in df_income.iterrows():
                # 美股返回的金额单位是元，转换为百万美元
                amount = float(row.get('AMOUNT', 0)) / 1000000 if row.get('AMOUNT') else None

                period_data = StockFinancialUSPeriod(
                    report_date=pd.to_datetime(row.get('REPORT_DATE')).date() if row.get('REPORT_DATE') else None,
                    report_name=row.get('REPORT_NAME', '') or "年报",
                    total_revenue=amount,
                    cost_of_revenue=None,
                    gross_profit=None,
                    operating_income=None,
                    net_income=amount,
                    eps=None,
                    gross_margin=None,
                    net_margin=None,
                )
                periods.append(period_data)

            response = StockFinancialUSResponse(
                symbol=symbol,
                market="US",
                currency="USD",
                count=len(periods),
                data=periods
            )

            logger.info("stock_financial_us_fetched", symbol=symbol, count=len(periods))
            return response

        except Exception as e:
            logger.error("stock_financial_us_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取美股财务数据失败: {str(e)}")

    def _to_float(self, value) -> Optional[float]:
        """安全转换为 float"""
        if value is None or pd.isna(value):
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None

    async def get_fund_flow(
        self,
        symbol: str,
        limit: int = 20,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> FundFlowResponse:
        """获取资金流向（多期，仅A股）

        Args:
            symbol: 股票代码
            limit: 返回数据条数，默认 20
            start_date: 开始日期 (YYYYMMDD，与 limit 二选一)
            end_date: 结束日期 (YYYYMMDD，默认当前日期)

        Returns:
            资金流向数据（多期）
        """
        try:
            # 确定市场标识
            if symbol.startswith('6'):
                market = "sh"
            elif symbol.startswith('0') or symbol.startswith('3'):
                market = "sz"
            else:
                market = "bj"

            # 确定结束日期
            if not end_date:
                end_date = datetime.now().strftime("%Y%m%d")

            # stock_individual_fund_flow 返回近 100 个交易日的数据
            df = await asyncio.to_thread(ak.stock_individual_fund_flow, stock=symbol, market=market)

            if df.empty:
                raise DataSourceError(f"未找到资金流向数据: {symbol}")

            # 过滤日期范围
            if start_date:
                df = df[(df['日期'] >= start_date) & (df['日期'] <= end_date)]

            # 按日期排序（降序）
            df = df.sort_values('日期', ascending=False)

            # 取最近 N 条
            if not start_date:
                df = df.head(limit)

            # 转换为 FundFlowPeriod
            periods = []
            for _, row in df.iterrows():
                periods.append(FundFlowPeriod(
                    date=str(row['日期']),
                    close=float(row.get('收盘价', 0)) if pd.notna(row.get('收盘价')) else None,
                    change_percent=float(row.get('涨跌幅', 0)) if pd.notna(row.get('涨跌幅')) else None,
                    main_net_inflow=float(row.get('主力净流入-净额', 0)) if pd.notna(row.get('主力净流入-净额')) else 0.0,
                    main_net_inflow_ratio=float(row.get('主力净流入-净占比', 0)) if pd.notna(row.get('主力净流入-净占比')) else None,
                    super_large_net_inflow=float(row.get('超大单净流入-净额', 0)) if pd.notna(row.get('超大单净流入-净额')) else None,
                    super_large_net_inflow_ratio=float(row.get('超大单净流入-净占比', 0)) if pd.notna(row.get('超大单净流入-净占比')) else None,
                    large_net_inflow=float(row.get('大单净流入-净额', 0)) if pd.notna(row.get('大单净流入-净额')) else None,
                    large_net_inflow_ratio=float(row.get('大单净流入-净占比', 0)) if pd.notna(row.get('大单净流入-净占比')) else None,
                    medium_net_inflow=float(row.get('中单净流入-净额', 0)) if pd.notna(row.get('中单净流入-净额')) else None,
                    medium_net_inflow_ratio=float(row.get('中单净流入-净占比', 0)) if pd.notna(row.get('中单净流入-净占比')) else None,
                    small_net_inflow=float(row.get('小单净流入-净额', 0)) if pd.notna(row.get('小单净流入-净额')) else None,
                    small_net_inflow_ratio=float(row.get('小单净流入-净占比', 0)) if pd.notna(row.get('小单净流入-净占比')) else None,
                ))

            response = FundFlowResponse(
                symbol=symbol,
                market="CN",
                count=len(periods),
                data=periods
            )

            logger.info("stock_fund_flow_fetched", symbol=symbol, count=len(periods))
            return response

        except Exception as e:
            logger.error("stock_fund_flow_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取资金流向失败: {str(e)}")
    
    async def get_bid_ask(self, symbol: str) -> BidAsk:
        """获取五档盘口（仅A股）
        
        Args:
            symbol: 股票代码
            
        Returns:
            五档盘口数据
        """
        try:
            df = await asyncio.to_thread(ak.stock_bid_ask_em, symbol=symbol)
            
            if df.empty:
                raise DataSourceError(f"未找到盘口数据: {symbol}")
            
            row = df.iloc[0]
            
            # 构建买盘五档
            bids = []
            for i in range(1, 6):
                price_key = f'买{i}'
                volume_key = f'买量{i}'
                if price_key in row and volume_key in row:
                    bids.append(PriceLevel(
                        price=float(row[price_key]),
                        volume=float(row[volume_key])
                    ))
            
            # 构建卖盘五档
            asks = []
            for i in range(1, 6):
                price_key = f'卖{i}'
                volume_key = f'卖量{i}'
                if price_key in row and volume_key in row:
                    asks.append(PriceLevel(
                        price=float(row[price_key]),
                        volume=float(row[volume_key])
                    ))
            
            bid_ask = BidAsk(
                symbol=symbol,
                bids=bids,
                asks=asks,
                upper_limit=float(row.get('涨停价', 0)) if '涨停价' in row else None,
                lower_limit=float(row.get('跌停价', 0)) if '跌停价' in row else None,
                outer_volume=float(row.get('外盘', 0)) if '外盘' in row else None,
                inner_volume=float(row.get('内盘', 0)) if '内盘' in row else None
            )
            
            logger.info("stock_bid_ask_fetched", symbol=symbol)
            return bid_ask
            
        except Exception as e:
            logger.error("stock_bid_ask_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取五档盘口失败: {str(e)}")


# 全局客户端实例
stock_client = StockClient()
