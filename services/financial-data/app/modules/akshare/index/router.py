"""指数路由"""

from typing import Optional
from fastapi import APIRouter, Query
from .service import index_service
from .models import IndexListResponse
from app.modules.akshare.common.models.error import ErrorResponse

router = APIRouter(prefix="/index", tags=["指数"])


@router.get(
    "/list",
    response_model=IndexListResponse,
    summary="获取指数列表",
    description="获取指数列表，支持按类别筛选",
    responses={
        200: {"description": "成功返回指数列表"},
        500: {"model": ErrorResponse, "description": "服务异常"},
    },
)
async def get_index_list(category: Optional[str] = Query(None, description="指数类别")):
    """获取指数列表

    Args:
        category: 可选，按类别筛选 (沪深重要指数, 上证系列指数, 深证系列指数, 指数成份, 中证系列指数)
    """
    data = await index_service.get_list(category)
    return {"data": data, "count": len(data)}
