"""通用响应模型"""

from typing import Generic, List, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class ListResponse(BaseModel, Generic[T]):
    data: List[T]
    count: int
