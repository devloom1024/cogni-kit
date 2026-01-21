"""FastAPI 应用入口"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog

from app.config import settings
from app.core.cache import cache
from app.core.scheduler import cache_refresh_scheduler
from app.core.exceptions import BaseServiceError
from app.core.schemas import HealthResponse, ErrorResponse

# 配置结构化日志
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer()
    ]
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    logger.info("service_starting", port=settings.port)
    await cache.connect()

    # 启动定时调度器并注册股票列表刷新任务
    await cache_refresh_scheduler.start()
    cache_refresh_scheduler.add_stock_list_refresh_job()

    yield

    # 关闭时
    logger.info("service_stopping")
    await cache_refresh_scheduler.stop()
    await cache.disconnect()


# 创建 FastAPI 应用
app = FastAPI(
    title="金融数据服务",
    version="1.0.0",
    description="模块化金融数据微服务，封装 AkShare 和技术指标计算",
    lifespan=lifespan,
    # 生产环境禁用文档
    docs_url="/api-docs" if settings.node_env != "production" else None,
    redoc_url="/api-docs/redoc" if settings.node_env != "production" else None,
    openapi_url="/api-docs/openapi.json" if settings.node_env != "production" else None
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
        "service_error",
        code=exc.code,
        message=exc.message,
        path=request.url.path
    )
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            code=exc.code,
            message=exc.message
        ).model_dump()
    )


@app.exception_handler(Exception)
async def general_error_handler(request: Request, exc: Exception):
    """处理未捕获的异常"""
    logger.error(
        "unexpected_error",
        error=str(exc),
        path=request.url.path
    )
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            code="INTERNAL_ERROR",
            message="Internal server error",
            detail=str(exc)
        ).model_dump()
    )


# 健康检查端点
@app.get("/api/v1/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """服务健康检查"""
    return HealthResponse(
        status="ok",
        modules=["akshare", "indicators"]
    )


# 注册路由模块
from app.modules.akshare.stock.router import router as stock_router
from app.modules.akshare.etf.router import router as etf_router
from app.modules.akshare.fund.router import router as fund_router
from app.modules.indicators.router import router as indicators_router

app.include_router(stock_router, prefix="/api/v1/akshare/stock", tags=["Stock"])
app.include_router(etf_router, prefix="/api/v1/akshare/etf", tags=["ETF"])
app.include_router(fund_router, prefix="/api/v1/akshare/fund", tags=["Fund"])
app.include_router(indicators_router, prefix="/api/v1/indicators", tags=["Indicators"])
