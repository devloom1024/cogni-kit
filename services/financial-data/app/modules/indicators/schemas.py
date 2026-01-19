"""技术指标模块数据模型"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any


class KLinePoint(BaseModel):
    """K 线数据点（用于指标计算）"""
    timestamp: int = Field(..., description="时间戳 (毫秒)")
    open: float = Field(..., description="开盘价")
    high: float = Field(..., description="最高价")
    low: float = Field(..., description="最低价")
    close: float = Field(..., description="收盘价")
    volume: float = Field(..., description="成交量")


class IndicatorRequest(BaseModel):
    """指标计算请求"""
    data: List[KLinePoint] = Field(..., description="K 线数据")
    indicators: List[str] = Field(
        ...,
        description="指标表达式列表",
        examples=[["ma(5)", "ma(20)", "macd(12,26,9)"]]
    )


class IndicatorResponse(BaseModel):
    """指标计算响应
    
    动态指标结果，key 为指标表达式。
    单值指标返回数组，多值指标返回对象。
    """
    model_config = {"extra": "allow"}
    
    # 使用 Dict[str, Any] 支持动态字段
    def __init__(self, **data):
        super().__init__(**data)
        for key, value in data.items():
            setattr(self, key, value)


class IndicatorMeta(BaseModel):
    """指标元信息"""
    name: str = Field(..., description="指标名称")
    syntax: str = Field(..., description="语法格式")
    description: str = Field(..., description="指标说明")
    example: str = Field(..., description="使用示例")
