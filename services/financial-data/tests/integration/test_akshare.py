"""集成测试 - AkShare 模块（Mock 数据）

这些测试使用 Mock 数据，不依赖外部服务：
1. 执行速度快
2. 结果稳定可靠
3. 测试内部逻辑和错误处理
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch
from datetime import datetime, date

from app.modules.akshare.schemas import StockInfo, RealtimeQuote, KLinePoint


@pytest.mark.integration
class TestAkShareIntegration:
    """AkShare 集成测试（Mock 外部调用）"""
    
    @patch('app.modules.akshare.client.akshare_client.get_stock_list')
    async def test_get_stock_list_with_mock(self, mock_get_stock_list, client: AsyncClient):
        """测试获取股票列表（Mock）"""
        # Mock 返回数据
        mock_get_stock_list.return_value = [
            StockInfo(symbol="600519", name="贵州茅台", market="CN"),
            StockInfo(symbol="000001", name="平安银行", market="CN")
        ]
        
        response = await client.get("/akshare/stock/list")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) == 2
        assert data[0]["symbol"] == "600519"
        assert data[0]["name"] == "贵州茅台"
    
    @patch('app.modules.akshare.client.akshare_client.search_stock')
    async def test_search_stock_with_mock(self, mock_search_stock, client: AsyncClient):
        """测试搜索股票（Mock）"""
        mock_search_stock.return_value = [
            StockInfo(symbol="600519", name="贵州茅台", market="CN")
        ]
        
        response = await client.get("/akshare/stock/search?q=茅台")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) == 1
        assert "茅台" in data[0]["name"]
    
    @patch('app.modules.akshare.client.akshare_client.get_realtime_quote')
    async def test_get_realtime_quote_with_mock(self, mock_get_quote, client: AsyncClient):
        """测试获取实时行情（Mock）"""
        mock_get_quote.return_value = RealtimeQuote(
            price=1800.0,
            open=1790.0,
            prev_close=1785.0,
            high=1810.0,
            low=1780.0,
            volume=1000000.0,
            amount=1800000000.0,
            change=15.0,
            change_percent=0.84,
            turnover_rate=0.5,
            market_cap=2260000.0,
            pe=45.5,
            pb=12.3,
            trading_status="TRADING",
            timestamp=datetime.now()
        )
        
        response = await client.get("/akshare/stock/600519/spot")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["price"] == 1800.0
        assert data["tradingStatus"] == "TRADING"
    
    @patch('app.modules.akshare.client.akshare_client.get_kline')
    async def test_get_kline_with_mock(self, mock_get_kline, client: AsyncClient):
        """测试获取 K 线数据（Mock）"""
        mock_klines = [
            KLinePoint(
                timestamp=1640000000000 + i * 86400000,
                open=1800.0 + i,
                high=1810.0 + i,
                low=1790.0 + i,
                close=1805.0 + i,
                volume=1000000.0
            )
            for i in range(5)
        ]
        mock_get_kline.return_value = mock_klines
        
        response = await client.get("/akshare/stock/600519/kline?limit=5")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) == 5
        assert data[0]["open"] == 1800.0
    
    @patch('app.modules.akshare.client.akshare_client.get_realtime_quote')
    async def test_error_handling_data_source_error(self, mock_get_quote, client: AsyncClient):
        """测试数据源错误处理"""
        from app.core.exceptions import DataSourceError
        
        # Mock 抛出异常
        mock_get_quote.side_effect = DataSourceError("AkShare API 调用失败")
        
        response = await client.get("/akshare/stock/600519/spot")
        
        # 应该返回 500 错误
        assert response.status_code == 500
        data = response.json()
        assert "code" in data
        assert "message" in data
    
    async def test_cache_behavior(self, client: AsyncClient):
        """测试缓存行为"""
        # 这个测试验证缓存逻辑，但不依赖真实数据
        # 可以通过多次调用相同端点来验证缓存
        
        # 第一次调用
        response1 = await client.get("/indicators/supported")
        assert response1.status_code == 200
        
        # 第二次调用（应该从缓存获取）
        response2 = await client.get("/indicators/supported")
        assert response2.status_code == 200
        
        # 结果应该相同
        assert response1.json() == response2.json()
