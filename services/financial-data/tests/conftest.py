"""Pytest 全局配置

这个文件包含所有测试共享的配置和 Fixtures。
特定测试类型的 Fixtures 在各自目录的 conftest.py 中定义。
"""
import pytest

# 配置 pytest 标记
def pytest_configure(config):
    """注册自定义标记"""
    config.addinivalue_line("markers", "unit: 单元测试标记")
    config.addinivalue_line("markers", "integration: 集成测试标记")
    config.addinivalue_line("markers", "api: API 测试标记")
    config.addinivalue_line("markers", "slow: 慢速测试标记（需要外部服务）")


# 导入共享 fixtures（从 fixtures 目录）
pytest_plugins = [
    "tests.fixtures.sample_data",
]
