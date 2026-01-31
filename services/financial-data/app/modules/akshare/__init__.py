"""akshare 模块汇总路由"""

from fastapi import APIRouter
from .index.router import router as index_router

router = APIRouter(prefix="/api/v1/akshare")

# 注册各类型子路由
router.include_router(index_router)
