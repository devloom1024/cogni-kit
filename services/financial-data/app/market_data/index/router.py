"""Market Data 指数路由"""

from typing import Optional

from fastapi import APIRouter, Query, status
from fastapi.responses import JSONResponse

from app.core.schemas import ErrorResponse
from app.market_data.common import ListResponse
from app.market_data.index.service import index_aggregator
from app.market_data.providers.exceptions import ProviderSelectionError

router = APIRouter(prefix="/api/v1/market-data/index", tags=["MarketData:Index"])


@router.get(
    "/list",
    response_model=ListResponse,
    summary="获取指数列表",
    responses={503: {"model": ErrorResponse, "description": "无可用数据源"}},
)
async def get_index_list(category: Optional[str] = Query(None, description="指数类别")):
    try:
        data = await index_aggregator.get_list(category)
    except ProviderSelectionError as exc:
        error = ErrorResponse(code="PROVIDER_UNAVAILABLE", message=str(exc))
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=error.model_dump(),
        )

    return ListResponse(data=data, count=len(data))
