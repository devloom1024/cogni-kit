"""股票批量接口测试"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestStockBatchAPI:
    """批量接口测试"""
    
    async def test_batch_spot_basic(self, client: AsyncClient):
        """测试批量获取行情"""
        payload = {
            "symbols": [
                {"symbol": "600519", "market": "CN"},
                {"symbol": "000001", "market": "CN"}
            ]
        }
        
        response = await client.post("/api/v1/akshare/stock/spot/batch", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) >= 1  # 至少有一个成功
        # 验证返回的是字典
        assert isinstance(data, dict)
    
    async def test_batch_spot_mixed_markets(self, client: AsyncClient):
        """测试混合市场批量请求"""
        payload = {
            "symbols": [
                {"symbol": "600519", "market": "CN"},
                {"symbol": "00700", "market": "HK"}
            ]
        }
        
        response = await client.post("/api/v1/akshare/stock/spot/batch", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        # 某些可能失败，但至少应该有一些成功
        assert len(data) >= 1
        assert isinstance(data, dict)
