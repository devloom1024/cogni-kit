"""技术指标模块路由"""
from fastapi import APIRouter
from typing import List, Dict, Any

from app.modules.indicators.service import indicator_service
from app.modules.indicators.schemas import (
    IndicatorRequest,
    IndicatorResponse,
    IndicatorMeta
)

router = APIRouter()


@router.post("/calculate", response_model=Dict[str, Any])
async def calculate_indicators(request: IndicatorRequest):
    """计算技术指标
    
    根据传入的 K 线数据计算技术指标。
    
    **支持的指标**:
    - `ma(n)`: 移动平均线
    - `ema(n)`: 指数移动平均
    - `macd(fast,slow,signal)`: MACD 指标
    - `rsi(n)`: RSI 指标
    - `boll(n,std)`: 布林带
    - `kdj(n,m1,m2)`: KDJ 指标
    
    **示例请求**:
    ```json
    {
      "data": [
        {"timestamp": 1640000000000, "open": 100, "high": 105, "low": 99, "close": 103, "volume": 10000},
        ...
      ],
      "indicators": ["ma(5)", "ma(20)", "macd(12,26,9)"]
    }
    ```
    
    **示例响应**:
    ```json
    {
      "ma(5)": [null, null, null, null, 101.2, 102.5, ...],
      "ma(20)": [null, ..., 100.8, ...],
      "macd(12,26,9)": {
        "dif": [0.15, 0.18, ...],
        "dea": [0.10, 0.12, ...],
        "histogram": [0.05, 0.06, ...]
      }
    }
    ```
    """
    return await indicator_service.calculate_indicators(request)


@router.get("/supported", response_model=List[IndicatorMeta])
async def get_supported_indicators():
    """获取支持的指标列表
    
    返回所有支持的技术指标及其使用说明。
    """
    return indicator_service.get_supported_indicators()
