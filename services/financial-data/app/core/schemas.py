"""通用 Pydantic 模型"""
from pydantic import BaseModel
from typing import List


class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str
    modules: List[str]


class ErrorResponse(BaseModel):
    """错误响应"""
    code: str
    message: str
    detail: str | None = None
