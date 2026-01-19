"""集成测试 - 技术指标模块"""
import pytest
from httpx import AsyncClient


@pytest.mark.integration
class TestIndicatorsIntegration:
    """技术指标集成测试类（使用 Mock 数据）"""
    
    async def test_get_supported_indicators(self, client: AsyncClient):
        """测试获取支持的指标列表"""
        response = await client.get("/indicators/supported")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) == 6
        
        # 验证每个指标的结构
        for indicator in data:
            assert "name" in indicator
            assert "syntax" in indicator
            assert "description" in indicator
            assert "example" in indicator
    
    async def test_calculate_indicators_ma(self, client: AsyncClient, sample_kline_data):
        """测试计算 MA 指标"""
        request_data = {
            "data": sample_kline_data,
            "indicators": ["ma(5)", "ma(10)"]
        }
        
        response = await client.post("/indicators/calculate", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "ma(5)" in data
        assert "ma(10)" in data
        assert isinstance(data["ma(5)"], list)
        assert len(data["ma(5)"]) == len(sample_kline_data)
    
    async def test_calculate_indicators_macd(self, client: AsyncClient, sample_kline_data):
        """测试计算 MACD 指标"""
        request_data = {
            "data": sample_kline_data,
            "indicators": ["macd(12,26,9)"]
        }
        
        response = await client.post("/indicators/calculate", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "macd(12,26,9)" in data
        macd_result = data["macd(12,26,9)"]
        
        # MACD 返回对象
        assert isinstance(macd_result, dict)
        assert "dif" in macd_result
        assert "dea" in macd_result
        assert "histogram" in macd_result
    
    async def test_calculate_indicators_multiple(self, client: AsyncClient, sample_kline_data):
        """测试计算多个指标"""
        request_data = {
            "data": sample_kline_data,
            "indicators": ["ma(5)", "ema(10)", "rsi(14)", "macd(12,26,9)"]
        }
        
        response = await client.post("/indicators/calculate", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) == 4
        assert "ma(5)" in data
        assert "ema(10)" in data
        assert "rsi(14)" in data
        assert "macd(12,26,9)" in data
    
    async def test_calculate_indicators_empty_data(self, client: AsyncClient):
        """测试空数据"""
        request_data = {
            "data": [],
            "indicators": ["ma(5)"]
        }
        
        response = await client.post("/indicators/calculate", json=request_data)
        
        # 应该返回错误
        assert response.status_code == 500
    
    async def test_calculate_indicators_invalid_expression(self, client: AsyncClient, sample_kline_data):
        """测试无效的指标表达式"""
        request_data = {
            "data": sample_kline_data,
            "indicators": ["invalid_indicator"]
        }
        
        response = await client.post("/indicators/calculate", json=request_data)
        
        # 应该返回错误
        assert response.status_code == 500
    
    async def test_calculate_indicators_missing_data_field(self, client: AsyncClient):
        """测试缺少 data 字段"""
        request_data = {
            "indicators": ["ma(5)"]
        }
        
        response = await client.post("/indicators/calculate", json=request_data)
        
        # 应该返回验证错误
        assert response.status_code == 422
    
    async def test_calculate_indicators_missing_indicators_field(self, client: AsyncClient, sample_kline_data):
        """测试缺少 indicators 字段"""
        request_data = {
            "data": sample_kline_data
        }
        
        response = await client.post("/indicators/calculate", json=request_data)
        
        # 应该返回验证错误
        assert response.status_code == 422
    
    async def test_calculate_indicators_cache(self, client: AsyncClient, sample_kline_data):
        """测试指标计算缓存"""
        request_data = {
            "data": sample_kline_data,
            "indicators": ["ma(20)"]
        }
        
        # 第一次请求
        response1 = await client.post("/indicators/calculate", json=request_data)
        assert response1.status_code == 200
        
        # 第二次请求（应该从缓存获取）
        response2 = await client.post("/indicators/calculate", json=request_data)
        assert response2.status_code == 200
        
        # 结果应该相同
        assert response1.json() == response2.json()
