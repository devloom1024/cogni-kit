"""API 测试专用 Fixtures

API 测试特点：
- 使用真实外部服务
- 需要网络连接
- 执行速度慢
- 标记为 @pytest.mark.slow
"""
import pytest
from httpx import AsyncClient, ASGITransport
from typing import AsyncGenerator

from app.main import app
from app.core.cache import cache


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """异步 HTTP 客户端 Fixture（用于 API 测试）"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture(autouse=True)
async def setup_teardown():
    """每个 API 测试前后的设置和清理"""
    # 测试前：连接 Redis
    await cache.connect()
    
    yield
    
    # 测试后：清理缓存并断开连接
    await cache.disconnect()
