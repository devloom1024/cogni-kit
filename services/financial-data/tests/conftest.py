"""Pytest 全局配置

这个文件包含所有测试共享的配置和 Fixtures。
当前测试代码已清理，待新模块结构的测试用例实现后再补充。
"""
import pytest


# 配置 pytest 标记
def pytest_configure(config):
    """注册自定义标记"""
    config.addinivalue_line("markers", "slow: 慢速测试标记（需要外部服务）")
