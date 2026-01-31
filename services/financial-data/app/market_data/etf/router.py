"""Market Data ETF 路由"""

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.core.schemas import ErrorResponse
from app.market_data.common import ListResponse
from app.market_data.etf.service import etf_aggregator
from app.market_data.providers.exceptions import ProviderSelectionError

router = APIRouter(prefix="/api/v1/market-data/etf", tags=["MarketData:ETF"])


@router.get(
    "/list",
    response_model=ListResponse,
    summary="获取 ETF 列表",
    responses={503: {"model": ErrorResponse, "description": "无可用数据源"}},
)
async def get_etf_list():
    try:
        data = await etf_aggregator.get_list()
    except ProviderSelectionError as exc:
        error = ErrorResponse(code="PROVIDER_UNAVAILABLE", message=str(exc))
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=error.model_dump(),
        )

    return ListResponse(data=data, count=len(data))
