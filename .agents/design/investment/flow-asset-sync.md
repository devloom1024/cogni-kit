# 资产同步流程 (Asset Sync Flow)

## 概述
系统通过定时任务 (Cron Job) 每日从 Python 微服务拉取最新的股票、基金列表，并持久化到数据库中。

## 参与组件
1.  **Cron Scheduler**: Node.js 定时任务
2.  **InvestmentService**: 编排同步逻辑
3.  **DataProvider**: HTTP 客户端
4.  **Python Service**: 模块化数据服务
5.  **PostgreSQL**: 存储

## 流程图

```mermaid
sequenceDiagram
    participant Cron as Cron Scheduler
    participant Svc as InvestmentService
    participant DP as DataProvider
    participant Py as Python Service
    participant DB as Database

    Note over Cron: 每日 02:00 AM 触发

    Cron->>Svc: syncAllAssets()
    activate Svc

    %% 1. 同步股票列表
    Svc->>DP: fetchStockList()
    DP->>Py: GET /akshare/stock/list
    Py-->>DP: [{symbol, name, market}...]
    DP-->>Svc: StockInfo[]
    
    Svc->>Svc: 生成拼音首字母
    
    loop Batch Upsert
        Svc->>DB: Upsert Assets
    end

    %% 2. 同步基金列表
    Svc->>DP: fetchFundList()
    DP->>Py: GET /akshare/fund/list
    Py-->>DP: FundInfo[]
    DP-->>Svc: FundInfo[]

    loop Batch Upsert
        Svc->>DB: Upsert Assets
    end

    %% 3. 同步重仓股
    Svc->>DB: getActiveAssetIds()
    DB-->>Svc: Asset IDs
    
    loop For each Asset
        Svc->>DP: fetchHoldings(symbol)
        DP->>Py: GET /akshare/fund/{symbol}/holdings
        Py-->>DP: Holdings[]
        Svc->>DB: Replace AssetHoldings
        Note over Svc: Sleep 100ms
    end

    Svc->>DB: Update lastSyncedAt
    Svc-->>Cron: Done
    deactivate Svc
```

## 关键逻辑

1.  **Upsert**: `market + symbol` 唯一键
2.  **拼音首字母**: 同步时生成 `pinyinInitial`
3.  **流量控制**: 每次请求间隔 100ms
4.  **同步时间**: 更新 `lastSyncedAt`
