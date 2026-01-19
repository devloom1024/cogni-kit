"""单元测试 - 拼音工具"""
import pytest
from app.utils.pinyin import get_pinyin_initial, get_full_pinyin


@pytest.mark.unit
class TestPinyinUtils:
    """拼音工具测试类"""
    
    def test_get_pinyin_initial_chinese(self):
        """测试中文拼音首字母提取"""
        assert get_pinyin_initial("中国平安") == "ZGPA"
        assert get_pinyin_initial("贵州茅台") == "GZMT"
        assert get_pinyin_initial("招商银行") == "ZSYH"
    
    def test_get_pinyin_initial_empty(self):
        """测试空字符串"""
        assert get_pinyin_initial("") == ""
    
    def test_get_pinyin_initial_mixed(self):
        """测试中英文混合"""
        result = get_pinyin_initial("中国A股")
        assert "ZG" in result
        assert "A" in result
    
    def test_get_full_pinyin_chinese(self):
        """测试完整拼音"""
        result = get_full_pinyin("中国")
        assert "zhong" in result
        assert "guo" in result
    
    def test_get_full_pinyin_empty(self):
        """测试空字符串"""
        assert get_full_pinyin("") == ""
