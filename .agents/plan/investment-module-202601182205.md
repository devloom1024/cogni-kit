# Implementation Plan: Investment Module (Revised)

> Created at: 2026-01-18 22:15
> Feature: Investment Module (Watchlist & Market Data)

## 目标
实现投资模块的后端服务与前端界面，支持股票/基金的搜索、自选管理及详情展示。
**核心架构变更**: 新增 Python 微服务 (`apps/financial-data`) 封装 AkShare 功能，主后端 (`apps/server`) 通过 HTTP 调用。

## 依赖检查
- [x] PRD 已确认 (`.agents/design/investment/prd.md`)
- [x] Schema 已更新 (`apps/server/prisma/schema.prisma`)
- [x] API 原型已定义 (`.agents/design/investment/openapi.yml`)

---

## Part 1: Python Data Service (New)

### 1. Initialize Python Service
- [ ] 创建目录 `services/financial-data`.
- [ ] 初始化 Python 环境 (使用 `uv` 或 `venv`).
- [ ] 创建 `requirements.txt`: 添加 `akshare`, `fastapi`, `uvicorn`.

### 2. Implement Data Wrappers
- [ ] 创建 `services/financial-data/main.py` (FastAPI 入口).
- [ ] 根据 `services/financial-data/openapi-python.yml` 实现 HTTP 接口:
    - `GET /stock/search?q={query}` (调用 ak.stock_info_a_code_name).
    - `GET /stock/{symbol}/spot` (调用 ak.stock_bid_ask_em 或类似实时接口).
    - `GET /stock/{symbol}/kline?period={period}`.
    - `GET /fund/...` (同理, 基金/ETF 接口).
    - `GET /fund/{symbol}/holdings` (十大重仓).

### 3. Run & Test
- [ ] 编写简单的启动脚本 `start.sh` 或集成到 `package.json` (可选).
- [ ] 验证 FastAPI 接口能否成功返回 AkShare 数据.

---

## Part 2: Shared Library (Schema First)

### 1. Define Zod Schemas
- [ ] **依据 `.agents/design/investment/openapi.yml` 作为设计蓝本**。
- [ ] 创建 `packages/shared/src/schemas/investment.ts`.
    - 定义 Models: `AssetSchema`, `AssetHoldingSchema`, `RealtimeQuoteSchema`, `KLinePointSchema`.
    - 定义 Request/Response: `AssetSearchResponseSchema` (aka `AssetSearchResultSchema`).
    - 定义 Watchlist: `WatchlistGroupSchema`, `WatchlistItemSchema`.
    - 导出 TypeScript 类型 (`z.infer`): `Asset`, `RealtimeQuote`, `WatchlistGroup` 等.
- [ ] 确保导出别名以保持风格一致 (e.g., `export const AssetSearchResultSchema = assetSearchResultSchema`).

---

## Part 3: Main Backend (apps/server)

### 1. Database Migration
- [ ] 运行 `bun run db:migrate` 应用 Schema 变更。

### 2. Infrastructure (Service Integration)
- [ ] 创建 `apps/server/src/features/investment/constants.ts` (配置 Python Service URL).
- [ ] 创建 `apps/server/src/features/investment/utils/data-provider.ts`.
    - 封装对 `services/financial-data` 的 HTTP 调用。
    - 实现错误处理与超时重试。

### 3. Service Layer (Business Logic)
- [ ] 创建 `apps/server/src/features/investment/service.ts`.
    - `getQuote(assetId)`: **Redis Cache Layer** -> `data-provider` -> Redis.
    - `syncAssetsCommand()`: 供 Cron Job 调用，从 data-provider 拉取全量列表更新 DB.

### 4. Controller & Routes (Hono + OpenAPI)
- [ ] 创建 `apps/server/src/features/investment/routes.ts`.
    - **完全使用 Shared Schemas** 定义路由。
    - 实现具体的 API 处理函数。

---

## Part 4: Frontend (apps/web)

### 1. Components (UI)
- [ ] **Data Fetching**:
    - **严格遵循**: 使用 `TanStack Query` (useQuery) 获取数据。
    - 自选列表: `useQuery({ queryKey: ['watchlist'], refetchInterval: 5000 })`.
- [ ] **Charts**:
    - [ ] `KLineChart.tsx` (Recharts).
- [ ] **Watchlist UI**:
    - [ ] `WatchlistSidebar.tsx` (折叠/分组).
    - [ ] 状态管理: 使用 Zustand 仅管理 `sidebarOpen`, `layoutMode` (Grid/List).

### 2. Pages
- [ ] `apps/web/src/pages/investment/InvestmentPage.tsx`.

---

## Part 5: Verification

### 1. Integration Testing
- [ ] 启动 Python Service (`:8000`).
- [ ] 启动 Main Server (`:3001`).
- [ ] 启动 Web (`:3000`).
- [ ] 测试完整链路: Web -> Server -> Redis/Python -> AkShare.
