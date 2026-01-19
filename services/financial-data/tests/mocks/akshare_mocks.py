"""AkShare 模块的 Mock 对象"""
from datetime import datetime
from app.modules.akshare.schemas import StockInfo, RealtimeQuote, KLinePoint, FundInfo


def get_mock_stock_list():
    """Mock 股票列表"""
    return [
        StockInfo(symbol="600519", name="贵州茅台", market="CN"),
        StockInfo(symbol="000001", name="平安银行", market="CN"),
        StockInfo(symbol="000002", name="万科A", market="CN"),
    ]


def get_mock_stock_search_result(query: str):
    """Mock 股票搜索结果"""
    if "茅台" in query:
        return [StockInfo(symbol="600519", name="贵州茅台", market="CN")]
    elif "平安" in query:
        return [
            StockInfo(symbol="000001", name="平安银行", market="CN"),
            StockInfo(symbol="601318", name="中国平安", market="CN"),
        ]
    return []


def get_mock_realtime_quote():
    """Mock 实时行情"""
    return RealtimeQuote(
        price=1800.0,
        open=1790.0,
        prev_close=1785.0,
        high=1810.0,
        low=1780.0,
        volume=1000000.0,
        amount=1800000000.0,
        change=15.0,
        change_percent=0.84,
        turnover_rate=0.5,
        market_cap=2260000.0,
        pe=45.5,
        pb=12.3,
        trading_status="TRADING",
        timestamp=datetime.now()
    )


def get_mock_kline_data(limit: int = 30):
    """Mock K 线数据"""
    return [
        KLinePoint(
            timestamp=1640000000000 + i * 86400000,
            open=1800.0 + i,
            high=1810.0 + i,
            low=1790.0 + i,
            close=1805.0 + i,
            volume=1000000.0
        )
        for i in range(limit)
    ]


def get_mock_fund_list():
    """Mock 基金列表"""
    return [
        FundInfo(symbol="110022", name="易方达消费行业", type="FUND"),
        FundInfo(symbol="161725", name="招商中证白酒", type="ETF"),
        FundInfo(symbol="000001", name="华夏成长", type="FUND"),
    ]


def get_mock_fund_search_result(query: str):
    """Mock 基金搜索结果"""
    if "消费" in query:
        return [FundInfo(symbol="110022", name="易方达消费行业", type="FUND")]
    elif "白酒" in query:
        return [FundInfo(symbol="161725", name="招商中证白酒", type="ETF")]
    return []
