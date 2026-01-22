"""统一的日志配置模块

根据环境自动选择日志格式和输出目标:
- 开发环境: 彩色控制台格式 -> 控制台
- 生产环境: JSON 格式 -> 控制台 + 文件(带轮转)
"""

import structlog
import logging
import sys
from pathlib import Path
from logging.handlers import TimedRotatingFileHandler


def configure_logging(env: str = "development"):
    """配置统一的结构化日志系统
    
    Args:
        env: 环境类型 ("development" 或 "production")
    """
    
    # 根据环境选择配置
    if env == "production":
        # 生产环境: JSON 格式(便于日志聚合和分析)
        renderer = structlog.processors.JSONRenderer(ensure_ascii=False)
        log_level = logging.INFO
        use_file_handler = True
    else:
        # 开发环境: 彩色控制台格式(易读)
        renderer = structlog.dev.ConsoleRenderer(colors=True)
        log_level = logging.DEBUG
        use_file_handler = False
    
    # 配置 structlog
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso", utc=False),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            renderer,
        ],
        wrapper_class=structlog.make_filtering_bound_logger(log_level),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )
    
    # 配置标准 logging
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.handlers.clear()
    
    # 控制台处理器(所有环境都有)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(logging.Formatter("%(message)s"))
    root_logger.addHandler(console_handler)
    
    # 文件处理器(仅生产环境)
    if use_file_handler:
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        file_handler = TimedRotatingFileHandler(
            filename=log_dir / "app.log",
            when="midnight",  # 每天午夜轮转
            interval=1,
            backupCount=7,  # 保留 7 天
            encoding="utf-8",
        )
        file_handler.setLevel(log_level)
        file_handler.setFormatter(logging.Formatter("%(message)s"))
        root_logger.addHandler(file_handler)
    
    # 配置需要拦截的 logger
    loggers_to_intercept = [
        "uvicorn",
        "uvicorn.access",
        "uvicorn.error",
        "apscheduler",
        "apscheduler.scheduler",
        "apscheduler.executors",
        "apscheduler.jobstores",
        "tzlocal",
    ]
    
    for logger_name in loggers_to_intercept:
        logger = logging.getLogger(logger_name)
        logger.handlers.clear()
        logger.addHandler(InterceptHandler())
        logger.propagate = False
        # APScheduler 的 DEBUG 日志太多,设置为 INFO
        if logger_name.startswith("apscheduler"):
            logger.setLevel(logging.INFO)
        else:
            logger.setLevel(log_level)


class InterceptHandler(logging.Handler):
    """拦截标准 logging 并转发到 structlog"""
    
    def emit(self, record: logging.LogRecord):
        # 获取 structlog logger
        logger = structlog.get_logger(record.name)
        
        # 根据日志级别调用对应的方法
        level_name = record.levelname.lower()
        message = record.getMessage()
        
        if level_name == "debug":
            logger.debug(message)
        elif level_name == "info":
            logger.info(message)
        elif level_name == "warning":
            logger.warning(message)
        elif level_name == "error":
            logger.error(message)
        elif level_name == "critical":
            logger.critical(message)
        else:
            logger.info(message)
