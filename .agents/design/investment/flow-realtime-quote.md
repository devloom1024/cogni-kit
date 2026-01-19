# 实时行情流程 (Realtime Quote Flow)

## 概述
前端轮询后端获取行情数据，后端采用 Redis 缓存 + Python 服务的多级架构。

## 参与组件
1.  **Web Client**: TanStack Query (Polling)
2.  **InvestmentController**: HTTP 入口
3.  **InvestmentService**: 缓存逻辑
4.  **Redis**: 缓存层
5.  **Python Service**: 数据源

## 单个行情查询

```mermaid
sequenceDiagram
    participant Web as Web Client
    participant Ctrl as Controller
    participant Svc as InvestmentService
    participant Redis as Redis
    participant Py as Python Service

    Web->>Ctrl: GET /assets/{id}/quote
    Ctrl->>Svc: getQuote(id)
    activate Svc
    
    Svc->>Redis: GET inv:quote:{market}:{symbol}
    
    alt Cache Hit
        Redis-->>Svc: Quote
    else Cache Miss
        Svc->>Py: GET /akshare/stock/{symbol}/spot
        Py-->>Svc: RealtimeQuote
        Svc->>Redis: SETEX (TTL: 5-10s)
    end
    
    Svc-->>Ctrl: RealtimeQuote
    deactivate Svc
    Ctrl-->>Web: 200 OK
```

## 批量行情查询

```mermaid
sequenceDiagram
    participant Web as Web Client
    participant Svc as InvestmentService
    participant Redis as Redis
    participant Py as Python Service

    Web->>Svc: POST /assets/quotes/batch
    
    Svc->>Redis: MGET [keys...]
    Redis-->>Svc: [hit, null, hit...]
    
    alt 有未命中
        loop 并行请求
            Svc->>Py: GET /akshare/stock/{symbol}/spot
        end
        Svc->>Redis: MSET + EXPIRE
    end
    
    Svc-->>Web: {id: Quote, ...}
```

## K 线 + 指标查询

```mermaid
sequenceDiagram
    participant Web as Web Client
    participant Svc as InvestmentService
    participant Redis as Redis
    participant Py as Python Service

    Web->>Svc: GET /assets/{id}/kline?indicators=ma(5),macd(12,26,9)
    
    %% 1. 获取 K 线
    Svc->>Redis: GET inv:kline:{market}:{symbol}:{period}
    alt Cache Hit
        Redis-->>Svc: KLineData
    else Cache Miss
        Svc->>Py: GET /akshare/stock/{symbol}/kline
        Py-->>Svc: KLinePoint[]
        Svc->>Redis: SETEX (TTL: 5-10min)
    end
    
    %% 2. 计算指标
    Svc->>Py: POST /indicators/calculate
    Note over Py: {data: [...], indicators: ["ma(5)", "macd(12,26,9)"]}
    Py-->>Svc: {ma(5): [...], macd: {...}}
    
    Svc-->>Web: {data: [...], indicators: {...}}
```

## Redis Key 规范

| 类型 | Key | TTL |
|:-----|:----|:----|
| 行情 | `inv:quote:{market}:{symbol}` | 5-10s / 60s |
| K线 | `inv:kline:{market}:{symbol}:{period}` | 5-10min |
| 净值 | `inv:nav:{symbol}` | 1h |
