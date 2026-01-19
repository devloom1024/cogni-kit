"""单元测试 - 指标计算器"""
import pytest
from app.modules.indicators.calculator import indicator_calculator
from app.core.exceptions import ValidationError, CalculationError


@pytest.mark.unit
class TestIndicatorCalculator:
    """指标计算器测试类"""
    
    def test_parse_indicator_expression_ma(self):
        """测试解析 MA 表达式"""
        name, params = indicator_calculator.parse_indicator_expression("ma(20)")
        assert name == "ma"
        assert params == [20]
    
    def test_parse_indicator_expression_macd(self):
        """测试解析 MACD 表达式"""
        name, params = indicator_calculator.parse_indicator_expression("macd(12,26,9)")
        assert name == "macd"
        assert params == [12, 26, 9]
    
    def test_parse_indicator_expression_invalid_format(self):
        """测试无效格式"""
        with pytest.raises(ValidationError):
            indicator_calculator.parse_indicator_expression("invalid")
    
    def test_parse_indicator_expression_unsupported(self):
        """测试不支持的指标"""
        with pytest.raises(ValidationError):
            indicator_calculator.parse_indicator_expression("unknown(10)")
    
    def test_parse_indicator_expression_invalid_params(self):
        """测试无效参数"""
        with pytest.raises(ValidationError):
            indicator_calculator.parse_indicator_expression("ma(abc)")
    
    def test_parse_indicator_expression_wrong_param_count(self):
        """测试参数数量错误"""
        with pytest.raises(ValidationError):
            indicator_calculator.parse_indicator_expression("ma(10,20)")
    
    def test_calculate_indicators_with_valid_data(self, sample_kline_data):
        """测试有效数据的指标计算"""
        results = indicator_calculator.calculate_indicators(
            sample_kline_data,
            ["ma(5)", "ma(10)"]
        )
        
        assert "ma(5)" in results
        assert "ma(10)" in results
        assert isinstance(results["ma(5)"], list)
        assert len(results["ma(5)"]) == len(sample_kline_data)
    
    def test_calculate_indicators_empty_data(self):
        """测试空数据"""
        with pytest.raises(ValidationError):
            indicator_calculator.calculate_indicators([], ["ma(5)"])
    
    def test_calculate_indicators_missing_columns(self):
        """测试缺少必需列"""
        invalid_data = [{"timestamp": 1640000000000, "open": 100}]
        with pytest.raises(ValidationError):
            indicator_calculator.calculate_indicators(invalid_data, ["ma(5)"])
    
    def test_get_supported_indicators(self):
        """测试获取支持的指标列表"""
        indicators = indicator_calculator.get_supported_indicators()
        
        assert len(indicators) == 6
        assert any(ind["name"] == "ma" for ind in indicators)
        assert any(ind["name"] == "macd" for ind in indicators)
        
        # 验证每个指标都有必需字段
        for ind in indicators:
            assert "name" in ind
            assert "syntax" in ind
            assert "description" in ind
            assert "example" in ind
