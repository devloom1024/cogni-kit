"""ETF 路由"""

from fastapi import APIRouter
from .service import etf_service
from .models import ETFListResponse
from app.core.schemas import ErrorResponse

router = APIRouter(prefix="/etf", tags=["ETF"])


@router.get(
    "/list",
    response_model=ETFListResponse,
    summary="获取 ETF 列表",
    description="获取所有 ETF 列表",
    responses={
        200: {"description": "成功返回 ETF 列表"},
        500: {"model": ErrorResponse, "description": "服务异常"},
    },
)
async def get_etf_list():
    """获取 ETF 列表"""
    data = await etf_service.get_list()
    return {"data": data, "count": len(data)}
