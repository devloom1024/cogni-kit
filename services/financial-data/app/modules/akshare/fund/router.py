"""场外基金路由"""

from fastapi import APIRouter
from .service import fund_service
from .models import FundListResponse
from app.modules.akshare.common.models.error import ErrorResponse

router = APIRouter(prefix="/fund", tags=["场外基金"])


@router.get(
    "/list",
    response_model=FundListResponse,
    summary="获取场外基金列表",
    description="获取所有场外基金列表",
    responses={
        "200": {"description": "成功返回场外基金列表"},
        "500": {"model": ErrorResponse, "description": "服务异常"},
    },
)
async def get_fund_list():
    """获取场外基金列表"""
    data = await fund_service.get_list()
    return {"data": data, "count": len(data)}
