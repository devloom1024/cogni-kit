"""API 测试 Fixtures"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.cache import cache


@pytest.fixture
async def client():
    """创建测试客户端"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture(autouse=True)
async def setup_cache():
    """每个测试前后管理缓存连接"""
    # 测试前确保缓存已连接
    await cache.connect()
    yield
    # 测试后保持连接（避免重复连接开销）

