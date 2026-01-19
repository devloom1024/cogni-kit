# 测试文档

## 📁 目录结构

```
tests/
├── conftest.py              # 全局配置和共享 Fixtures
├── unit/                    # 单元测试
│   ├── conftest.py          # 单元测试专用 Fixtures
│   ├── test_pinyin.py       # 拼音工具测试
│   ├── test_calculator.py   # 指标计算器测试
│   ├── test_akshare_client.py    # AkShare 客户端测试
│   ├── test_akshare_service.py   # AkShare 服务层测试
│   └── test_indicators_service.py # Indicators 服务层测试
├── integration/             # 集成测试
│   ├── conftest.py          # 集成测试专用 Fixtures
│   ├── test_akshare.py      # AkShare 模块集成测试
│   └── test_indicators.py   # Indicators 模块集成测试
├── api/                     # API 测试（真实数据）
│   ├── conftest.py          # API 测试专用 Fixtures
│   ├── test_health.py       # 健康检查测试
│   └── test_akshare_real.py # AkShare 真实数据测试
├── fixtures/                # 共享测试数据
│   ├── __init__.py
│   └── sample_data.py       # 示例数据 Fixtures
├── mocks/                   # Mock 对象
│   ├── __init__.py
│   └── akshare_mocks.py     # AkShare Mock 数据
└── helpers/                 # 测试辅助函数
    ├── __init__.py
    └── assertions.py        # 断言辅助函数
```

## 📋 测试分类

### 1. 单元测试 (Unit Tests)
**标记**: `@pytest.mark.unit`

**特点**:
- ✅ 快速执行（毫秒级）
- ✅ 完全隔离，无外部依赖
- ✅ 结果稳定可靠
- ✅ 适合 TDD 开发

**测试内容**:
- 独立函数和类
- 数据验证逻辑
- 工具函数

**示例**:
```python
@pytest.mark.unit
def test_get_pinyin_initial():
    assert get_pinyin_initial("中国平安") == "ZGPA"
```

**文件**:
- `unit/test_pinyin.py` - 拼音工具测试
- `unit/test_calculator.py` - 指标计算器测试
- `unit/test_akshare_client.py` - AkShare 客户端测试
- `unit/test_akshare_service.py` - AkShare 服务层测试
- `unit/test_indicators_service.py` - Indicators 服务层测试

---

### 2. 集成测试 (Integration Tests)
**标记**: `@pytest.mark.integration`

**特点**:
- ✅ 较快执行（秒级）
- ✅ Mock 外部服务（AkShare）
- ✅ 测试模块间交互
- ✅ 测试内部逻辑和错误处理

**测试内容**:
- Service 层逻辑
- 缓存机制
- 错误处理
- 数据流转

**示例**:
```python
@pytest.mark.integration
@patch('app.modules.akshare.client.akshare_client.get_stock_list')
async def test_get_stock_list_with_mock(mock_get_stock_list, client):
    mock_get_stock_list.return_value = [...]
    response = await client.get("/akshare/stock/list")
    assert response.status_code == 200
```

**文件**:
- `integration/test_akshare.py` - AkShare 模块集成测试
- `integration/test_indicators.py` - Indicators 模块集成测试

---

### 3. API 测试 (API Tests)
**标记**: `@pytest.mark.api` + `@pytest.mark.slow`

**特点**:
- ⚠️ 慢速执行（秒到分钟级）
- ⚠️ 依赖外部服务（AkShare API）
- ⚠️ 需要网络连接
- ⚠️ 可能因外部服务不稳定而失败

**测试内容**:
- 真实 API 端点
- 真实数据获取
- 端到端流程
- 边界情况

**示例**:
```python
@pytest.mark.api
@pytest.mark.slow
async def test_get_stock_list_real(client):
    response = await client.get("/akshare/stock/list?market=CN")
    assert response.status_code == 200
    # 验证真实数据
```

**文件**:
- `api/test_akshare_real.py` - AkShare 真实数据测试
- `api/test_health.py` - 健康检查测试

---

## 🚀 运行测试

### 快速开始

```bash
# 运行快速测试（单元 + 集成，跳过慢速测试）
./run_tests.sh fast

# 或者
uv run pytest -m "not slow"
```

### 按类型运行

```bash
# 只运行单元测试
./run_tests.sh unit
uv run pytest tests/unit/ -v

# 只运行集成测试
./run_tests.sh integration
uv run pytest tests/integration/ -v

# 只运行 API 测试（真实数据）
./run_tests.sh api
uv run pytest tests/api/ -v

# 运行所有测试
./run_tests.sh all
uv run pytest
```

### 运行特定测试

```bash
# 运行单个测试文件
uv run pytest tests/unit/test_pinyin.py -v

# 运行单个测试类
uv run pytest tests/unit/test_pinyin.py::TestPinyinUtils -v

# 运行单个测试方法
uv run pytest tests/unit/test_pinyin.py::TestPinyinUtils::test_get_pinyin_initial_chinese -v
```

### 生成覆盖率报告

```bash
./run_tests.sh coverage

# 或者
uv run pytest --cov=app --cov-report=html --cov-report=term
```

查看报告: `open htmlcov/index.html`

---

## 📊 测试策略

### 测试金字塔

```
        ┌─────────────┐
        │  API 测试   │  10% - 少量，真实场景
        ├─────────────┤
        │  集成测试   │  30% - 中等，模块交互
        ├─────────────┤
        │  单元测试   │  60% - 大量，独立函数
        └─────────────┘
```

### 何时使用哪种测试？

| 场景 | 测试类型 | 原因 |
|------|---------|------|
| 开发新功能 | 单元测试 | 快速反馈，TDD |
| 重构代码 | 单元 + 集成 | 确保逻辑正确 |
| 发布前验证 | 所有测试 | 全面检查 |
| CI/CD 流水线 | 单元 + 集成 | 快速稳定 |
| 手动测试前 | API 测试 | 验证真实场景 |

---

## 🎯 最佳实践

### 1. 编写测试的原则

- **FIRST 原则**:
  - **F**ast - 快速
  - **I**ndependent - 独立
  - **R**epeatable - 可重复
  - **S**elf-validating - 自我验证
  - **T**imely - 及时

### 2. 测试命名

```python
# ✅ 好的命名
def test_get_pinyin_initial_with_chinese_characters():
    pass

# ❌ 不好的命名
def test1():
    pass
```

### 3. 使用 Fixtures

```python
@pytest.fixture
def sample_data():
    return {"key": "value"}

def test_something(sample_data):
    assert sample_data["key"] == "value"
```

### 4. Mock 外部依赖

```python
@patch('app.modules.akshare.client.akshare_client.get_stock_list')
async def test_with_mock(mock_get_stock_list):
    mock_get_stock_list.return_value = [...]
```

---

## 📝 添加新测试

### 1. 单元测试

```python
# tests/unit/test_mymodule.py
import pytest

@pytest.mark.unit
class TestMyModule:
    def test_my_function(self):
        result = my_function(input)
        assert result == expected
```

### 2. 集成测试

```python
# tests/integration/test_mymodule.py
import pytest
from unittest.mock import patch

@pytest.mark.integration
class TestMyModuleIntegration:
    @patch('app.modules.mymodule.external_call')
    async def test_with_mock(self, mock_external, client):
        mock_external.return_value = mock_data
        response = await client.get("/endpoint")
        assert response.status_code == 200
```

### 3. API 测试

```python
# tests/api/test_mymodule_real.py
import pytest

@pytest.mark.api
@pytest.mark.slow
class TestMyModuleAPIReal:
    async def test_real_endpoint(self, client):
        response = await client.get("/endpoint")
        assert response.status_code == 200
        # 验证真实数据
```

### 4. 使用共享 Fixtures

```python
# 从 fixtures 目录导入
def test_with_sample_data(sample_kline_data):
    assert len(sample_kline_data) == 30
```

### 5. 使用 Mock 对象

```python
# 从 mocks 目录导入
from tests.mocks.akshare_mocks import get_mock_stock_list

@patch('app.modules.akshare.client.akshare_client.get_stock_list')
async def test_with_mock(mock_get_stock_list):
    mock_get_stock_list.return_value = get_mock_stock_list()
    # 测试逻辑
```

### 6. 使用辅助断言函数

```python
# 从 helpers 目录导入
from tests.helpers.assertions import assert_stock_info_structure

def test_stock_info(stock_data):
    assert_stock_info_structure(stock_data)
```

---

## 🐛 调试测试

```bash
# 运行单个测试文件
uv run pytest tests/unit/test_pinyin.py -v

# 运行单个测试类
uv run pytest tests/unit/test_pinyin.py::TestPinyinUtils -v

# 运行单个测试方法
uv run pytest tests/unit/test_pinyin.py::TestPinyinUtils::test_get_pinyin_initial_chinese -v

# 显示打印输出
uv run pytest -s

# 进入调试模式
uv run pytest --pdb
```

---

## 📈 持续集成

### GitHub Actions 示例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install uv
        run: curl -LsSf https://astral.sh/uv/install.sh | sh
      - name: Install dependencies
        run: uv sync
      - name: Run fast tests
        run: uv run pytest -m "not slow"
```

---

## 📚 参考资源

- [Pytest 文档](https://docs.pytest.org/)
- [FastAPI 测试](https://fastapi.tiangolo.com/tutorial/testing/)
- [测试金字塔](https://martinfowler.com/articles/practical-test-pyramid.html)
