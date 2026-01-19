# Implementation Plan: Investment Module (Revised)

> Created at: 2026-01-18 22:15
> Last Updated: 2026-01-19 11:45
> Feature: Investment Module (Watchlist & Market Data)

## 目标
实现投资模块的后端服务与前端界面，支持股票/基金的搜索、自选管理及详情展示。

## 架构概览

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────────────────┐
│  apps/web   │────▶│ apps/server │────▶│ services/financial-data (Python)│
│  (React)    │     │  (Node.js)  │     │                                 │
└─────────────┘     └──────┬──────┘     │  ├── /akshare/*   (行情数据)    │
                           │            │  ├── /indicators/* (技术指标)   │
                           ▼            │  └── /quant/*      (未来)       │
                    ┌─────────────┐     └─────────────────────────────────┘
                    │    Redis    │
                    └─────────────┘
```

## 依赖检查
- [x] PRD 已确认 (`.agents/design/investment/prd.md`)
- [x] Schema 已更新 (`apps/server/prisma/schema.prisma`)
- [x] API 设计已定义 (`.agents/design/investment/openapi.yml`)
- [x] Python API 已定义 (`services/financial-data/openapi-python.yml`)

---

## Part 1: Python Data Service (模块化架构)

### 1.1 目录结构

```
services/financial-data/
├── pyproject.toml
├── Dockerfile
├── start.sh
│
├── app/
│   ├── main.py              # FastAPI 入口
│   ├── config.py            # 配置管理
│   ├── deps.py              # 依赖注入
│   │
│   ├── core/                # 核心通用
│   │   ├── cache.py         # Redis 缓存
│   │   ├── exceptions.py    # 自定义异常
│   │   └── schemas.py       # 通用模型
│   │
│   ├── modules/             # 功能模块
│   │   ├── akshare/         # 行情数据模块
│   │   │   ├── router.py    # /akshare/* 路由
│   │   │   ├── service.py   # 业务逻辑
│   │   │   └── client.py    # AkShare API 封装
│   │   │
│   │   └── talib/           # 技术指标模块
│   │       ├── router.py    # /indicators/* 路由
│   │       ├── service.py   # 指标计算
│   │       └── calculator.py
│   │
│   └── utils/
│       └── pinyin.py
```

### 1.2 初始化
- [x] 创建目录结构
- [x] 使用 `uv init` 初始化
- [x] 配置依赖: `akshare`, `fastapi`, `uvicorn`, `pandas-ta`, `redis`

### 1.3 AkShare 模块实现
- [x] `GET /akshare/stock/list` - 全量股票列表
- [x] `GET /akshare/stock/search` - 搜索股票
- [x] `GET /akshare/stock/{symbol}/spot` - 实时行情
- [x] `GET /akshare/stock/{symbol}/kline` - K 线数据 (纯 OHLCV)
- [x] `GET /akshare/fund/list` - 全量基金列表
- [x] `GET /akshare/fund/{symbol}/nav` - 场外基金净值
- [x] `GET /akshare/fund/{symbol}/holdings` - 十大重仓

### 1.4 技术指标模块实现
- [x] `POST /indicators/calculate` - 计算技术指标
- [x] `GET /indicators/supported` - 获取支持的指标列表
- [x] MVP 指标: `ma(n)`, `ema(n)`, `macd(fast,slow,signal)`
- [x] 二期指标: `rsi(n)`, `boll(n,std)`, `kdj(n,m1,m2)`

### 1.5 缓存实现
- [x] Redis 连接封装
- [x] K 线数据缓存 (TTL: 5-10min)
- [x] 指标计算结果缓存 (TTL: 1-2min)

---

## Part 2: Shared Library (Schema First)

### 2.1 Define Zod Schemas
创建 `packages/shared/src/schemas/investment.ts`:
- [ ] `AssetSchema`, `AssetSearchResultSchema`
- [ ] `RealtimeQuoteSchema` (含 tradingStatus)
- [ ] `KLinePointSchema`, `KLineResponseSchema`
- [ ] `IndicatorRequestSchema`, `IndicatorResponseSchema`
- [ ] `WatchlistGroupSchema`, `WatchlistItemSchema`

---

## Part 3: Main Backend (apps/server)

### 3.1 Database Migration
- [ ] 运行 `bun run db:migrate` (pinyinInitial, lastSyncedAt)

### 3.2 Redis Cache Layer
Key 规范:
```
inv:quote:{market}:{symbol}     → TTL: 5-10s / 60s
inv:kline:{market}:{symbol}:{period}  → TTL: 5-10 min
inv:nav:{symbol}                → TTL: 1 hour
```
- [ ] 创建 `apps/server/src/features/investment/cache.ts`

### 3.3 Data Provider
- [ ] 创建 `data-provider.ts` 封装 Python 服务调用
- [ ] AkShare 模块调用 (`/akshare/*`)
- [ ] 指标计算调用 (`POST /indicators/calculate`)

### 3.4 Service Layer
- [ ] `getQuote(assetId)`: 单个行情
- [ ] `getQuotesBatch(assetIds)`: 批量行情
- [ ] `getKLine(assetId, period)`: K 线原始数据
- [ ] `getKLineWithIndicators(assetId, period, indicators)`: K 线 + 指标 (组合调用)
- [ ] `syncAllAssets()`: Cron Job 数据同步

### 3.5 Controller & Routes
- [ ] 使用 `OpenAPIHono` + Shared Schemas
- [ ] 实现所有 API 端点

### 3.6 Cron Job
- [ ] 创建 `apps/server/src/jobs/asset-sync.ts`
- [ ] 每日 02:00 执行同步
- [ ] 拼音首字母生成 (`pinyin-pro`)

---

## Part 4: Frontend (apps/web)

### 4.1 API Client
- [ ] `apps/web/src/features/investment/api.ts`

### 4.2 Components
- [ ] `useWatchlistGroups()` - TanStack Query
- [ ] `useQuotesBatch(ids)` - refetchInterval: 5000
- [ ] `useKLine(id, period, indicators)`
- [ ] `KLineChart.tsx` - K 线图表

### 4.3 Pages
- [ ] `app/investment/page.tsx` - 自选列表
- [ ] `app/investment/[id]/page.tsx` - 详情页

---

## Part 5: Verification

- [ ] 启动 Python Service (`:8000`)
- [ ] 启动 Main Server (`:3001`)
- [ ] 启动 Web (`:3000`)
- [ ] 完整链路测试
