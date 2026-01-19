"""API 测试 - 健康检查"""
import pytest
from httpx import AsyncClient


@pytest.mark.api
class TestHealthAPI:
    """健康检查 API 测试类"""
    
    async def test_health_check_success(self, client: AsyncClient):
        """测试健康检查成功"""
        response = await client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "ok"
        assert "modules" in data
        assert isinstance(data["modules"], list)
        assert "akshare" in data["modules"]
        assert "indicators" in data["modules"]
    
    async def test_health_check_response_structure(self, client: AsyncClient):
        """测试健康检查响应结构"""
        response = await client.get("/health")
        data = response.json()
        
        # 验证必需字段
        assert "status" in data
        assert "modules" in data
        
        # 验证数据类型
        assert isinstance(data["status"], str)
        assert isinstance(data["modules"], list)
