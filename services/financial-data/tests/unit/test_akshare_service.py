"""单元测试 - AkShare Service

测试 AkShare 服务层的缓存逻辑和业务逻辑。
所有 Client 调用都被 Mock。
"""
import pytest
from unittest.mock import AsyncMock, patch
from datetime import datetime

from app.modules.akshare.service import akshare_service
from tests.mocks.akshare_mocks import (
    get_mock_stock_list,
    get_mock_realtime_quote,
    get_mock_kline_data,
    get_mock_fund_list
)


@pytest.mark.unit
class TestAkShareService:
    """AkShare 服务层单元测试"""
    
    @patch('app.modules.akshare.service.akshare_client.get_stock_list')
    @patch('app.modules.akshare.service.cache.get')
    @patch('app.modules.akshare.service.cache.set')
    async def test_get_stock_list_with_cache_miss(self, mock_cache_set, mock_cache_get, mock_get_stock_list):
        """测试缓存未命中时获取股票列表"""
        # Mock 缓存未命中
        mock_cache_get.return_value = None
        
        # Mock client 返回数据
        mock_data = get_mock_stock_list()
        mock_get_stock_list.return_value = mock_data
        
        result = await akshare_service.get_stock_list("CN")
        
        # 验证调用了 client
        mock_get_stock_list.assert_called_once_with("CN")
        
        # 验证设置了缓存
        mock_cache_set.assert_called_once()
        
        # 验证返回数据
        assert len(result) == len(mock_data)
    
    @patch('app.modules.akshare.service.akshare_client.get_stock_list')
    @patch('app.modules.akshare.service.cache.get')
    async def test_get_stock_list_with_cache_hit(self, mock_cache_get, mock_get_stock_list):
        """测试缓存命中时获取股票列表"""
        # Mock 缓存命中
        cached_data = [stock.model_dump() for stock in get_mock_stock_list()]
        mock_cache_get.return_value = cached_data
        
        result = await akshare_service.get_stock_list("CN")
        
        # 验证没有调用 client
        mock_get_stock_list.assert_not_called()
        
        # 验证返回缓存数据
        assert len(result) == len(cached_data)
    
    @patch('app.modules.akshare.service.akshare_client.search_stock')
    async def test_search_stock(self, mock_search_stock):
        """测试搜索股票（不使用缓存）"""
        mock_data = get_mock_stock_list()[:1]
        mock_search_stock.return_value = mock_data
        
        result = await akshare_service.search_stock("茅台")
        
        mock_search_stock.assert_called_once_with("茅台")
        assert len(result) == 1
    
    @patch('app.modules.akshare.service.akshare_client.get_realtime_quote')
    @patch('app.modules.akshare.service.cache.get')
    @patch('app.modules.akshare.service.cache.set')
    async def test_get_realtime_quote_with_cache(self, mock_cache_set, mock_cache_get, mock_get_quote):
        """测试获取实时行情（带缓存）"""
        mock_cache_get.return_value = None
        mock_data = get_mock_realtime_quote()
        mock_get_quote.return_value = mock_data
        
        result = await akshare_service.get_realtime_quote("600519")
        
        # 注意：service 方法有两个参数 (symbol, market)
        mock_get_quote.assert_called_once()
        mock_cache_set.assert_called_once()
        assert result.price == mock_data.price
    
    @patch('app.modules.akshare.service.akshare_client.get_kline')
    @patch('app.modules.akshare.service.cache.get')
    @patch('app.modules.akshare.service.cache.set')
    async def test_get_kline_with_cache(self, mock_cache_set, mock_cache_get, mock_get_kline):
        """测试获取 K 线数据（带缓存）"""
        mock_cache_get.return_value = None
        mock_data = get_mock_kline_data(30)
        mock_get_kline.return_value = mock_data
        
        result = await akshare_service.get_kline("600519", period="day", limit=30)
        
        # 注意：service 方法有多个参数
        mock_get_kline.assert_called_once()
        mock_cache_set.assert_called_once()
        assert len(result) == 30
    
    @patch('app.modules.akshare.service.akshare_client.get_fund_list')
    @patch('app.modules.akshare.service.cache.get')
    @patch('app.modules.akshare.service.cache.set')
    async def test_get_fund_list_with_cache(self, mock_cache_set, mock_cache_get, mock_get_fund_list):
        """测试获取基金列表（带缓存）"""
        mock_cache_get.return_value = None
        mock_data = get_mock_fund_list()
        mock_get_fund_list.return_value = mock_data
        
        result = await akshare_service.get_fund_list("ETF")
        
        mock_get_fund_list.assert_called_once_with("ETF")
        mock_cache_set.assert_called_once()
        assert len(result) == len(mock_data)


@pytest.mark.unit
class TestAkShareServiceCacheKeys:
    """测试缓存键生成逻辑"""
    
    def test_cache_key_format(self):
        """测试缓存键格式"""
        # 这里可以测试缓存键的生成逻辑
        # 例如：akshare:stock:list:CN
        # 确保不同参数生成不同的缓存键
        pass
