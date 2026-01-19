"""共享测试数据 Fixtures"""
import pytest
from datetime import datetime


@pytest.fixture
def sample_kline_data():
    """示例 K 线数据"""
    return [
        {
            "timestamp": 1640000000000 + i * 86400000,
            "open": 100.0 + i,
            "high": 105.0 + i,
            "low": 99.0 + i,
            "close": 103.0 + i,
            "volume": 10000.0 + i * 100
        }
        for i in range(30)
    ]


@pytest.fixture
def sample_stock_info():
    """示例股票信息"""
    return {
        "symbol": "600519",
        "name": "贵州茅台",
        "market": "CN"
    }


@pytest.fixture
def sample_fund_info():
    """示例基金信息"""
    return {
        "symbol": "110022",
        "name": "易方达消费行业",
        "type": "FUND"
    }


@pytest.fixture
def sample_realtime_quote():
    """示例实时行情数据"""
    return {
        "price": 1800.0,
        "open": 1790.0,
        "prev_close": 1785.0,
        "high": 1810.0,
        "low": 1780.0,
        "volume": 1000000.0,
        "amount": 1800000000.0,
        "change": 15.0,
        "change_percent": 0.84,
        "turnover_rate": 0.5,
        "market_cap": 2260000.0,
        "pe": 45.5,
        "pb": 12.3,
        "trading_status": "TRADING",
        "timestamp": datetime.now()
    }
