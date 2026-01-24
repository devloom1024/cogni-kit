"""统一错误响应模型"""

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    """错误详情"""

    field: Optional[str] = Field(None, description="字段路径")
    message: str = Field(..., description="错误信息")


class ErrorResponse(BaseModel):
    """统一错误响应"""

    code: str = Field(..., description="错误码")
    message: str = Field(..., description="错误信息")
    details: Optional[Dict[str, Any]] = Field(None, description="详细信息")
