"""FastAPI 应用入口"""

from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.core.cache import cache
from app.core.exceptions import BaseServiceError
from app.core.logging_config import configure_logging
from app.core.scheduler import cache_refresh_scheduler
from app.core.schemas import HealthResponse, ErrorResponse
from app.modules.akshare import router as akshare_router
from app.market_data.router import router as market_data_router

# 配置日志系统(根据环境自动选择格式和输出)
configure_logging(env=settings.node_env)

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    logger.info("service_starting",
        port=settings.port,
        env=settings.node_env,
        log_level=settings.log_level
    )
    await cache.connect()

    # 启动定时调度器并注册各类任务
    await cache_refresh_scheduler.start()


    logger.info("service_started",
        port=settings.port,
        env=settings.node_env
    )

    yield

    # 关闭时
    logger.info("service_stopping")
    await cache_refresh_scheduler.stop()
    await cache.disconnect()
    logger.info("service_stopped")


# 创建 FastAPI 应用
app = FastAPI(
    title="金融数据服务",
    version="1.0.0",
    description="模块化金融数据微服务",
    lifespan=lifespan,
    # 生产环境禁用文档
    docs_url="/api-docs" if settings.node_env != "production" else None,
    redoc_url="/api-docs/redoc" if settings.node_env != "production" else None,
    openapi_url="/api-docs/openapi.json" if settings.node_env != "production" else None,
)

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 全局异常处理
@app.exception_handler(BaseServiceError)
async def service_error_handler(request: Request, exc: BaseServiceError):
    """处理服务异常"""
    logger.error(
        "service_error", code=exc.code, message=exc.message, path=request.url.path
    )
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(code=exc.code, message=exc.message).model_dump(),
    )


@app.exception_handler(Exception)
async def general_error_handler(request: Request, exc: Exception):
    """处理未捕获的异常"""
    logger.error("unexpected_error", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            code="INTERNAL_ERROR", message="Internal server error", detail=str(exc)
        ).model_dump(),
    )


# 健康检查端点
@app.get("/api/v1/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """服务健康检查"""
    return HealthResponse(status="ok", modules=[])


# 注册路由
app.include_router(market_data_router)
app.include_router(akshare_router)
