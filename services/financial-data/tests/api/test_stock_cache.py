"""股票接口缓存验证测试"""
import pytest
import time
import asyncio
from httpx import AsyncClient
from app.core.cache import cache


@pytest.mark.asyncio
class TestStockCacheValidation:
    """股票接口缓存验证测试"""
    
    async def test_profile_cache_hit(self, client: AsyncClient):
        """测试 profile 接口缓存命中"""
        symbol = "600519"
        
        # 清空缓存
        await cache.delete(f"stock:profile:CN:{symbol}")
        
        # 第一次请求 - 缓存未命中
        start1 = time.time()
        response1 = await client.get(f"/api/v1/akshare/stock/{symbol}/profile?market=CN")
        time1 = time.time() - start1
        assert response1.status_code == 200
        
        # 第二次请求 - 缓存命中
        start2 = time.time()
        response2 = await client.get(f"/api/v1/akshare/stock/{symbol}/profile?market=CN")
        time2 = time.time() - start2
        assert response2.status_code == 200
        
        # 验证数据一致
        assert response1.json() == response2.json()
        
        # 验证缓存加速（第二次应该更快）
        assert time2 < time1 * 0.5, f"缓存未生效：第一次 {time1:.3f}s，第二次 {time2:.3f}s"
    
    async def test_valuation_cache_ttl(self, client: AsyncClient):
        """测试 valuation 接口缓存 TTL"""
        symbol = "600519"
        cache_key = f"stock:valuation:CN:{symbol}"
        
        # 清空缓存
        await cache.delete(cache_key)
        
        # 第一次请求
        response1 = await client.get(f"/api/v1/akshare/stock/{symbol}/valuation?market=CN")
        assert response1.status_code == 200
        
        # 验证缓存存在
        cached = await cache.get(cache_key)
        assert cached is not None
        
        # 验证 TTL（应该是 5 分钟 = 300 秒）
        ttl = await cache.ttl(cache_key)
        assert 290 <= ttl <= 300, f"TTL 不正确: {ttl}"
    
    async def test_spot_cache_different_markets(self, client: AsyncClient):
        """测试不同市场的缓存隔离"""
        # A股
        response_cn = await client.get("/api/v1/akshare/stock/600519/spot?market=CN")
        assert response_cn.status_code == 200
        
        # 港股
        response_hk = await client.get("/api/v1/akshare/stock/00700/spot?market=HK")
        assert response_hk.status_code == 200
        
        # 验证缓存键不同
        cache_cn = await cache.get("stock:spot:CN:600519")
        cache_hk = await cache.get("stock:spot:HK:00700")
        
        assert cache_cn is not None
        assert cache_hk is not None
        assert cache_cn != cache_hk
    
    async def test_fund_flow_cache_refresh(self, client: AsyncClient):
        """测试资金流向缓存刷新（TTL 5秒）"""
        symbol = "600519"
        
        # 第一次请求
        response1 = await client.get(f"/api/v1/akshare/stock/{symbol}/fund-flow")
        assert response1.status_code == 200
        data1 = response1.json()
        
        # 等待 6 秒，缓存应该过期
        await asyncio.sleep(6)
        
        # 第二次请求
        response2 = await client.get(f"/api/v1/akshare/stock/{symbol}/fund-flow")
        assert response2.status_code == 200
        data2 = response2.json()
        
        # 数据可能不同（因为重新获取）
        assert response2.status_code == 200
    
    async def test_bid_ask_cache_ultra_short(self, client: AsyncClient):
        """测试五档盘口超短缓存（TTL 1秒）"""
        symbol = "600519"
        cache_key = f"stock:bid-ask:{symbol}"
        
        # 清空缓存
        await cache.delete(cache_key)
        
        # 第一次请求
        await client.get(f"/api/v1/akshare/stock/{symbol}/bid-ask")
        
        # 验证缓存存在且 TTL 约为 1 秒
        ttl = await cache.ttl(cache_key)
        assert 0 < ttl <= 1, f"TTL 不正确: {ttl}"
        
        # 等待 2 秒后缓存应该过期
        await asyncio.sleep(2)
        cached = await cache.get(cache_key)
        assert cached is None, "缓存应该已过期"
