# 产品需求文档 (PRD) - 投资自选功能

## 1. 项目概述

### 1.1 产品名称
投资自选功能 (Investment Watchlist)

### 1.2 功能概述
为用户提供投资标的的自选管理功能，支持通过代码、名称、拼音搜索标的，并将标的添加到自定义分组中进行管理。

### 1.3 支持的标的类型
| 类型 | 代码示例 | 说明 |
|------|----------|------|
| A股 | 600519 | 上海/深圳交易所上市股票 |
| 指数 | 000001 | 上证指数、深证成指、行业指数等 |
| ETF | 510500 | 交易型开放式指数基金 |
| LOF | 161039 | 上市型开放式基金 |
| 场外基金 | 005827 | 银行/券商/第三方平台代销基金 |

---

## 2. 用户故事

### 2.1 搜索标的
**作为** 投资者，**我希望** 通过代码或名称搜索投资标的，**以便** 快速找到想要添加的自选。

**验收标准：**
- 支持按代码搜索（如 "600519"）
- 支持按名称搜索（如 "贵州茅台"）
- 支持按拼音首字母搜索（如 "ZGMT"）
- 支持按拼音全拼搜索（如 "guizhoumaotai"）
- 支持按基金公司搜索（如 "易方达"）
- 搜索结果显示标的的关键信息（代码、名称、类型、交易所/基金公司）

### 2.2 添加到自选
**作为** 投资者，**我希望** 将搜索到的标的添加到自选列表，**以便** 跟踪关注的投资标的。

**验收标准：**
- 可以选择将标的添加到指定分组
- 如果没有分组，引导用户创建分组
- 同一标的在同一分组中只能添加一次
- 添加成功后显示确认提示

### 2.3 自选分组管理
**作为** 投资者，**我希望** 创建多个自选分组，**以便** 按策略/主题分类管理自选标的。

**验收标准：**
- 支持创建自定义分组（如 "白酒板块"、"科技成长"、"长期定投"）
- 支持重命名分组
- 支持删除分组（删除时提示是否同时删除组内标的）
- 支持拖拽排序分组
- 显示每个分组的标的数量

### 2.4 查看自选列表
**作为** 投资者，**我希望** 查看我的自选列表，**以便** 了解我关注的所有标的。

**验收标准：**
- 显示所有自选分组
- 分组内显示标的列表
- 每个标的显示关键信息：
  - 代码、名称
  - 类型标签（A股/指数/ETF/LOF/场外基金）
  - 交易所/基金公司
  - 加入时间
- 支持拖拽排序标的
- 支持删除自选标的
- 切换分组时加载对应标的

---

## 3. 功能详细设计

### 3.1 标的搜索结果展示

| 字段 | A股 | 指数 | ETF | LOF | 场外基金 |
|------|-----|------|-----|-----|----------|
| 代码 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 名称 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 类型标签 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 交易所 | ✅ (沪/深/北) | ✅ | ✅ | ✅ | - |
| 基金公司 | - | - | ✅ | ✅ | ✅ |
| 指数类型 | - | ✅ (大盘/行业/主题/策略) | - | - | - |
| 基金类型 | - | - | - | - | ✅ (货/债/混/股/QDII/REITs) |

### 3.2 分组管理

#### 3.2.1 分组数据结构
```typescript
interface WatchlistGroup {
  id: string           // 分组 ID
  name: string         // 分组名称
  sortOrder: number    // 排序权重
  itemCount: number    // 标的数量 (计算字段)
  createdAt: string    // 创建时间
  updatedAt: string    // 更新时间
}
```

#### 3.2.2 默认分组
- 用户首次使用时，引导创建第一个分组
- 不提供默认分组，强制用户命名

### 3.3 自选列表展示

#### 3.3.1 标的详情
```typescript
interface WatchlistItem {
  id: string           // 记录 ID
  addedAt: string      // 加入时间
  asset: {
    id: string         // 资产 ID
    symbol: string     // 标的代码
    name: string       // 标的名称
    type: AssetType    // 类型
    market: Market     // 市场
    exchange?: Exchange // 交易所 (A/指数/ETF/LOF)
    fundCompany?: string // 基金公司 (ETF/LOF/场外)
    fundType?: FundType // 基金类型 (场外)
    indexType?: IndexType // 指数类型 (指数)
  }
}
```

---

## 4. 数据库设计

### 4.1 Asset (资产基础信息表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 UUID |
| symbol | String | 标的代码 (唯一) |
| name | String | 标的名称 |
| type | AssetType | 资产类型 |
| market | AssetMarket | 市场 |
| exchange | Exchange? | 交易所 |
| indexType | IndexType? | 指数类型 |
| fundCompany | String? | 基金公司 |
| fundType | FundType? | 场外基金类型 |
| pinyinInitial | String? | 拼音首字母 |
| pinyinFull | String? | 完整拼音 |

### 4.2 WatchlistGroup (自选分组表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 UUID |
| userId | String | 所属用户 |
| name | String | 分组名称 |
| sortOrder | Int | 排序权重 |

### 4.3 WatchlistItem (自选明细表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键 UUID |
| groupId | String | 分组 ID |
| assetId | String | 资产 ID |

---

## 5. 数据来源与同步

详见: [数据同步方案](./data-sync.md)

### 5.1 数据来源

| 类型 | akshare 接口 | API 路径 | MVP 采集字段 |
|------|--------------|----------|--------------|
| A股 | `stock_zh_a_spot_em` | `/api/v1/akshare/stock/list` | symbol, name, market |
| 指数 | `index_stock_info` | `/api/v1/akshare/index/list` | symbol, name, market |
| ETF | `fund_etf_spot_em` | `/api/v1/akshare/etf/list` | symbol, name, market |
| LOF | `fund_lof_spot_em` | `/api/v1/akshare/lof/list` | symbol, name, market |
| 场外基金 | `fund_name_em` | `/api/v1/akshare/fund/list` | symbol, name, fundType |

**说明**:
- 场内品种 (A股/指数/ETF/LOF) 包含 `market` 字段
- 场外基金无 `market` 字段 (无交易所概念)

### 5.2 职责分工

- **financial-data (Python)**: 调用 akshare 接口，对外提供 HTTP API
- **server (Bun)**: 调用 financial-data API，计算拼音，写入数据库，提供搜索 API

### 5.3 同步策略

- 每日凌晨 2:00 全量同步
- 标的按添加时间逆序排列

---

## 6. 非功能性需求

### 6.1 性能
- 标的搜索响应时间 < 200ms
- 自选列表加载时间 < 500ms

### 6.2 扩展性
- 未来可扩展支持港股、美股等更多市场
- 未来可扩展支持组合模拟、收益率计算等功能

### 6.3 数据安全
- 用户只能访问自己的自选数据
- 添加标的时校验标的是否存在

---

## 7. 里程碑

### Phase 1: 基础功能
- [ ] 标的搜索 (代码、名称、拼音)
- [ ] 添加到自选
- [ ] 自选列表展示

### Phase 2: 分组管理
- [ ] 创建/重命名/删除分组
- [ ] 分组排序
- [ ] 标的拖拽排序

### Phase 3: 体验优化
- [ ] 批量添加
- [ ] 导入/导出自选
- [ ] 自选同步 (跨设备)
