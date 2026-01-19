# 金融数据服务 (Financial Data Service)

模块化金融数据微服务，封装 AkShare 数据源和技术指标计算功能。

## 📋 功能模块

- **AkShare 模块** (`/akshare/*`) - 股票、基金行情数据
- **技术指标模块** (`/indicators/*`) - MA、EMA、MACD 等指标计算
- **健康检查** (`/health`) - 服务状态监控

## 🚀 快速开始

### 环境变量配置

**重要**: 本服务使用 Monorepo 统一的环境变量管理，无需单独配置。

环境变量在**项目根目录**的 `.env` 文件中统一管理：

```bash
# 1. 回到项目根目录
cd ../..

# 2. 如果是首次设置，复制示例文件
cp .env.example .env

# 3. 编辑配置（Python 服务配置已包含在内）
vim .env

# 4. 同步环境变量到所有子项目
bun run sync-env
```

Python 服务的配置使用 `PYTHON_*` 前缀，同步后会自动去除前缀。详见 [ENV_MANAGEMENT.md](./ENV_MANAGEMENT.md)。

### 安装依赖

```bash
# 使用 uv 安装依赖
uv sync
```

### 启动服务

```bash
# 开发模式（热重载）
uv run uvicorn app.main:app --reload --port 8000

# 生产模式
./start.sh
```

### 访问文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- 健康检查: http://localhost:8000/health

## 📂 项目结构

```
services/financial-data/
├── app/
│   ├── main.py              # FastAPI 应用入口
│   ├── config.py            # 配置管理
│   ├── deps.py              # 依赖注入
│   │
│   ├── core/                # 核心通用层
│   │   ├── cache.py         # Redis 缓存
│   │   ├── exceptions.py    # 自定义异常
│   │   └── schemas.py       # 通用模型
│   │
│   ├── modules/             # 功能模块
│   │   ├── akshare/         # 行情数据模块
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── client.py
│   │   │   └── schemas.py
│   │   │
│   │   └── indicators/      # 技术指标模块
│   │       ├── router.py
│   │       ├── service.py
│   │       ├── calculator.py
│   │       └── schemas.py
│   │
│   └── utils/
│       └── pinyin.py        # 拼音转换工具
│
├── pyproject.toml           # 项目配置
├── .env.example             # 环境变量示例
└── start.sh                 # 启动脚本
```

## 🔧 技术栈

- **FastAPI** - 高性能 Web 框架
- **AkShare** - 金融数据源
- **pandas-ta** - 技术指标计算
- **Redis** - 缓存层
- **Pydantic** - 数据验证
- **uv** - 包管理器

## 📊 API 端点

### AkShare 模块

- `GET /akshare/stock/list` - 全量股票列表
- `GET /akshare/stock/search` - 搜索股票
- `GET /akshare/stock/{symbol}/spot` - 实时行情
- `GET /akshare/stock/{symbol}/kline` - K线数据
- `GET /akshare/fund/list` - 全量基金列表
- `GET /akshare/fund/{symbol}/nav` - 基金净值
- `GET /akshare/fund/{symbol}/holdings` - 持仓明细

### 技术指标模块

- `POST /indicators/calculate` - 计算技术指标
- `GET /indicators/supported` - 支持的指标列表

## 🎯 缓存策略

| 数据类型 | TTL | 说明 |
|---------|-----|------|
| 实时行情 | 10s | 高频访问 |
| K线数据 | 5min | 日内不变 |
| 基金净值 | 1h | 每日更新 |
| 技术指标 | 2min | 实时计算 |

## 📝 开发指南

### 添加新的 API 端点

1. 在 `app/modules/[module]/schemas.py` 定义 Pydantic 模型
2. 在 `app/modules/[module]/service.py` 实现业务逻辑
3. 在 `app/modules/[module]/router.py` 添加路由

### 代码规范

- 所有函数必须有类型提示
- 使用 Pydantic 模型，禁止返回 `dict`
- 异步 I/O，禁止阻塞操作
- 使用结构化日志记录

## 🐳 Docker 部署

```bash
# 构建镜像
docker build -t financial-data-service .

# 运行容器
docker run -p 8000:8000 --env-file .env financial-data-service
```

## 📄 许可证

MIT License
