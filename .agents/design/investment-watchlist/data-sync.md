# 投资标的数据同步方案

## 1. 概述

本文档描述投资标的 (Asset) 数据的来源、同步策略和职责分工。

---

## 2. 数据来源

### 2.1 akshare 接口映射

| 类型 | akshare 接口 | 返回字段 | 数据量 |
|------|--------------|----------|--------|
| A股 | `stock_zh_a_spot_em` | 代码、名称、market | ~5600 |
| 指数 | `index_stock_info` | 代码、名称、market | ~5000 |
| ETF | `fund_etf_spot_em` | 代码、名称、market | ~1000 |
| LOF | `fund_lof_spot_em` | 代码、名称、market | ~600 |
| 场外基金 | `fund_name_em` | 代码、简称、拼音缩写、拼音全称、**基金类型(中文)** | ~10000 |

### 2.2 字段与数据来源

| 字段 | 来源 | 说明 |
|------|------|------|
| `symbol` | API | 标的代码 |
| `name` | API | 标的名称 |
| `market` | API | 市场 (仅场内品种: CN/HK/US) |
| `type` | 固定枚举 | STOCK/INDEX/ETF/LOF/OFUND |
| `pinyinInitial` | API 或计算 | ETF/LOF/场外基金从拼音缩写获取，A股/指数计算 |
| `pinyinFull` | API 或计算 | ETF/LOF/场外基金从拼音全称获取，A股/指数计算 |
| `exchange` | 暂不获取 | 代码推断 (6=沪, 0/3=深, 8/9=北) |
| `fundCompany` | 暂不获取 | MVP 阶段不采集 |
| `fundType` | API + 映射 | 基金类型，中文转枚举 |
| `indexType` | 暂不获取 | MVP 阶段不采集 |

### 2.3 基金类型映射

`fund_name_em` 返回中文基金类型，需映射为枚举：

| 中文值 | 枚举值 |
|--------|--------|
| 货币型 | MONEY |
| 债券型 / 定开债券 | BOND |
| 混合型 | MIXED |
| 股票型 | STOCK |
| QDII | QDII |
| 指数型 | (忽略) |
| REITs | REIT |

**说明**: MVP 阶段仅采集搜索必需字段，其他展示字段可在后续按需补充。

---

## 3. 架构分工

### 3.1 financial-data 服务 (Python)

**职责**: 调用 akshare 接口，对外提供 HTTP API

**API 列表**:
| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/v1/akshare/stock/list` | 获取 A 股列表 |
| GET | `/api/v1/akshare/index/list` | 获取指数列表 |
| GET | `/api/v1/akshare/etf/list` | 获取 ETF 列表 |
| GET | `/api/v1/akshare/lof/list` | 获取 LOF 列表 |
| GET | `/api/v1/akshare/fund/list` | 获取场外基金列表 |

**输出格式**:
```json
// A股/指数/ETF/LOF
{
  "data": [
    { "symbol": "600519", "name": "贵州茅台", "market": "CN" },
    { "symbol": "000001", "name": "上证指数", "market": "CN" }
  ]
}

// 场外基金 (无 market 字段，fundType 为枚举值)
{
  "data": [
    { "symbol": "005827", "name": "易方达蓝筹精选", "fundType": "STOCK" },
    { "symbol": "000009", "name": "华夏现金增利", "fundType": "MONEY" }
  ]
}
```

### 3.2 server 服务 (Bun/Hono)

**职责**:
1. 调用 financial-data API 获取原始数据
2. 写入 PostgreSQL Asset 表
3. 提供搜索 API

**同步任务**:
```typescript
// cron: 每日凌晨 2:00
async function syncAssets() {
  // 1. 并行获取所有数据
  const [stocks, indexes, etfs, lofs, funds] = await Promise.all([
    fetchFromFinancial('/stock'),
    fetchFromFinancial('/index'),
    fetchFromFinancial('/etf'),
    fetchFromFinancial('/lof'),
    fetchFromFinancial('/fund'),
  ]);

  // 2. 统一处理 (拼音和 fundType 已在 financial-data 中处理)
  const assets = [
    ...parseStocks(stocks, 'STOCK'),
    ...parseIndexes(indexes, 'INDEX'),
    ...parseEtfs(etfs, 'ETF'),
    ...parseLofs(lofs, 'LOF'),
    ...parseFunds(funds, 'OFUND'),
  ];

  // 3. 批量写入 (upsert)
  await prisma.$transaction(
    assets.map(asset =>
      prisma.asset.upsert({
        where: { market_symbol: { market: asset.market ?? 'CN', symbol: asset.symbol } },
        update: { name: asset.name, pinyinInitial: asset.pinyinInitial, pinyinFull: asset.pinyinFull },
        create: asset,
      })
    )
  );
}
```

**搜索 API**:
直接从本地 Asset 表查询，不调用 financial-data 服务。

```typescript
app.openapi('search', async (c) => {
  const { q, type } = c.req.query();
  const results = await prisma.asset.findMany({
    where: {
      OR: [
        { symbol: { contains: q } },
        { name: { contains: q } },
        { pinyinInitial: { contains: q } },
        { pinyinFull: { contains: q } },
      ],
      ...(type && { type }),
    },
    take: 20,
  });
  return c.json(results);
});
```

---

## 4. 实施顺序

### Phase 1: financial-data API
- [ ] 实现 `/stock` 接口 (返回 symbol, name, market)
- [ ] 实现 `/index` 接口 (返回 symbol, name, market)
- [ ] 实现 `/etf` 接口 (返回 symbol, name, market)
- [ ] 实现 `/lof` 接口 (返回 symbol, name, market)
- [ ] 实现 `/fund` 接口 (返回 symbol, name, fundType，拼音缩写/全称)
- [ ] 场外基金：中文 fundType 转枚举
- [ ] 场外基金：拼音缩写转 pinyinInitial，拼音全称转 pinyinFull

### Phase 2: server 同步任务
- [ ] 创建同步脚本
- [ ] 批量写入逻辑 (upsert)
- [ ] 配置定时任务 (cron)

### Phase 3: 搜索功能
- [ ] 实现搜索 API
- [ ] 验证搜索结果准确性

---

## 5. 后续扩展

当前 MVP 已采集 fundType，后续可按需补充：

| 字段 | 数据来源 | 优先级 |
|------|----------|--------|
| `fundCompany` | `fund_etf_fund_info_em` | 低 |
| `indexType` | 关键词规则推断 | 中 |
| `exchange` | 代码前缀推断 | 高 |

扩展时，只需更新 financial-data API 和 server 同步逻辑，搜索功能无需改动。
