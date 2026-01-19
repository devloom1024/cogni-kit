"""测试断言辅助函数"""
from typing import Any, Dict, List


def assert_stock_info_structure(data: Dict[str, Any]) -> None:
    """验证股票信息结构"""
    assert "symbol" in data
    assert "name" in data
    assert "market" in data
    assert isinstance(data["symbol"], str)
    assert isinstance(data["name"], str)
    assert isinstance(data["market"], str)


def assert_realtime_quote_structure(data: Dict[str, Any]) -> None:
    """验证实时行情结构"""
    required_fields = [
        "price", "open", "high", "low", "volume",
        "tradingStatus", "timestamp"
    ]
    for field in required_fields:
        assert field in data, f"Missing field: {field}"
    
    # 验证数据合理性
    assert data["price"] > 0
    assert data["high"] >= data["low"]
    assert data["volume"] >= 0


def assert_kline_structure(data: List[Dict[str, Any]]) -> None:
    """验证 K 线数据结构"""
    assert isinstance(data, list)
    assert len(data) > 0
    
    first_kline = data[0]
    required_fields = ["timestamp", "open", "high", "low", "close", "volume"]
    for field in required_fields:
        assert field in first_kline, f"Missing field: {field}"
    
    # 验证数据合理性
    assert first_kline["high"] >= first_kline["low"]
    assert first_kline["high"] >= first_kline["open"]
    assert first_kline["high"] >= first_kline["close"]
    assert first_kline["volume"] >= 0


def assert_fund_info_structure(data: Dict[str, Any]) -> None:
    """验证基金信息结构"""
    assert "symbol" in data
    assert "name" in data
    assert "type" in data
    assert isinstance(data["symbol"], str)
    assert isinstance(data["name"], str)
    assert isinstance(data["type"], str)


def assert_indicator_result_structure(data: Dict[str, Any], expected_indicators: List[str]) -> None:
    """验证指标计算结果结构"""
    for indicator in expected_indicators:
        assert indicator in data, f"Missing indicator: {indicator}"
        
        result = data[indicator]
        # MA, EMA, RSI, BOLL 返回列表
        if indicator.startswith(("ma(", "ema(", "rsi(", "boll(")):
            assert isinstance(result, (list, dict))
        # MACD, KDJ 返回字典
        elif indicator.startswith(("macd(", "kdj(")):
            assert isinstance(result, dict)


def assert_error_response_structure(data: Dict[str, Any]) -> None:
    """验证错误响应结构"""
    assert "code" in data
    assert "message" in data
    assert isinstance(data["code"], str)
    assert isinstance(data["message"], str)
