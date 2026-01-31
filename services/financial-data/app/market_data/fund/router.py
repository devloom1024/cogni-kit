"""Market Data 场外基金路由"""

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.core.schemas import ErrorResponse
from app.market_data.fund.models.response import FundListResponse
from app.market_data.fund.service import fund_aggregator
from app.market_data.providers.exceptions import ProviderSelectionError

router = APIRouter(prefix="/api/v1/market-data/fund", tags=["MarketData:Fund"])


@router.get(
    "/list",
    response_model=FundListResponse,
    summary="获取场外基金列表",
    responses={503: {"model": ErrorResponse, "description": "无可用数据源"}},
)
async def get_fund_list():
    try:
        data = await fund_aggregator.get_list()
    except ProviderSelectionError as exc:
        error = ErrorResponse(code="PROVIDER_UNAVAILABLE", message=str(exc))
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=error.model_dump(),
        )

    return FundListResponse(data=data, count=len(data))
