"""单元测试 - Indicators Service

测试指标服务层的缓存逻辑。
所有 Calculator 调用都被 Mock。
"""
import pytest
from unittest.mock import patch

from app.modules.indicators.service import indicator_service
from app.modules.indicators.schemas import IndicatorRequest, KLinePoint


@pytest.mark.unit
class TestIndicatorService:
    """指标服务层单元测试"""
    
    @patch('app.modules.indicators.service.indicator_calculator.calculate_indicators')
    @patch('app.modules.indicators.service.cache.get')
    @patch('app.modules.indicators.service.cache.set')
    async def test_calculate_indicators_with_cache_miss(
        self, mock_cache_set, mock_cache_get, mock_calculate, sample_kline_data
    ):
        """测试缓存未命中时计算指标"""
        mock_cache_get.return_value = None
        
        mock_result = {
            "ma(5)": [100.0] * 30,
            "ma(10)": [100.0] * 30
        }
        mock_calculate.return_value = mock_result
        
        # 创建请求对象
        kline_points = [KLinePoint(**point) for point in sample_kline_data]
        request = IndicatorRequest(
            data=kline_points,
            indicators=["ma(5)", "ma(10)"]
        )
        
        result = await indicator_service.calculate_indicators(request)
        
        # 验证调用了 calculator
        mock_calculate.assert_called_once()
        
        # 验证设置了缓存
        mock_cache_set.assert_called_once()
        
        # 验证返回数据
        assert "ma(5)" in result
        assert "ma(10)" in result
    
    @patch('app.modules.indicators.service.indicator_calculator.calculate_indicators')
    @patch('app.modules.indicators.service.cache.get')
    async def test_calculate_indicators_with_cache_hit(
        self, mock_cache_get, mock_calculate, sample_kline_data
    ):
        """测试缓存命中时计算指标"""
        cached_result = {
            "ma(5)": [100.0] * 30,
            "ma(10)": [100.0] * 30
        }
        mock_cache_get.return_value = cached_result
        
        # 创建请求对象
        kline_points = [KLinePoint(**point) for point in sample_kline_data]
        request = IndicatorRequest(
            data=kline_points,
            indicators=["ma(5)", "ma(10)"]
        )
        
        result = await indicator_service.calculate_indicators(request)
        
        # 验证没有调用 calculator
        mock_calculate.assert_not_called()
        
        # 验证返回缓存数据
        assert result == cached_result
    
    @patch('app.modules.indicators.service.indicator_calculator.get_supported_indicators')
    def test_get_supported_indicators(self, mock_get_supported):
        """测试获取支持的指标列表（不使用缓存）"""
        mock_indicators = [
            {
                "name": "ma",
                "syntax": "ma(period)",
                "description": "移动平均线",
                "example": "ma(5)"
            }
        ]
        mock_get_supported.return_value = mock_indicators
        
        result = indicator_service.get_supported_indicators()
        
        mock_get_supported.assert_called_once()
        assert len(result) == 1
    
    def test_generate_cache_key_consistency(self, sample_kline_data):
        """测试缓存键生成的一致性"""
        # 相同的数据和指标应该生成相同的缓存键
        
        indicators = ["ma(5)", "ma(10)"]
        
        # 生成两次缓存键，应该相同
        key1 = indicator_service._generate_cache_key(sample_kline_data, indicators)
        key2 = indicator_service._generate_cache_key(sample_kline_data, indicators)
        
        assert key1 == key2
    
    def test_generate_cache_key_different_data(self, sample_kline_data):
        """测试不同数据生成不同的缓存键"""
        # 修改数据
        modified_data = sample_kline_data.copy()
        modified_data[0] = {**modified_data[0], "close": 999.0}
        
        indicators = ["ma(5)", "ma(10)"]
        
        key1 = indicator_service._generate_cache_key(sample_kline_data, indicators)
        key2 = indicator_service._generate_cache_key(modified_data, indicators)
        
        assert key1 != key2
