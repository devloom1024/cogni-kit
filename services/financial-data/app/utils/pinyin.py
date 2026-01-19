"""拼音转换工具"""
from pypinyin import lazy_pinyin, Style


def get_pinyin_initial(text: str) -> str:
    """提取拼音首字母
    
    Args:
        text: 中文文本
        
    Returns:
        拼音首字母（大写）
        
    Examples:
        >>> get_pinyin_initial("中国平安")
        'ZGPA'
        >>> get_pinyin_initial("贵州茅台")
        'GZMT'
    """
    if not text:
        return ""
    
    initials = lazy_pinyin(text, style=Style.FIRST_LETTER)
    return ''.join(initials).upper()


def get_full_pinyin(text: str) -> str:
    """获取完整拼音
    
    Args:
        text: 中文文本
        
    Returns:
        完整拼音（小写，空格分隔）
        
    Examples:
        >>> get_full_pinyin("中国平安")
        'zhong guo ping an'
    """
    if not text:
        return ""
    
    pinyin_list = lazy_pinyin(text, style=Style.NORMAL)
    return ' '.join(pinyin_list)
