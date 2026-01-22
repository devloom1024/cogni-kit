"""股票数据 AkShare 客户端"""
import akshare as ak
import pandas as pd
from datetime import datetime
from typing import List
import asyncio
import structlog

from app.core.exceptions import DataSourceError
from app.modules.akshare.stock.schemas import (
    StockListItem, StockSpot, KLinePoint, MarketType,
    StockProfile, StockValuation, StockFinancial,
    StockShareholders, ShareholderItem, FundFlow,
    BidAsk, PriceLevel, BatchSymbolItem
)

logger = structlog.get_logger()


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
            df = await asyncio.to_thread(
                ak.stock_zh_a_hist,
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
            
            logger.info("stock_kline_fetched", symbol=symbol, period=period, count=len(klines))
            return klines
            
        except Exception as e:
            logger.error("stock_kline_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取 K 线数据失败: {str(e)}")
    
    async def get_profile(self, symbol: str, market: MarketType | None = None) -> StockProfile:
        """获取公司基本信息
        
        Args:
            symbol: 股票代码
            market: 市场类型
            
        Returns:
            公司信息
        """
        try:
            # A股：使用 stock_individual_info_em
            if market == "CN" or (market is None and symbol.isdigit() and len(symbol) == 6):
                df = await asyncio.to_thread(ak.stock_individual_info_em, symbol=symbol)
                if df.empty:
                    raise DataSourceError(f"未找到股票: {symbol}")
                
                # 转换为字典方便访问
                info_dict = dict(zip(df['item'], df['value']))
                
                profile = StockProfile(
                    symbol=symbol,
                    name=info_dict.get('股票简称', ''),
                    full_name=info_dict.get('公司名称'),
                    industry=info_dict.get('行业'),
                    listing_date=pd.to_datetime(info_dict.get('上市时间')).date() if info_dict.get('上市时间') else None,
                    total_shares=float(info_dict.get('总股本', 0)) / 100000000 if info_dict.get('总股本') else None,
                    float_shares=float(info_dict.get('流通股', 0)) / 100000000 if info_dict.get('流通股') else None,
                    main_business=info_dict.get('主营业务'),
                    registered_capital=float(info_dict.get('注册资本', 0)) / 100000000 if info_dict.get('注册资本') else None,
                    employee_count=int(info_dict.get('员工人数', 0)) if info_dict.get('员工人数') else None,
                    legal_representative=info_dict.get('法人代表'),
                    secretary=info_dict.get('董秘'),
                    website=info_dict.get('公司网址'),
                    phone=info_dict.get('联系电话'),
                    address=info_dict.get('办公地址')
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
    
    async def get_financial(self, symbol: str, market: MarketType | None = None) -> StockFinancial:
        """获取财务数据摘要
        
        Args:
            symbol: 股票代码
            market: 市场类型
            
        Returns:
            财务数据
        """
        try:
            # A股：使用 stock_financial_abstract（只需 symbol 参数）
            if market == "CN" or (market is None and symbol.isdigit() and len(symbol) == 6):
                df = await asyncio.to_thread(ak.stock_financial_abstract, symbol=symbol)
                
                if df.empty:
                    raise DataSourceError(f"未找到财务数据: {symbol}")
                
                # DataFrame 是转置的，列是报告期，行是指标
                # 取第一列（最新一期）
                latest_col = df.columns[2]  # 跳过 '选项' 和 '指标' 列
                
                # 构建指标字典
                metrics = {}
                for _, row in df.iterrows():
                    metrics[row['指标']] = row[latest_col]
                
                financial = StockFinancial(
                    symbol=symbol,
                    report_date=pd.to_datetime(latest_col).date(),
                    revenue=float(metrics.get('营业总收入', 0)) / 100000000 if metrics.get('营业总收入') else None,
                    net_profit=float(metrics.get('归母净利润', 0)) / 100000000 if metrics.get('归母净利润') else None,
                    eps=float(metrics.get('基本每股收益', 0)) if metrics.get('基本每股收益') else None,
                    bvps=float(metrics.get('每股净资产', 0)) if metrics.get('每股净资产') else None,
                    roe=float(metrics.get('净资产收益率', 0)) if metrics.get('净资产收益率') else None,
                    gross_margin=float(metrics.get('销售毛利率', 0)) if metrics.get('销售毛利率') else None,
                    debt_ratio=float(metrics.get('资产负债率', 0)) if metrics.get('资产负债率') else None
                )
            else:
                # 港股和美股暂时返回基本数据
                financial = StockFinancial(
                    symbol=symbol,
                    report_date=datetime.now().date()
                )
            
            logger.info("stock_financial_fetched", symbol=symbol, market=market)
            return financial
            
        except Exception as e:
            logger.error("stock_financial_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取财务数据失败: {str(e)}")
    
    async def get_shareholders(self, symbol: str) -> StockShareholders:
        """获取股东信息（仅A股）
        
        Args:
            symbol: 股票代码
            
        Returns:
            股东信息
        """
        try:
            # 需要带市场标识和日期参数
            # 使用最近的季度末日期
            from datetime import date
            current_year = date.today().year
            report_date = f"{current_year}0630"  # 先尝试当年6月30日
            
            # 确定市场标识
            if symbol.startswith('6'):
                market_symbol = f"sh{symbol}"
            else:
                market_symbol = f"sz{symbol}"
            
            # 获取十大股东，如果失败则尝试上一年的数据
            df_top10 = None
            for year_offset in [0, -1]:
                try:
                    test_date = f"{current_year + year_offset}1231" if year_offset < 0 else report_date
                    df_top10 = await asyncio.to_thread(ak.stock_gdfx_top_10_em, symbol=market_symbol, date=test_date)
                    if not df_top10.empty:
                        break
                except Exception as e:
                    logger.warning("shareholders_fetch_attempt_failed", symbol=symbol, date=test_date, error=str(e))
                    continue
            
            top10_shareholders = []
            
            if df_top10 is not None and not df_top10.empty:
                # 直接使用文档中的列名，添加错误处理
                for idx, row in df_top10.head(10).iterrows():
                    try:
                        top10_shareholders.append(ShareholderItem(
                            name=str(row['股东名称']),
                            shares=float(row['持股数']) / 10000,  # 转换为万股
                            percentage=float(row['占总股本持股比例']),
                            change=str(row.get('增减', ''))
                        ))
                    except (KeyError, ValueError, TypeError) as e:
                        logger.warning("shareholder_item_parse_failed", index=idx, error=str(e))
                        continue
            
            # 十大流通股东暂时返回空
            top10_float_shareholders = []
            
            shareholders = StockShareholders(
                symbol=symbol,
                shareholder_count=None,
                top10_shareholders=top10_shareholders,
                top10_float_shareholders=top10_float_shareholders
            )
            
            logger.info("stock_shareholders_fetched", symbol=symbol)
            return shareholders
            
        except Exception as e:
            logger.error("stock_shareholders_fetch_failed", error=str(e), symbol=symbol)
            raise DataSourceError(f"获取股东信息失败: {str(e)}")
    
    async def get_fund_flow(self, symbol: str) -> FundFlow:
        """获取资金流向（仅A股）
        
        Args:
            symbol: 股票代码
            
        Returns:
            资金流向数据
        """
        try:
            # 确定市场标识
            if symbol.startswith('6'):
                market = "sh"
            elif symbol.startswith('0') or symbol.startswith('3'):
                market = "sz"
            else:
                market = "bj"
            
            # stock_individual_fund_flow 参数是 stock 和 market
            df = await asyncio.to_thread(ak.stock_individual_fund_flow, stock=symbol, market=market)
            
            if df.empty:
                raise DataSourceError(f"未找到资金流向数据: {symbol}")
            
            # 取最新一天的数据
            latest = df.iloc[-1]
            
            fund_flow = FundFlow(
                symbol=symbol,
                main_net_inflow=float(latest.get('主力净流入-净额', 0)),
                main_net_inflow_ratio=float(latest.get('主力净流入-净占比', 0)),
                super_large_net_inflow=float(latest.get('超大单净流入-净额', 0)),
                large_net_inflow=float(latest.get('大单净流入-净额', 0)),
                medium_net_inflow=float(latest.get('中单净流入-净额', 0)),
                small_net_inflow=float(latest.get('小单净流入-净额', 0))
            )
            
            logger.info("stock_fund_flow_fetched", symbol=symbol)
            return fund_flow
            
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
    
    async def get_spot_batch(self, symbols: List[BatchSymbolItem]) -> dict[str, StockSpot]:
        """批量获取实时行情
        
        Args:
            symbols: 股票列表（最多50只）
            
        Returns:
            股票代码到行情的映射
        """
        try:
            # 限制数量
            if len(symbols) > 50:
                symbols = symbols[:50]
            
            # 并发获取
            tasks = [self.get_spot(item.symbol, item.market) for item in symbols]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # 构建结果字典
            batch_result = {}
            for item, result in zip(symbols, results):
                if isinstance(result, Exception):
                    logger.warning("batch_spot_item_failed", symbol=item.symbol, error=str(result))
                    continue
                batch_result[item.symbol] = result
            
            logger.info("stock_spot_batch_fetched", count=len(batch_result))
            return batch_result
            
        except Exception as e:
            logger.error("stock_spot_batch_failed", error=str(e))
            raise DataSourceError(f"批量获取行情失败: {str(e)}")


# 全局客户端实例
stock_client = StockClient()
