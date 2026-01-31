"""LOF 路由"""

from fastapi import APIRouter
from .service import lof_service
from .models import LOFListResponse
from app.core.schemas import ErrorResponse

router = APIRouter(prefix="/lof", tags=["LOF"])


@router.get(
    "/list",
    response_model=LOFListResponse,
    summary="获取 LOF 列表",
    description="获取所有 LOF 列表",
    responses={
        200: {"description": "成功返回 LOF 列表"},
        500: {"model": ErrorResponse, "description": "服务异常"},
    },
)
async def get_lof_list():
    """获取 LOF 列表"""
    data = await lof_service.get_list()
    return {"data": data, "count": len(data)}
