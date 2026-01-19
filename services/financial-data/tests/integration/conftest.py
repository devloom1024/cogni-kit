"""集成测试专用 Fixtures

集成测试特点：
- Mock 外部 API（AkShare）
- 测试内部模块交互
- 测试缓存逻辑
- 测试错误处理
"""
import pytest
from httpx import AsyncClient, ASGITransport
from typing import AsyncGenerator

from app.main import app
from app.core.cache import cache


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """异步 HTTP 客户端 Fixture（用于集成测试）"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture(autouse=True)
async def setup_teardown():
    """每个集成测试前后的设置和清理"""
    # 测试前：连接 Redis
    await cache.connect()
    
    yield
    
    # 测试后：清理缓存并断开连接
    await cache.disconnect()
