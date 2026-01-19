"""API 测试 - AkShare 模块（真实数据）

这些测试会调用真实的 AkShare API，因此：
1. 需要网络连接
2. 执行速度较慢
3. 可能因为外部服务不稳定而失败
4. 使用 @pytest.mark.slow 标记

运行方式：
- 跳过慢速测试: pytest -m "not slow"
- 只运行 API 测试: pytest -m "api and slow"
"""
import pytest
from httpx import AsyncClient


@pytest.mark.api
@pytest.mark.slow
class TestAkShareAPIReal:
    """AkShare API 真实数据测试"""
    
    async def test_get_stock_list_real(self, client: AsyncClient):
        """测试获取真实股票列表"""
        response = await client.get("/akshare/stock/list?market=CN")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0
        
        # 验证第一条数据结构
        first_stock = data[0]
        assert "symbol" in first_stock
        assert "name" in first_stock
        assert "market" in first_stock
        assert first_stock["market"] == "CN"
    
    async def test_search_stock_real(self, client: AsyncClient):
        """测试搜索真实股票（贵州茅台）"""
        response = await client.get("/akshare/stock/search?q=茅台")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        # 应该能找到贵州茅台
        assert any("茅台" in stock["name"] for stock in data)
    
    async def test_get_realtime_quote_real(self, client: AsyncClient):
        """测试获取真实实时行情（贵州茅台 600519）"""
        response = await client.get("/akshare/stock/600519/spot")
        
        assert response.status_code == 200
        data = response.json()
        
        # 验证必需字段
        assert "price" in data
        assert "open" in data
        assert "high" in data
        assert "low" in data
        assert "volume" in data
        assert "tradingStatus" in data
        
        # 验证数据合理性
        assert data["price"] > 0
        assert data["high"] >= data["low"]
    
    async def test_get_kline_real(self, client: AsyncClient):
        """测试获取真实 K 线数据（贵州茅台 600519）"""
        response = await client.get(
            "/akshare/stock/600519/kline",
            params={"period": "day", "limit": 30}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0
        assert len(data) <= 30
        
        # 验证第一条 K 线数据
        first_kline = data[0]
        assert "timestamp" in first_kline
        assert "open" in first_kline
        assert "high" in first_kline
        assert "low" in first_kline
        assert "close" in first_kline
        assert "volume" in first_kline
        
        # 验证数据合理性
        assert first_kline["high"] >= first_kline["low"]
        assert first_kline["high"] >= first_kline["open"]
        assert first_kline["high"] >= first_kline["close"]
    
    async def test_get_fund_list_real(self, client: AsyncClient):
        """测试获取真实基金列表"""
        response = await client.get("/akshare/fund/list?type=ETF")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0
        
        # 验证第一条数据
        first_fund = data[0]
        assert "symbol" in first_fund
        assert "name" in first_fund
        assert "type" in first_fund
        assert first_fund["type"] == "ETF"
    
    async def test_search_fund_real(self, client: AsyncClient):
        """测试搜索真实基金"""
        response = await client.get("/akshare/fund/search?q=消费")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        # 应该能找到包含"消费"的基金
        assert any("消费" in fund["name"] for fund in data)
    
    async def test_calculate_indicators_with_real_kline(self, client: AsyncClient):
        """测试使用真实 K 线数据计算指标"""
        # 1. 先获取真实 K 线数据
        kline_response = await client.get(
            "/akshare/stock/600519/kline",
            params={"period": "day", "limit": 30}
        )
        assert kline_response.status_code == 200
        kline_data = kline_response.json()
        
        # 2. 使用真实数据计算指标
        indicator_request = {
            "data": kline_data,
            "indicators": ["ma(5)", "ma(10)", "macd(12,26,9)"]
        }
        
        indicator_response = await client.post(
            "/indicators/calculate",
            json=indicator_request
        )
        
        assert indicator_response.status_code == 200
        indicator_data = indicator_response.json()
        
        # 验证指标计算结果
        assert "ma(5)" in indicator_data
        assert "ma(10)" in indicator_data
        assert "macd(12,26,9)" in indicator_data
        
        # 验证 MA 结果
        ma5 = indicator_data["ma(5)"]
        assert isinstance(ma5, list)
        assert len(ma5) == len(kline_data)
        
        # 验证 MACD 结果
        macd = indicator_data["macd(12,26,9)"]
        assert isinstance(macd, dict)
        assert "dif" in macd
        assert "dea" in macd
        assert "histogram" in macd


@pytest.mark.api
@pytest.mark.slow
class TestAkShareAPIEdgeCases:
    """AkShare API 边界情况测试"""
    
    async def test_get_nonexistent_stock(self, client: AsyncClient):
        """测试获取不存在的股票"""
        response = await client.get("/akshare/stock/999999/spot")
        
        # 应该返回错误
        assert response.status_code == 500
    
    async def test_search_with_empty_query(self, client: AsyncClient):
        """测试空搜索关键词"""
        response = await client.get("/akshare/stock/search?q=")
        
        # 应该返回验证错误或空列表
        assert response.status_code in [200, 422]
    
    async def test_get_kline_with_invalid_period(self, client: AsyncClient):
        """测试无效的 K 线周期"""
        response = await client.get(
            "/akshare/stock/600519/kline",
            params={"period": "invalid"}
        )
        
        # 应该返回验证错误
        assert response.status_code == 422
    
    async def test_get_kline_with_large_limit(self, client: AsyncClient):
        """测试超大 limit 参数"""
        response = await client.get(
            "/akshare/stock/600519/kline",
            params={"limit": 2000}  # 超过最大值 1000
        )
        
        # 应该返回验证错误
        assert response.status_code == 422
