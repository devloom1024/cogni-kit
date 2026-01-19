"""单元测试 - AkShare Client

测试 AkShare 客户端的数据转换和错误处理逻辑。
所有外部 API 调用都被 Mock。
"""
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime
import pandas as pd

from app.modules.akshare.client import akshare_client
from app.modules.akshare.schemas import StockInfo, RealtimeQuote, KLinePoint, FundInfo
from app.core.exceptions import DataSourceError


@pytest.mark.unit
class TestAkShareClient:
    """AkShare 客户端单元测试"""
    
    @patch('app.modules.akshare.client.ak')
    async def test_get_stock_list_success(self, mock_ak):
        """测试获取股票列表成功"""
        # Mock akshare 返回的 DataFrame
        mock_df = pd.DataFrame({
            '代码': ['600519', '000001'],
            '名称': ['贵州茅台', '平安银行']
        })
        mock_ak.stock_zh_a_spot_em.return_value = mock_df
        
        result = await akshare_client.get_stock_list("CN")
        
        assert len(result) == 2
        assert isinstance(result[0], StockInfo)
        assert result[0].symbol == "600519"
        assert result[0].name == "贵州茅台"
        assert result[0].market == "CN"
    
    @patch('app.modules.akshare.client.ak')
    async def test_get_stock_list_empty(self, mock_ak):
        """测试获取空股票列表"""
        mock_df = pd.DataFrame(columns=['代码', '名称'])
        mock_ak.stock_zh_a_spot_em.return_value = mock_df
        
        result = await akshare_client.get_stock_list("CN")
        
        assert len(result) == 0
    
    @patch('app.modules.akshare.client.ak')
    async def test_get_stock_list_api_error(self, mock_ak):
        """测试 API 调用失败"""
        mock_ak.stock_zh_a_spot_em.side_effect = Exception("API Error")
        
        with pytest.raises(DataSourceError) as exc_info:
            await akshare_client.get_stock_list("CN")
        
        assert "获取股票列表失败" in str(exc_info.value)
    
    @patch('app.modules.akshare.client.ak')
    async def test_search_stock_success(self, mock_ak):
        """测试搜索股票成功"""
        mock_df = pd.DataFrame({
            '代码': ['600519'],
            '名称': ['贵州茅台']
        })
        mock_ak.stock_zh_a_spot_em.return_value = mock_df
        
        result = await akshare_client.search_stock("茅台")
        
        assert len(result) == 1
        assert result[0].symbol == "600519"
        assert "茅台" in result[0].name
    
    @patch('app.modules.akshare.client.ak')
    async def test_search_stock_no_results(self, mock_ak):
        """测试搜索无结果"""
        mock_df = pd.DataFrame({
            '代码': ['600519'],
            '名称': ['贵州茅台']
        })
        mock_ak.stock_zh_a_spot_em.return_value = mock_df
        
        result = await akshare_client.search_stock("不存在的股票")
        
        assert len(result) == 0
    
    @patch('app.modules.akshare.client.ak')
    async def test_get_realtime_quote_success(self, mock_ak):
        """测试获取实时行情成功"""
        mock_df = pd.DataFrame({
            '代码': ['600519'],
            '名称': ['贵州茅台'],
            '最新价': [1800.0],
            '今开': [1790.0],
            '昨收': [1785.0],
            '最高': [1810.0],
            '最低': [1780.0],
            '成交量': [1000000.0],
            '成交额': [1800000000.0],
            '涨跌额': [15.0],
            '涨跌幅': [0.84],
            '换手率': [0.5],
            '总市值': [2260000.0],
            '市盈率': [45.5],
            '市净率': [12.3]
        })
        mock_ak.stock_zh_a_spot_em.return_value = mock_df
        
        result = await akshare_client.get_realtime_quote("600519")
        
        assert isinstance(result, RealtimeQuote)
        assert result.price == 1800.0
        assert result.open == 1790.0
        assert result.tradingStatus == "TRADING"
    
    @patch('app.modules.akshare.client.ak')
    async def test_get_realtime_quote_not_found(self, mock_ak):
        """测试股票不存在"""
        mock_df = pd.DataFrame(columns=['代码', '名称', '最新价'])
        mock_ak.stock_zh_a_spot_em.return_value = mock_df
        
        with pytest.raises(DataSourceError) as exc_info:
            await akshare_client.get_realtime_quote("999999")
        
        assert "未找到股票" in str(exc_info.value)
    
    @patch('app.modules.akshare.client.ak')
    async def test_get_kline_success(self, mock_ak):
        """测试获取 K 线数据成功"""
        mock_df = pd.DataFrame({
            '日期': ['2024-01-01', '2024-01-02'],
            '开盘': [1800.0, 1805.0],
            '收盘': [1805.0, 1810.0],
            '最高': [1810.0, 1815.0],
            '最低': [1795.0, 1800.0],
            '成交量': [1000000.0, 1100000.0]
        })
        mock_ak.stock_zh_a_hist.return_value = mock_df
        
        result = await akshare_client.get_kline("600519", "day", 2)
        
        assert len(result) == 2
        assert isinstance(result[0], KLinePoint)
        assert result[0].open == 1800.0
        assert result[0].close == 1805.0
    
    @patch('app.modules.akshare.client.ak')
    async def test_get_fund_list_success(self, mock_ak):
        """测试获取基金列表成功"""
        mock_df = pd.DataFrame({
            '代码': ['110022', '161725'],
            '名称': ['易方达消费行业', '招商中证白酒']
        })
        mock_ak.fund_etf_spot_em.return_value = mock_df
        
        result = await akshare_client.get_fund_list("ETF")
        
        assert len(result) == 2
        assert isinstance(result[0], FundInfo)
        assert result[0].symbol == "110022"
        assert result[0].type == "ETF"
    
    @patch('app.modules.akshare.client.ak')
    async def test_search_fund_success(self, mock_ak):
        """测试搜索基金成功"""
        mock_df = pd.DataFrame({
            '代码': ['110022'],
            '名称': ['易方达消费行业']
        })
        mock_ak.fund_etf_spot_em.return_value = mock_df
        
        result = await akshare_client.search_fund("消费")
        
        assert len(result) == 1
        assert "消费" in result[0].name
