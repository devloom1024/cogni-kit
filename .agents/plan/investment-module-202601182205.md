# Implementation Plan: Investment Module (Revised v2)

> Created at: 2026-01-18 22:15
> Last Updated: 2026-01-20 21:49
> Feature: Investment Module (Watchlist & Market Data)

## 目标
实现投资模块的后端服务与前端界面，支持股票/ETF/基金的搜索、自选管理及详情展示。

## 架构概览

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────────────────┐
│  apps/web   │────▶│ apps/server │────▶│ services/financial-data (Python)│
│  (React)    │     │  (Node.js)  │     │                                 │
└─────────────┘     └──────┬──────┘     │  ├── /akshare/stock/*  (股票)   │
                           │            │  ├── /akshare/etf/*    (ETF)    │
                           ▼            │  ├── /akshare/fund/*   (基金)   │
                    ┌─────────────┐     │  └── /indicators/*    (指标)   │
                    │    Redis    │     └─────────────────────────────────┘
                    └─────────────┘
```

## 依赖检查
- [x] PRD 已确认 (`.agents/design/investment/prd.md`)
- [x] 标的详情规范 (`.agents/design/investment/asset-detail-spec.md`)
- [x] Schema 已更新 (`apps/server/prisma/schema.prisma`)
- [x] API 设计 v2 (`.agents/design/investment/openapi-v2.yml`)
- [x] Python API v2 (`.agents/design/investment/openapi-python-v2.yml`)

---

## Part 1: Python Data Service (按资产类型分组)

### 1.1 目录结构

```
services/financial-data/
├── app/
│   ├── main.py
│   ├── modules/
│   │   ├── akshare/
│   │   │   ├── stock/       # 股票模块
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   └── client.py
│   │   │   ├── etf/         # ETF 模块
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   └── client.py
│   │   │   └── fund/        # 场外基金模块
│   │   │       ├── router.py
│   │   │       ├── service.py
│   │   │       └── client.py
│   │   └── indicators/      # 技术指标模块
│   └── core/
```

### 1.2 股票接口 (`/akshare/stock/*`)
- [x] `GET /list` - 全量股票列表 (同步用)
- [ ] `GET /{symbol}/spot` - 实时行情
- [ ] `GET /{symbol}/profile` - 公司信息 (F10)
- [ ] `GET /{symbol}/valuation` - 估值数据
- [ ] `GET /{symbol}/financial` - 财务摘要
- [ ] `GET /{symbol}/shareholders` - 股东信息 (仅A股)
- [ ] `GET /{symbol}/fund-flow` - 资金流向 (仅A股)
- [ ] `GET /{symbol}/bid-ask` - 五档盘口 (仅A股)
- [ ] `GET /{symbol}/kline` - K线数据

### 1.3 ETF 接口 (`/akshare/etf/*`)
- [ ] `GET /list` - 全量 ETF 列表
- [ ] `GET /{symbol}/spot` - 实时行情 (含IOPV/折溢价)
- [ ] `GET /{symbol}/info` - 基金信息
- [ ] `GET /{symbol}/holdings` - 十大重仓
- [ ] `GET /{symbol}/fund-flow` - 资金流向
- [ ] `GET /{symbol}/dividend` - 分红记录
- [ ] `GET /{symbol}/kline` - K线数据

### 1.4 场外基金接口 (`/akshare/fund/*`)
- [x] `GET /list` - 全量基金列表
- [ ] `GET /{symbol}/nav` - 最新净值
- [ ] `GET /{symbol}/info` - 基金信息
- [ ] `GET /{symbol}/performance` - 收益表现
- [ ] `GET /{symbol}/holdings` - 十大重仓
- [ ] `GET /{symbol}/allocation` - 资产配置
- [ ] `GET /{symbol}/estimation` - 盘中估值
- [ ] `GET /{symbol}/nav-history` - 历史净值

### 1.5 技术指标接口 (`/indicators/*`)
- [x] `POST /calculate` - 计算技术指标
- [x] `GET /supported` - 支持的指标列表

---

## Part 2: Shared Library (Schema First)

### 2.1 Zod Schemas (`packages/shared/src/schemas/investment.ts`)

**通用**:
- [ ] `AssetTypeSchema`, `AssetMarketSchema`, `TradingStatusSchema`
- [ ] `AssetSearchResultSchema`, `AssetSearchResponseSchema`

**股票**:
- [ ] `StockQuoteSchema`, `StockProfileSchema`, `StockValuationSchema`
- [ ] `StockFinancialSchema`, `StockShareholdersSchema`
- [ ] `BidAskSchema`, `FundFlowSchema`

**ETF**:
- [ ] `EtfQuoteSchema`, `EtfInfoSchema`, `DividendHistorySchema`

**场外基金**:
- [ ] `FundNavSchema`, `FundInfoSchema`, `FundPerformanceSchema`
- [ ] `FundAllocationSchema`, `FundEstimationSchema`, `NavHistorySchema`

**通用模块**:
- [ ] `HoldingsSchema`, `HoldingItemSchema`
- [ ] `KLinePointSchema`, `KLineResponseSchema`
- [ ] `WatchlistGroupSchema`, `WatchlistItemSchema`

---

## Part 3: Main Backend (按资产类型分路由)

### 3.1 路由结构

```
apps/server/src/features/investment/
├── routes/
│   ├── stocks.ts      # /api/v1/investment/stocks/*
│   ├── etfs.ts        # /api/v1/investment/etfs/*
│   ├── funds.ts       # /api/v1/investment/funds/*
│   └── watchlist.ts   # /api/v1/investment/watchlist/*
├── services/
│   ├── stock.service.ts
│   ├── etf.service.ts
│   ├── fund.service.ts
│   └── watchlist.service.ts
├── data-provider.ts   # Python 服务调用封装
└── cache.ts           # Redis 缓存
```

### 3.2 股票路由 (`/stocks/{id}/*`)
- [ ] `GET /quote` - 实时行情
- [ ] `GET /profile` - 公司信息
- [ ] `GET /valuation` - 估值数据
- [ ] `GET /financial` - 财务摘要
- [ ] `GET /shareholders` - 股东信息
- [ ] `GET /fund-flow` - 资金流向
- [ ] `GET /bid-ask` - 五档盘口
- [ ] `GET /kline` - K线+指标

### 3.3 ETF 路由 (`/etfs/{id}/*`)
- [ ] `GET /quote` - 实时行情 (含IOPV)
- [ ] `GET /info` - 基金信息
- [ ] `GET /holdings` - 十大重仓
- [ ] `GET /fund-flow` - 资金流向
- [ ] `GET /dividend` - 分红记录
- [ ] `GET /kline` - K线+指标

### 3.4 场外基金路由 (`/funds/{id}/*`)
- [ ] `GET /nav` - 最新净值
- [ ] `GET /info` - 基金信息
- [ ] `GET /performance` - 收益表现
- [ ] `GET /holdings` - 十大重仓
- [ ] `GET /allocation` - 资产配置
- [ ] `GET /estimation` - 盘中估值
- [ ] `GET /nav-history` - 历史净值

### 3.5 自选列表路由 (`/watchlist/*`)
- [ ] `GET /groups` - 获取分组
- [ ] `POST /groups` - 创建分组
- [ ] `PATCH /groups/{id}` - 更新分组
- [ ] `DELETE /groups/{id}` - 删除分组
- [ ] `POST /items` - 添加自选
- [ ] `DELETE /items/{id}` - 移除自选
- [ ] `POST /quotes` - 批量行情

### 3.6 缓存策略
```
inv:stock:quote:{symbol}     → TTL: 5s (交易中) / 60s (休市)
inv:etf:quote:{symbol}       → TTL: 5s / 60s
inv:fund:nav:{symbol}        → TTL: 1h
inv:kline:{type}:{symbol}:{period} → TTL: 5min
```

### 3.7 Cron Job
- [ ] `apps/server/src/jobs/asset-sync.ts`
- [ ] 每日 02:00 同步股票/ETF/基金列表

---

## Part 4: Frontend (按资产类型分页面)

### 4.1 页面结构

```
apps/web/app/investment/
├── page.tsx                    # 自选列表
├── stocks/[id]/page.tsx        # 股票详情
├── etfs/[id]/page.tsx          # ETF 详情
└── funds/[id]/page.tsx         # 基金详情
```

### 4.2 可复用组件
- [ ] `KLineChart.tsx` - K线图表 (股票/ETF)
- [ ] `HoldingsTable.tsx` - 重仓股表格 (ETF/基金)
- [ ] `FundFlowPanel.tsx` - 资金流向 (股票/ETF)
- [ ] `QuoteSummary.tsx` - 行情摘要卡片

### 4.3 股票详情组件
- [ ] `StockQuoteHeader.tsx` - 头部行情
- [ ] `StockProfile.tsx` - 公司信息
- [ ] `StockValuation.tsx` - 估值面板
- [ ] `StockFinancial.tsx` - 财务数据
- [ ] `BidAskPanel.tsx` - 五档盘口 (A股)

### 4.4 ETF 详情组件
- [ ] `EtfQuoteHeader.tsx` - 头部行情 (含IOPV)
- [ ] `EtfInfo.tsx` - 基金信息

### 4.5 场外基金详情组件
- [ ] `FundNavHeader.tsx` - 净值头部
- [ ] `FundInfo.tsx` - 基金信息
- [ ] `PerformanceChart.tsx` - 收益走势
- [ ] `AllocationChart.tsx` - 配置饼图

### 4.6 Hooks (TanStack Query)
- [ ] `useStockQuote(id)`, `useStockProfile(id)`...
- [ ] `useEtfQuote(id)`, `useEtfInfo(id)`...
- [ ] `useFundNav(id)`, `useFundInfo(id)`...
- [ ] `useKLine(type, id, period, indicators)`
- [ ] `useWatchlistGroups()`, `useQuotesBatch(ids)`

---

## Part 5: Verification

- [ ] Python Service 各类型接口测试
- [ ] Node Server 路由测试
- [ ] 前端各详情页展示验证
- [ ] 完整链路: Web → Server → Python → AkShare
