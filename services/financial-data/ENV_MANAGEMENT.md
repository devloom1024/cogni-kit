# 环境变量管理说明

## 📋 概述

本服务已集成到 CogniKit Monorepo 的统一环境变量管理体系中。

## 🔧 工作原理

```
根目录 .env (单一数据源)
    ↓ 自动同步脚本 (scripts/sync-env.ts)
    ├─→ apps/server/.env (SERVER_* 前缀)
    ├─→ apps/web/.env (WEB_* 前缀)
    ├─→ services/financial-data/.env (PYTHON_* 前缀) ← 本服务
    └─→ infra/docker/.env (Docker 配置)
```

## ✅ 配置步骤

### 1. 在根目录 `.env` 中配置

```bash
# 回到项目根目录
cd ../..

# 编辑 .env 文件
vim .env
```

### 2. 添加 Python 服务配置

使用 `PYTHON_*` 前缀：

```bash
# =================================
# Python 服务配置 (PYTHON_* 前缀)
# =================================
PYTHON_PORT=8000
PYTHON_LOG_LEVEL=INFO
PYTHON_CACHE_TTL_QUOTE=10
PYTHON_CACHE_TTL_KLINE=300
PYTHON_CACHE_TTL_NAV=3600
PYTHON_CACHE_TTL_INDICATOR=120
```

共享配置（无需前缀）：
```bash
# Redis 配置 (共享)
REDIS_URL=redis://localhost:6379
```

### 3. 同步环境变量

```bash
# 在根目录运行
bun run sync-env
```

这会自动生成 `services/financial-data/.env` 文件，内容如下：

```bash
# ⚠️  此文件由 scripts/sync-env.ts 自动生成
# ⚠️  请勿直接修改

# 共享配置
REDIS_URL=redis://localhost:6379

# PYTHON_前缀变量 (前缀已去除)
PORT=8000
LOG_LEVEL=INFO
CACHE_TTL_QUOTE=10
CACHE_TTL_KLINE=300
CACHE_TTL_NAV=3600
CACHE_TTL_INDICATOR=120
```

## 📝 变量说明

| 根目录变量 | 本地变量 | 说明 | 默认值 |
|-----------|---------|------|--------|
| `REDIS_URL` | `REDIS_URL` | Redis 连接地址 | `redis://localhost:6379` |
| `PYTHON_PORT` | `PORT` | 服务端口 | `8000` |
| `PYTHON_LOG_LEVEL` | `LOG_LEVEL` | 日志级别 | `INFO` |
| `PYTHON_CACHE_TTL_QUOTE` | `CACHE_TTL_QUOTE` | 实时行情缓存时间（秒） | `10` |
| `PYTHON_CACHE_TTL_KLINE` | `CACHE_TTL_KLINE` | K线数据缓存时间（秒） | `300` |
| `PYTHON_CACHE_TTL_NAV` | `CACHE_TTL_NAV` | 基金净值缓存时间（秒） | `3600` |
| `PYTHON_CACHE_TTL_INDICATOR` | `CACHE_TTL_INDICATOR` | 技术指标缓存时间（秒） | `120` |

## 🚫 注意事项

### ❌ 不要做的事

1. **不要直接编辑** `services/financial-data/.env`
2. **不要提交** `.env` 文件到 Git
3. **不要在本地** `.env` 中添加新变量

### ✅ 应该做的事

1. **始终在根目录** `.env` 中修改配置
2. **使用 `PYTHON_*` 前缀** 添加新变量
3. **运行 `bun run sync-env`** 同步变更
4. **提交 `.env.example`** 到 Git

## 🔄 常用命令

```bash
# 同步环境变量（在根目录运行）
bun run sync-env

# 验证环境变量配置
bun run check-env

# 启动开发服务（自动同步）
bun run dev
```

## 🎯 最佳实践

### 添加新的环境变量

1. 在根目录 `.env` 添加变量（使用 `PYTHON_*` 前缀）
2. 在根目录 `.env.example` 添加示例
3. 运行 `bun run sync-env`
4. 在 `app/config.py` 中添加对应的配置项
5. 提交 `.env.example` 的变更

### 修改现有变量

1. 在根目录 `.env` 修改值
2. 运行 `bun run sync-env`
3. 重启服务

## 📚 相关文档

- [环境变量管理指南](../../.agents/reference/implementation/env-management.md)
- [项目根目录 .env.example](../../.env.example)
- [同步脚本](../../scripts/sync-env.ts)
