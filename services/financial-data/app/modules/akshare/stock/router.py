"""A股路由"""

from fastapi import APIRouter
from .service import stock_service
from .models import StockListResponse
from app.modules.akshare.common.models.error import ErrorResponse

router = APIRouter(prefix="/stock", tags=["A股"])


@router.get(
    "/list",
    response_model=StockListResponse,
    summary="获取 A 股列表",
    description="获取所有 A 股股票列表",
    responses={
        200: {"description": "成功返回 A 股列表"},
        500: {"model": ErrorResponse, "description": "服务异常"},
    },
)
async def get_stock_list():
    """获取 A 股列表"""
    data = await stock_service.get_list()
    return {"data": data, "count": len(data)}
