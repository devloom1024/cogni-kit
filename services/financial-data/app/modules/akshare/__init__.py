"""akshare 模块汇总路由"""

from fastapi import APIRouter
from .index.router import router as index_router
from .etf.router import router as etf_router
from .lof.router import router as lof_router
from .fund.router import router as fund_router

router = APIRouter(prefix="/api/v1/akshare")

# 注册各类型子路由
router.include_router(index_router)
router.include_router(etf_router)
router.include_router(lof_router)
router.include_router(fund_router)
