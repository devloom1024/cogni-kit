"""Market Data 股票路由"""

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.market_data.stock.service import stock_aggregator
from app.market_data.stock.models.response import StockListResponse
from app.market_data.providers.exceptions import ProviderSelectionError
from app.core.schemas import ErrorResponse

router = APIRouter(prefix="/api/v1/market-data/stock", tags=["MarketData:Stock"])


@router.get(
    "/list",
    response_model=StockListResponse,
    summary="获取股票列表",
    responses={503: {"model": ErrorResponse, "description": "无可用数据源"}},
)
async def get_stock_list():
    """获取股票列表，通过聚合器选择 Provider"""
    try:
        data = await stock_aggregator.get_list()
    except ProviderSelectionError as exc:
        error = ErrorResponse(code="PROVIDER_UNAVAILABLE", message=str(exc))
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=error.model_dump(),
        )

    return StockListResponse(data=data, count=len(data))
