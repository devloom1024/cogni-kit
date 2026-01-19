"""技术指标计算器"""
import re
import pandas as pd
import pandas_ta as ta
from typing import List, Dict, Any, Tuple
import structlog

from app.core.exceptions import CalculationError, ValidationError

logger = structlog.get_logger()


class IndicatorCalculator:
    """技术指标计算器"""
    
    # 支持的指标定义
    SUPPORTED_INDICATORS = {
        "ma": {
            "name": "移动平均线",
            "syntax": "ma(period)",
            "description": "简单移动平均线 (Simple Moving Average)",
            "example": "ma(20)",
            "params": ["period"]
        },
        "ema": {
            "name": "指数移动平均",
            "syntax": "ema(period)",
            "description": "指数移动平均线 (Exponential Moving Average)",
            "example": "ema(12)",
            "params": ["period"]
        },
        "macd": {
            "name": "MACD 指标",
            "syntax": "macd(fast,slow,signal)",
            "description": "移动平均收敛散度指标 (Moving Average Convergence Divergence)",
            "example": "macd(12,26,9)",
            "params": ["fast", "slow", "signal"]
        },
        "rsi": {
            "name": "RSI 指标",
            "syntax": "rsi(period)",
            "description": "相对强弱指标 (Relative Strength Index)",
            "example": "rsi(14)",
            "params": ["period"]
        },
        "boll": {
            "name": "布林带",
            "syntax": "boll(period,std)",
            "description": "布林带指标 (Bollinger Bands)",
            "example": "boll(20,2)",
            "params": ["period", "std"]
        },
        "kdj": {
            "name": "KDJ 指标",
            "syntax": "kdj(n,m1,m2)",
            "description": "随机指标 (Stochastic Oscillator)",
            "example": "kdj(9,3,3)",
            "params": ["n", "m1", "m2"]
        }
    }
    
    def parse_indicator_expression(self, expr: str) -> Tuple[str, List[int]]:
        """解析指标表达式
        
        Args:
            expr: 指标表达式，如 "ma(20)" 或 "macd(12,26,9)"
            
        Returns:
            (指标名称, 参数列表)
            
        Raises:
            ValidationError: 表达式格式错误
        """
        # 匹配格式: indicator_name(param1,param2,...)
        pattern = r'^(\w+)\(([\d,]+)\)$'
        match = re.match(pattern, expr.strip())
        
        if not match:
            raise ValidationError(f"无效的指标表达式: {expr}")
        
        indicator_name = match.group(1).lower()
        params_str = match.group(2)
        
        # 检查指标是否支持
        if indicator_name not in self.SUPPORTED_INDICATORS:
            raise ValidationError(
                f"不支持的指标: {indicator_name}。"
                f"支持的指标: {', '.join(self.SUPPORTED_INDICATORS.keys())}"
            )
        
        # 解析参数
        try:
            params = [int(p.strip()) for p in params_str.split(',')]
        except ValueError:
            raise ValidationError(f"指标参数必须是整数: {expr}")
        
        # 验证参数数量
        expected_params = self.SUPPORTED_INDICATORS[indicator_name]["params"]
        if len(params) != len(expected_params):
            raise ValidationError(
                f"指标 {indicator_name} 需要 {len(expected_params)} 个参数，"
                f"但提供了 {len(params)} 个"
            )
        
        return indicator_name, params
    
    def calculate_ma(self, df: pd.DataFrame, period: int) -> List[float | None]:
        """计算移动平均线"""
        result = ta.sma(df['close'], length=period)
        return result.tolist()
    
    def calculate_ema(self, df: pd.DataFrame, period: int) -> List[float | None]:
        """计算指数移动平均"""
        result = ta.ema(df['close'], length=period)
        return result.tolist()
    
    def calculate_macd(
        self,
        df: pd.DataFrame,
        fast: int,
        slow: int,
        signal: int
    ) -> Dict[str, List[float | None]]:
        """计算 MACD 指标"""
        macd = ta.macd(df['close'], fast=fast, slow=slow, signal=signal)
        
        return {
            "dif": macd[f'MACD_{fast}_{slow}_{signal}'].tolist(),
            "dea": macd[f'MACDs_{fast}_{slow}_{signal}'].tolist(),
            "histogram": macd[f'MACDh_{fast}_{slow}_{signal}'].tolist()
        }
    
    def calculate_rsi(self, df: pd.DataFrame, period: int) -> List[float | None]:
        """计算 RSI 指标"""
        result = ta.rsi(df['close'], length=period)
        return result.tolist()
    
    def calculate_boll(
        self,
        df: pd.DataFrame,
        period: int,
        std: int
    ) -> Dict[str, List[float | None]]:
        """计算布林带"""
        bbands = ta.bbands(df['close'], length=period, std=std)
        
        return {
            "upper": bbands[f'BBU_{period}_{float(std)}'].tolist(),
            "middle": bbands[f'BBM_{period}_{float(std)}'].tolist(),
            "lower": bbands[f'BBL_{period}_{float(std)}'].tolist()
        }
    
    def calculate_kdj(
        self,
        df: pd.DataFrame,
        n: int,
        m1: int,
        m2: int
    ) -> Dict[str, List[float | None]]:
        """计算 KDJ 指标"""
        stoch = ta.stoch(df['high'], df['low'], df['close'], k=n, d=m1, smooth_k=m2)
        
        return {
            "k": stoch[f'STOCHk_{n}_{m1}_{m2}'].tolist(),
            "d": stoch[f'STOCHd_{n}_{m1}_{m2}'].tolist(),
            "j": (3 * stoch[f'STOCHk_{n}_{m1}_{m2}'] - 2 * stoch[f'STOCHd_{n}_{m1}_{m2}']).tolist()
        }
    
    def calculate_indicator(
        self,
        df: pd.DataFrame,
        indicator_name: str,
        params: List[int]
    ) -> Any:
        """计算单个指标
        
        Args:
            df: K 线数据 DataFrame
            indicator_name: 指标名称
            params: 参数列表
            
        Returns:
            指标计算结果（数组或字典）
        """
        try:
            if indicator_name == "ma":
                return self.calculate_ma(df, params[0])
            elif indicator_name == "ema":
                return self.calculate_ema(df, params[0])
            elif indicator_name == "macd":
                return self.calculate_macd(df, params[0], params[1], params[2])
            elif indicator_name == "rsi":
                return self.calculate_rsi(df, params[0])
            elif indicator_name == "boll":
                return self.calculate_boll(df, params[0], params[1])
            elif indicator_name == "kdj":
                return self.calculate_kdj(df, params[0], params[1], params[2])
            else:
                raise CalculationError(f"未实现的指标: {indicator_name}")
                
        except Exception as e:
            logger.error(
                "indicator_calculation_failed",
                indicator=indicator_name,
                params=params,
                error=str(e)
            )
            raise CalculationError(f"计算指标 {indicator_name} 失败: {str(e)}")
    
    def calculate_indicators(
        self,
        kline_data: List[Dict[str, Any]],
        indicator_expressions: List[str]
    ) -> Dict[str, Any]:
        """批量计算指标
        
        Args:
            kline_data: K 线数据列表
            indicator_expressions: 指标表达式列表
            
        Returns:
            指标计算结果字典
        """
        # 转换为 DataFrame
        df = pd.DataFrame(kline_data)
        
        if df.empty:
            raise ValidationError("K 线数据不能为空")
        
        # 确保必需的列存在
        required_columns = ['open', 'high', 'low', 'close', 'volume']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValidationError(f"缺少必需的列: {', '.join(missing_columns)}")
        
        # 计算所有指标
        results = {}
        
        for expr in indicator_expressions:
            try:
                indicator_name, params = self.parse_indicator_expression(expr)
                result = self.calculate_indicator(df, indicator_name, params)
                results[expr] = result
                
                logger.info(
                    "indicator_calculated",
                    expression=expr,
                    indicator=indicator_name,
                    params=params
                )
                
            except (ValidationError, CalculationError) as e:
                # 记录错误但继续处理其他指标
                logger.warning("indicator_calculation_skipped", expression=expr, error=str(e))
                results[expr] = None
        
        return results
    
    def get_supported_indicators(self) -> List[Dict[str, str]]:
        """获取支持的指标列表"""
        return [
            {
                "name": name,
                "syntax": meta["syntax"],
                "description": meta["description"],
                "example": meta["example"]
            }
            for name, meta in self.SUPPORTED_INDICATORS.items()
        ]


# 全局计算器实例
indicator_calculator = IndicatorCalculator()
