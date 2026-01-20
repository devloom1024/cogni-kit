"""股票基础接口测试

注意：部分测试依赖 AkShare API，可能因网络问题失败。
这些测试标记为 flaky，允许失败而不影响整体测试结果。
"""
import pytest
from httpx import AsyncClient


# 标记网络依赖的测试为 flaky（允许失败）
pytestmark = pytest.mark.filterwarnings("ignore::DeprecationWarning")


@pytest.mark.asyncio
class TestStockBasicAPI:
    """股票基础接口测试"""
    
    @pytest.mark.flaky(reruns=2, reruns_delay=1)
    async def test_get_profile(self, client: AsyncClient):
        """测试获取公司信息"""
        response = await client.get("/api/v1/akshare/stock/600519/profile?market=CN")
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "600519"
        assert "name" in data
        assert "industry" in data
    
    @pytest.mark.flaky(reruns=2, reruns_delay=1)
    async def test_get_valuation(self, client: AsyncClient):
        """测试获取估值数据"""
        response = await client.get("/api/v1/akshare/stock/600519/valuation?market=CN")
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "600519"
        assert "marketCap" in data or "market_cap" in data
        assert "pe" in data
    
    @pytest.mark.flaky(reruns=2, reruns_delay=1)
    async def test_get_financial(self, client: AsyncClient):
        """测试获取财务数据"""
        response = await client.get("/api/v1/akshare/stock/600519/financial?market=CN")
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "600519"
        assert "revenue" in data or "reportDate" in data or "report_date" in data
    
    @pytest.mark.flaky(reruns=2, reruns_delay=1)
    async def test_get_shareholders_cn_only(self, client: AsyncClient):
        """测试股东信息（仅A股）"""
        # A股应该成功
        response = await client.get("/api/v1/akshare/stock/600519/shareholders")
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "600519"
        assert "top10Shareholders" in data or "top10_shareholders" in data
    
    @pytest.mark.flaky(reruns=2, reruns_delay=1)
    async def test_get_fund_flow(self, client: AsyncClient):
        """测试资金流向"""
        response = await client.get("/api/v1/akshare/stock/600519/fund-flow")
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "600519"
        assert "mainNetInflow" in data or "main_net_inflow" in data
    
    @pytest.mark.flaky(reruns=2, reruns_delay=1)
    async def test_get_bid_ask(self, client: AsyncClient):
        """测试五档盘口"""
        response = await client.get("/api/v1/akshare/stock/600519/bid-ask")
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "600519"
        assert "bids" in data
        assert "asks" in data
        assert len(data["bids"]) <= 5
        assert len(data["asks"]) <= 5
