"""技术指标服务层"""
import hashlib
import json
from typing import List, Dict, Any
import structlog

from app.config import settings
from app.core.cache import cache
from app.modules.indicators.calculator import indicator_calculator
from app.modules.indicators.schemas import IndicatorRequest, IndicatorMeta

logger = structlog.get_logger()


class IndicatorService:
    """技术指标服务层（带缓存）"""
    
    def __init__(self):
        self.calculator = indicator_calculator
    
    def _generate_cache_key(self, data: List[Dict], indicators: List[str]) -> str:
        """生成缓存键
        
        使用数据和指标的哈希值作为缓存键
        """
        content = json.dumps({
            "data": data,
            "indicators": sorted(indicators)  # 排序确保一致性
        }, sort_keys=True)
        
        hash_value = hashlib.md5(content.encode()).hexdigest()
        return f"indicator:{hash_value}"
    
    async def calculate_indicators(
        self,
        request: IndicatorRequest
    ) -> Dict[str, Any]:
        """计算技术指标（带缓存）
        
        Args:
            request: 指标计算请求
            
        Returns:
            指标计算结果
        """
        # 转换为字典格式
        kline_data = [point.model_dump() for point in request.data]
        
        # 生成缓存键
        cache_key = self._generate_cache_key(kline_data, request.indicators)
        
        # 尝试从缓存获取
        cached = await cache.get(cache_key)
        if cached:
            logger.info("indicator_cache_hit", indicators=request.indicators)
            return cached
        
        # 计算指标
        results = self.calculator.calculate_indicators(
            kline_data,
            request.indicators
        )
        
        # 缓存结果
        await cache.set(
            cache_key,
            results,
            ttl=settings.cache_ttl_indicator
        )
        
        logger.info(
            "indicators_calculated",
            count=len(request.indicators),
            data_points=len(request.data)
        )
        
        return results
    
    def get_supported_indicators(self) -> List[IndicatorMeta]:
        """获取支持的指标列表"""
        indicators = self.calculator.get_supported_indicators()
        return [IndicatorMeta(**ind) for ind in indicators]


# 全局服务实例
indicator_service = IndicatorService()
