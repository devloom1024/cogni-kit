# 标的详情信息显示规范

本文档定义了不同类型标的（A股、港股、美股、ETF、场外基金）在详情页应显示的信息字段，区分必须显示（🔴）和可选显示（🔵）的信息，并标注数据来源的 AkShare 方法。

---

## 1. A 股 (CN Stock)

### 1.1 头部行情信息

| 优先级 | 字段名称 | 数据类型 | AkShare 方法           | 说明                     |
| :----: | -------- | -------- | ---------------------- | ------------------------ |
|   🔴    | 股票代码 | string   | `stock_zh_a_spot_em()` | 如 "600519"              |
|   🔴    | 股票名称 | string   | `stock_zh_a_spot_em()` | 如 "贵州茅台"            |
|   🔴    | 最新价   | number   | `stock_zh_a_spot_em()` | -                        |
|   🔴    | 涨跌额   | number   | `stock_zh_a_spot_em()` | -                        |
|   🔴    | 涨跌幅   | number   | `stock_zh_a_spot_em()` | 单位: %                  |
|   🔴    | 交易状态 | string   | 需推断                 | TRADING/CLOSED/SUSPENDED |
|   🔵    | 更新时间 | datetime | `stock_zh_a_spot_em()` | -                        |

### 1.2 核心行情数据

| 优先级 | 字段名称  | 数据类型 | AkShare 方法           | 说明     |
| :----: | --------- | -------- | ---------------------- | -------- |
|   🔴    | 今开      | number   | `stock_zh_a_spot_em()` | -        |
|   🔴    | 昨收      | number   | `stock_zh_a_spot_em()` | -        |
|   🔴    | 最高      | number   | `stock_zh_a_spot_em()` | -        |
|   🔴    | 最低      | number   | `stock_zh_a_spot_em()` | -        |
|   🔴    | 成交量    | number   | `stock_zh_a_spot_em()` | 单位: 手 |
|   🔴    | 成交额    | number   | `stock_zh_a_spot_em()` | 单位: 元 |
|   🔴    | 换手率    | number   | `stock_zh_a_spot_em()` | 单位: %  |
|   🔵    | 振幅      | number   | `stock_zh_a_spot_em()` | 单位: %  |
|   🔵    | 量比      | number   | `stock_zh_a_spot_em()` | -        |
|   🔵    | 涨速      | number   | `stock_zh_a_spot_em()` | -        |
|   🔵    | 5分钟涨跌 | number   | `stock_zh_a_spot_em()` | 单位: %  |

### 1.3 估值数据

| 优先级 | 字段名称       | 数据类型 | AkShare 方法           | 说明     |
| :----: | -------------- | -------- | ---------------------- | -------- |
|   🔴    | 总市值         | number   | `stock_zh_a_spot_em()` | 单位: 元 |
|   🔴    | 流通市值       | number   | `stock_zh_a_spot_em()` | 单位: 元 |
|   🔴    | 市盈率(TTM)    | number   | `stock_zh_a_spot_em()` | -        |
|   🔴    | 市净率         | number   | `stock_zh_a_spot_em()` | -        |
|   🔵    | 60日涨跌幅     | number   | `stock_zh_a_spot_em()` | 单位: %  |
|   🔵    | 年初至今涨跌幅 | number   | `stock_zh_a_spot_em()` | 单位: %  |

### 1.4 五档盘口 (可选模块)

| 优先级 | 字段名称       | 数据类型 | AkShare 方法         | 说明    |
| :----: | -------------- | -------- | -------------------- | ------- |
|   🔵    | 买1-5价格/数量 | array    | `stock_bid_ask_em()` | 5档买盘 |
|   🔵    | 卖1-5价格/数量 | array    | `stock_bid_ask_em()` | 5档卖盘 |
|   🔵    | 涨停价         | number   | `stock_bid_ask_em()` | -       |
|   🔵    | 跌停价         | number   | `stock_bid_ask_em()` | -       |
|   🔵    | 外盘           | number   | `stock_bid_ask_em()` | -       |
|   🔵    | 内盘           | number   | `stock_bid_ask_em()` | -       |

### 1.5 公司基本信息 (F10)

| 优先级 | 字段名称   | 数据类型 | AkShare 方法                       | 说明       |
| :----: | ---------- | -------- | ---------------------------------- | ---------- |
|   🔴    | 所属行业   | string   | `stock_individual_info_em()`       | -          |
|   🔴    | 上市时间   | date     | `stock_individual_info_em()`       | -          |
|   🔴    | 总股本     | number   | `stock_individual_info_em()`       | -          |
|   🔴    | 流通股     | number   | `stock_individual_info_em()`       | -          |
|   🔵    | 主营业务   | string   | `stock_individual_basic_info_xq()` | 雪球       |
|   🔵    | 公司全称   | string   | `stock_individual_basic_info_xq()` | -          |
|   🔵    | 公司英文名 | string   | `stock_individual_basic_info_xq()` | -          |
|   🔵    | 经营范围   | string   | `stock_individual_basic_info_xq()` | -          |
|   🔵    | 法人代表   | string   | `stock_individual_basic_info_xq()` | -          |
|   🔵    | 董秘       | string   | `stock_individual_basic_info_xq()` | -          |
|   🔵    | 注册资本   | number   | `stock_individual_basic_info_xq()` | 单位: 元   |
|   🔵    | 员工人数   | number   | `stock_individual_basic_info_xq()` | -          |
|   🔵    | 注册地址   | string   | `stock_individual_basic_info_xq()` | -          |
|   🔵    | 办公地址   | string   | `stock_individual_basic_info_xq()` | -          |
|   🔵    | 公司官网   | string   | `stock_individual_basic_info_xq()` | -          |
|   🔵    | 联系电话   | string   | `stock_individual_basic_info_xq()` | -          |
|   🔵    | 联系邮箱   | string   | `stock_individual_basic_info_xq()` | -          |
|   🔵    | 实际控制人 | string   | `stock_individual_basic_info_xq()` | -          |
|   🔵    | 企业类型   | string   | `stock_individual_basic_info_xq()` | 如民营企业 |

### 1.6 财务数据 (可选模块)

| 优先级 | 字段名称     | 数据类型 | AkShare 方法                 | 说明 |
| :----: | ------------ | -------- | ---------------------------- | ---- |
|   🔵    | 营业收入     | number   | `stock_financial_abstract()` | -    |
|   🔵    | 净利润       | number   | `stock_financial_abstract()` | -    |
|   🔵    | 每股收益     | number   | `stock_financial_abstract()` | -    |
|   🔵    | 每股净资产   | number   | `stock_financial_abstract()` | -    |
|   🔵    | 净资产收益率 | number   | `stock_financial_abstract()` | ROE  |
|   🔵    | 毛利率       | number   | `stock_financial_abstract()` | -    |
|   🔵    | 资产负债率   | number   | `stock_financial_abstract()` | -    |

### 1.7 股东信息 (可选模块)

| 优先级 | 字段名称     | 数据类型 | AkShare 方法                  | 说明 |
| :----: | ------------ | -------- | ----------------------------- | ---- |
|   🔵    | 十大股东     | array    | `stock_gdfx_top_10_em()`      | -    |
|   🔵    | 十大流通股东 | array    | `stock_gdfx_free_top_10_em()` | -    |
|   🔵    | 股东人数     | number   | `stock_zh_a_gdhs()`           | -    |
|   🔵    | 基金持股比例 | number   | `stock_fund_stock_holder()`   | -    |

### 1.8 资金流向 (可选模块)

| 优先级 | 字段名称     | 数据类型 | AkShare 方法                   | 说明 |
| :----: | ------------ | -------- | ------------------------------ | ---- |
|   🔵    | 主力净流入   | number   | `stock_individual_fund_flow()` | -    |
|   🔵    | 超大单净流入 | number   | `stock_individual_fund_flow()` | -    |
|   🔵    | 大单净流入   | number   | `stock_individual_fund_flow()` | -    |
|   🔵    | 中单净流入   | number   | `stock_individual_fund_flow()` | -    |
|   🔵    | 小单净流入   | number   | `stock_individual_fund_flow()` | -    |

---

## 2. 港股 (HK Stock)

### 2.1 头部行情信息

| 优先级 | 字段名称 | 数据类型 | AkShare 方法         | 说明                     |
| :----: | -------- | -------- | -------------------- | ------------------------ |
|   🔴    | 股票代码 | string   | `stock_hk_spot_em()` | 如 "00700"               |
|   🔴    | 股票名称 | string   | `stock_hk_spot_em()` | 如 "腾讯控股"            |
|   🔴    | 最新价   | number   | `stock_hk_spot_em()` | 单位: 港元               |
|   🔴    | 涨跌额   | number   | `stock_hk_spot_em()` | 单位: 港元               |
|   🔴    | 涨跌幅   | number   | `stock_hk_spot_em()` | 单位: %                  |
|   🔴    | 交易状态 | string   | 需推断               | TRADING/CLOSED/SUSPENDED |
|   🔵    | 更新时间 | datetime | `stock_hk_spot_em()` | 15分钟延迟               |

### 2.2 核心行情数据

| 优先级 | 字段名称 | 数据类型 | AkShare 方法         | 说明       |
| :----: | -------- | -------- | -------------------- | ---------- |
|   🔴    | 今开     | number   | `stock_hk_spot_em()` | 单位: 港元 |
|   🔴    | 昨收     | number   | `stock_hk_spot_em()` | 单位: 港元 |
|   🔴    | 最高     | number   | `stock_hk_spot_em()` | 单位: 港元 |
|   🔴    | 最低     | number   | `stock_hk_spot_em()` | 单位: 港元 |
|   🔴    | 成交量   | number   | `stock_hk_spot_em()` | 单位: 股   |
|   🔴    | 成交额   | number   | `stock_hk_spot_em()` | 单位: 港元 |

> ⚠️ **注意**: 港股实时行情接口不提供换手率、市盈率等数据，需要从其他接口获取

### 2.3 估值数据

| 优先级 | 字段名称 | 数据类型 | AkShare 方法                 | 说明       |
| :----: | -------- | -------- | ---------------------------- | ---------- |
|   🔴    | 总市值   | number   | `stock_hk_indicator_eniu()`  | 亿牛网     |
|   🔴    | 市盈率   | number   | `stock_hk_indicator_eniu()`  | -          |
|   🔴    | 市净率   | number   | `stock_hk_indicator_eniu()`  | -          |
|   🔵    | 股息率   | number   | `stock_hk_indicator_eniu()`  | 单位: %    |
|   🔵    | 估值数据 | object   | `stock_hk_valuation_baidu()` | 百度股市通 |

### 2.4 公司基本信息

| 优先级 | 字段名称   | 数据类型 | AkShare 方法                          | 说明 |
| :----: | ---------- | -------- | ------------------------------------- | ---- |
|   🔴    | 公司中文名 | string   | `stock_individual_basic_info_hk_xq()` | 雪球 |
|   🔵    | 公司英文名 | string   | `stock_individual_basic_info_hk_xq()` | -    |
|   🔵    | 主营业务   | string   | `stock_individual_basic_info_hk_xq()` | -    |
|   🔵    | 经营范围   | string   | `stock_individual_basic_info_hk_xq()` | -    |
|   🔵    | 员工人数   | number   | `stock_individual_basic_info_hk_xq()` | -    |
|   🔵    | 联系电话   | string   | `stock_individual_basic_info_hk_xq()` | -    |
|   🔵    | 公司官网   | string   | `stock_individual_basic_info_hk_xq()` | -    |
|   🔵    | 注册地址   | string   | `stock_individual_basic_info_hk_xq()` | -    |
|   🔵    | 办公地址   | string   | `stock_individual_basic_info_hk_xq()` | -    |
|   🔵    | 主要股东   | string   | `stock_individual_basic_info_hk_xq()` | -    |

### 2.5 财务数据 (可选模块)

| 优先级 | 字段名称     | 数据类型 | AkShare 方法                                 | 说明 |
| :----: | ------------ | -------- | -------------------------------------------- | ---- |
|   🔵    | 三大财务报表 | object   | `stock_financial_hk_report_em()`             | 东财 |
|   🔵    | 主要指标     | object   | `stock_financial_hk_analysis_indicator_em()` | -    |

### 2.6 行业对比 (可选模块)

| 优先级 | 字段名称   | 数据类型 | AkShare 方法                         | 说明 |
| :----: | ---------- | -------- | ------------------------------------ | ---- |
|   🔵    | 成长性对比 | object   | `stock_hk_growth_comparison_em()`    | -    |
|   🔵    | 估值对比   | object   | `stock_hk_valuation_comparison_em()` | -    |
|   🔵    | 规模对比   | object   | `stock_hk_scale_comparison_em()`     | -    |

### 2.7 其他信息

| 优先级 | 字段名称 | 数据类型 | AkShare 方法                        | 说明 |
| :----: | -------- | -------- | ----------------------------------- | ---- |
|   🔵    | 证券资料 | object   | `stock_hk_security_profile_em()`    | -    |
|   🔵    | 最新指标 | object   | `stock_hk_financial_indicator_em()` | -    |
|   🔵    | 分红派息 | array    | `stock_hk_dividend_payout_em()`     | -    |
|   🔵    | 盈利预测 | object   | `stock_hk_profit_forecast_et()`     | -    |

---

## 3. 美股 (US Stock)

### 3.1 头部行情信息

| 优先级 | 字段名称 | 数据类型 | AkShare 方法         | 说明                     |
| :----: | -------- | -------- | -------------------- | ------------------------ |
|   🔴    | 股票代码 | string   | `stock_us_spot_em()` | 如 "105.AAPL"            |
|   🔴    | 股票名称 | string   | `stock_us_spot_em()` | 如 "苹果公司"            |
|   🔴    | 最新价   | number   | `stock_us_spot_em()` | 单位: 美元               |
|   🔴    | 涨跌额   | number   | `stock_us_spot_em()` | 单位: 美元               |
|   🔴    | 涨跌幅   | number   | `stock_us_spot_em()` | 单位: %                  |
|   🔴    | 交易状态 | string   | 需推断               | TRADING/CLOSED/SUSPENDED |
|   🔵    | 更新时间 | datetime | `stock_us_spot_em()` | -                        |

### 3.2 核心行情数据

| 优先级 | 字段名称 | 数据类型 | AkShare 方法         | 说明       |
| :----: | -------- | -------- | -------------------- | ---------- |
|   🔴    | 开盘价   | number   | `stock_us_spot_em()` | 单位: 美元 |
|   🔴    | 最高价   | number   | `stock_us_spot_em()` | 单位: 美元 |
|   🔴    | 最低价   | number   | `stock_us_spot_em()` | 单位: 美元 |
|   🔴    | 昨收价   | number   | `stock_us_spot_em()` | 单位: 美元 |
|   🔴    | 成交量   | number   | `stock_us_spot_em()` | -          |
|   🔴    | 成交额   | number   | `stock_us_spot_em()` | 单位: 美元 |
|   🔵    | 振幅     | number   | `stock_us_spot_em()` | 单位: %    |
|   🔵    | 换手率   | number   | `stock_us_spot_em()` | 单位: %    |

### 3.3 估值数据

| 优先级 | 字段名称 | 数据类型 | AkShare 方法                 | 说明       |
| :----: | -------- | -------- | ---------------------------- | ---------- |
|   🔴    | 总市值   | number   | `stock_us_spot_em()`         | 单位: 美元 |
|   🔴    | 市盈率   | number   | `stock_us_spot_em()`         | -          |
|   🔵    | 估值数据 | object   | `stock_us_valuation_baidu()` | 百度股市通 |

### 3.4 公司基本信息

| 优先级 | 字段名称   | 数据类型 | AkShare 方法                          | 说明           |
| :----: | ---------- | -------- | ------------------------------------- | -------------- |
|   🔴    | 公司中文名 | string   | `stock_individual_basic_info_us_xq()` | 雪球           |
|   🔵    | 公司英文名 | string   | `stock_individual_basic_info_us_xq()` | -              |
|   🔵    | 公司简称   | string   | `stock_individual_basic_info_us_xq()` | -              |
|   🔵    | 主营业务   | string   | `stock_individual_basic_info_us_xq()` | -              |
|   🔵    | 经营范围   | string   | `stock_individual_basic_info_us_xq()` | 公司介绍       |
|   🔵    | 员工人数   | number   | `stock_individual_basic_info_us_xq()` | -              |
|   🔵    | 联系电话   | string   | `stock_individual_basic_info_us_xq()` | -              |
|   🔵    | 公司官网   | string   | `stock_individual_basic_info_us_xq()` | -              |
|   🔵    | 注册地址   | string   | `stock_individual_basic_info_us_xq()` | -              |
|   🔵    | 办公地址   | string   | `stock_individual_basic_info_us_xq()` | -              |
|   🔵    | 上市日期   | date     | `stock_individual_basic_info_us_xq()` | -              |
|   🔵    | 交易所     | string   | `stock_individual_basic_info_us_xq()` | NASDAQ/NYSE 等 |
|   🔵    | 主要股东   | string   | `stock_individual_basic_info_us_xq()` | -              |
|   🔵    | 高管人数   | number   | `stock_individual_basic_info_us_xq()` | -              |

### 3.5 财务数据 (可选模块)

| 优先级 | 字段名称     | 数据类型 | AkShare 方法                                 | 说明 |
| :----: | ------------ | -------- | -------------------------------------------- | ---- |
|   🔵    | 三大财务报表 | object   | `stock_financial_us_report_em()`             | 东财 |
|   🔵    | 主要指标     | object   | `stock_financial_us_analysis_indicator_em()` | -    |

---

## 4. ETF (场内交易基金)

### 4.1 头部行情信息

| 优先级 | 字段名称 | 数据类型 | AkShare 方法         | 说明           |
| :----: | -------- | -------- | -------------------- | -------------- |
|   🔴    | 基金代码 | string   | `fund_etf_spot_em()` | 如 "510050"    |
|   🔴    | 基金名称 | string   | `fund_etf_spot_em()` | 如 "50ETF"     |
|   🔴    | 最新价   | number   | `fund_etf_spot_em()` | 场内交易价格   |
|   🔴    | 涨跌额   | number   | `fund_etf_spot_em()` | -              |
|   🔴    | 涨跌幅   | number   | `fund_etf_spot_em()` | 单位: %        |
|   🔴    | 交易状态 | string   | 需推断               | TRADING/CLOSED |
|   🔵    | 更新时间 | datetime | `fund_etf_spot_em()` | -              |

### 4.2 场内交易特有数据 ⭐

| 优先级 | 字段名称      | 数据类型 | AkShare 方法         | 说明         |
| :----: | ------------- | -------- | -------------------- | ------------ |
|   🔴    | IOPV 实时估值 | number   | `fund_etf_spot_em()` | **ETF 独有** |
|   🔴    | 折溢价率      | number   | `fund_etf_spot_em()` | **ETF 独有** |
|   🔴    | 最新份额      | number   | `fund_etf_spot_em()` | 基金规模     |

### 4.3 核心行情数据

| 优先级 | 字段名称 | 数据类型 | AkShare 方法         | 说明    |
| :----: | -------- | -------- | -------------------- | ------- |
|   🔴    | 开盘价   | number   | `fund_etf_spot_em()` | -       |
|   🔴    | 最高价   | number   | `fund_etf_spot_em()` | -       |
|   🔴    | 最低价   | number   | `fund_etf_spot_em()` | -       |
|   🔴    | 昨收     | number   | `fund_etf_spot_em()` | -       |
|   🔴    | 成交量   | number   | `fund_etf_spot_em()` | -       |
|   🔴    | 成交额   | number   | `fund_etf_spot_em()` | -       |
|   🔴    | 换手率   | number   | `fund_etf_spot_em()` | 单位: % |
|   🔵    | 量比     | number   | `fund_etf_spot_em()` | -       |
|   🔵    | 委比     | number   | `fund_etf_spot_em()` | -       |
|   🔵    | 外盘     | number   | `fund_etf_spot_em()` | -       |
|   🔵    | 内盘     | number   | `fund_etf_spot_em()` | -       |

### 4.4 市值与规模

| 优先级 | 字段名称 | 数据类型 | AkShare 方法         | 说明 |
| :----: | -------- | -------- | -------------------- | ---- |
|   🔴    | 流通市值 | number   | `fund_etf_spot_em()` | -    |
|   🔴    | 总市值   | number   | `fund_etf_spot_em()` | -    |

### 4.5 资金流向

| 优先级 | 字段名称            | 数据类型 | AkShare 方法         | 说明    |
| :----: | ------------------- | -------- | -------------------- | ------- |
|   🔵    | 主力净流入 (金额)   | number   | `fund_etf_spot_em()` | -       |
|   🔵    | 主力净流入 (占比)   | number   | `fund_etf_spot_em()` | 单位: % |
|   🔵    | 超大单净流入 (金额) | number   | `fund_etf_spot_em()` | -       |
|   🔵    | 大单净流入 (金额)   | number   | `fund_etf_spot_em()` | -       |
|   🔵    | 中单净流入 (金额)   | number   | `fund_etf_spot_em()` | -       |
|   🔵    | 小单净流入 (金额)   | number   | `fund_etf_spot_em()` | -       |

### 4.6 基金基本信息

| 优先级 | 字段名称     | 数据类型 | AkShare 方法           | 说明         |
| :----: | ------------ | -------- | ---------------------- | ------------ |
|   🔴    | 跟踪标的     | string   | `fund_info_index_em()` | 如 "沪深300" |
|   🔴    | 跟踪类型     | string   | `fund_info_index_em()` | 被动/增强    |
|   🔵    | 单位净值     | number   | `fund_info_index_em()` | -            |
|   🔵    | 日增长率     | number   | `fund_info_index_em()` | 单位: %      |
|   🔵    | 近1周收益    | number   | `fund_info_index_em()` | 单位: %      |
|   🔵    | 近1月收益    | number   | `fund_info_index_em()` | 单位: %      |
|   🔵    | 近3月收益    | number   | `fund_info_index_em()` | 单位: %      |
|   🔵    | 近6月收益    | number   | `fund_info_index_em()` | 单位: %      |
|   🔵    | 近1年收益    | number   | `fund_info_index_em()` | 单位: %      |
|   🔵    | 成立以来收益 | number   | `fund_info_index_em()` | 单位: %      |
|   🔵    | 手续费       | number   | `fund_info_index_em()` | 单位: %      |
|   🔵    | 起购金额     | string   | `fund_info_index_em()` | -            |

### 4.7 基金持仓 (十大重仓股)

| 优先级 | 字段名称     | 数据类型 | AkShare 方法               | 说明           |
| :----: | ------------ | -------- | -------------------------- | -------------- |
|   🔴    | 持仓股票代码 | string   | `fund_portfolio_hold_em()` | -              |
|   🔴    | 持仓股票名称 | string   | `fund_portfolio_hold_em()` | -              |
|   🔴    | 持仓比例     | number   | `fund_portfolio_hold_em()` | 单位: %        |
|   🔵    | 持仓股数     | number   | `fund_portfolio_hold_em()` | -              |
|   🔵    | 持仓市值     | number   | `fund_portfolio_hold_em()` | -              |
|   🔵    | 季度变动     | string   | `fund_portfolio_hold_em()` | 新进/增持/减持 |

### 4.8 其他数据

| 优先级 | 字段名称   | 数据类型 | AkShare 方法                              | 说明 |
| :----: | ---------- | -------- | ----------------------------------------- | ---- |
|   🔵    | 行业配置   | array    | `fund_portfolio_industry_allocation_em()` | -    |
|   🔵    | 规模变动   | array    | `fund_scale_change_em()`                  | -    |
|   🔵    | 持有人结构 | object   | `fund_hold_structure_em()`                | -    |
|   🔵    | 累计分红   | array    | `fund_etf_dividend_sina()`                | -    |
|   🔵    | 基金费率   | object   | `fund_fee_em()`                           | -    |

---

## 5. 场外基金 (FUND)

### 5.1 头部净值信息 ⭐

| 优先级 | 字段名称       | 数据类型 | AkShare 方法                | 说明              |
| :----: | -------------- | -------- | --------------------------- | ----------------- |
|   🔴    | 基金代码       | string   | `fund_open_fund_daily_em()` | 如 "000001"       |
|   🔴    | 基金名称       | string   | `fund_open_fund_daily_em()` | 如 "华夏成长混合" |
|   🔴    | 单位净值       | number   | `fund_open_fund_daily_em()` | **核心数据**      |
|   🔴    | 累计净值       | number   | `fund_open_fund_daily_em()` | -                 |
|   🔴    | 日增长率       | number   | `fund_open_fund_daily_em()` | 单位: %           |
|   🔴    | 净值日期       | date     | `fund_open_fund_daily_em()` | -                 |
|   🔵    | 日增长值       | number   | `fund_open_fund_daily_em()` | -                 |
|   🔵    | 前一日单位净值 | number   | `fund_open_fund_daily_em()` | -                 |
|   🔵    | 前一日累计净值 | number   | `fund_open_fund_daily_em()` | -                 |

### 5.2 申赎状态

| 优先级 | 字段名称 | 数据类型 | AkShare 方法                | 说明                   |
| :----: | -------- | -------- | --------------------------- | ---------------------- |
|   🔴    | 申购状态 | string   | `fund_open_fund_daily_em()` | 开放申购/限大额/封闭期 |
|   🔴    | 赎回状态 | string   | `fund_open_fund_daily_em()` | 开放赎回/封闭期        |
|   🔵    | 手续费   | number   | `fund_open_fund_daily_em()` | 单位: %                |

### 5.3 基金基本信息

| 优先级 | 字段名称     | 数据类型 | AkShare 方法                      | 说明           |
| :----: | ------------ | -------- | --------------------------------- | -------------- |
|   🔴    | 基金全称     | string   | `fund_individual_basic_info_xq()` | 雪球           |
|   🔴    | 基金类型     | string   | `fund_individual_basic_info_xq()` | 如 混合型-偏股 |
|   🔴    | 成立时间     | date     | `fund_individual_basic_info_xq()` | -              |
|   🔴    | 最新规模     | string   | `fund_individual_basic_info_xq()` | 如 "27.30亿"   |
|   🔴    | 基金公司     | string   | `fund_individual_basic_info_xq()` | -              |
|   🔴    | 基金经理     | string   | `fund_individual_basic_info_xq()` | **重要信息**   |
|   🔵    | 托管银行     | string   | `fund_individual_basic_info_xq()` | -              |
|   🔵    | 评级机构     | string   | `fund_individual_basic_info_xq()` | 如 晨星评级    |
|   🔵    | 基金评级     | string   | `fund_individual_basic_info_xq()` | 如 五星基金    |
|   🔵    | 投资策略     | string   | `fund_individual_basic_info_xq()` | -              |
|   🔵    | 投资目标     | string   | `fund_individual_basic_info_xq()` | -              |
|   🔵    | 业绩比较基准 | string   | `fund_individual_basic_info_xq()` | -              |

### 5.4 收益表现

| 优先级 | 字段名称     | 数据类型 | AkShare 方法               | 说明    |
| :----: | ------------ | -------- | -------------------------- | ------- |
|   🔴    | 近1周收益    | number   | `fund_open_fund_rank_em()` | 单位: % |
|   🔴    | 近1月收益    | number   | `fund_open_fund_rank_em()` | 单位: % |
|   🔴    | 近3月收益    | number   | `fund_open_fund_rank_em()` | 单位: % |
|   🔵    | 近6月收益    | number   | `fund_open_fund_rank_em()` | 单位: % |
|   🔵    | 近1年收益    | number   | `fund_open_fund_rank_em()` | 单位: % |
|   🔵    | 近2年收益    | number   | `fund_open_fund_rank_em()` | 单位: % |
|   🔵    | 近3年收益    | number   | `fund_open_fund_rank_em()` | 单位: % |
|   🔵    | 今年以来收益 | number   | `fund_open_fund_rank_em()` | 单位: % |
|   🔵    | 成立以来收益 | number   | `fund_open_fund_rank_em()` | 单位: % |

### 5.5 同类排名

| 优先级 | 字段名称       | 数据类型 | AkShare 方法                                         | 说明 |
| :----: | -------------- | -------- | ---------------------------------------------------- | ---- |
|   🔵    | 同类排名走势   | array    | `fund_open_fund_info_em(indicator="同类排名走势")`   | -    |
|   🔵    | 同类排名百分比 | array    | `fund_open_fund_info_em(indicator="同类排名百分比")` | -    |

### 5.6 基金持仓 (十大重仓股)

| 优先级 | 字段名称     | 数据类型 | AkShare 方法               | 说明           |
| :----: | ------------ | -------- | -------------------------- | -------------- |
|   🔴    | 持仓股票代码 | string   | `fund_portfolio_hold_em()` | -              |
|   🔴    | 持仓股票名称 | string   | `fund_portfolio_hold_em()` | -              |
|   🔴    | 持仓比例     | number   | `fund_portfolio_hold_em()` | 单位: %        |
|   🔵    | 持仓股数     | number   | `fund_portfolio_hold_em()` | -              |
|   🔵    | 持仓市值     | number   | `fund_portfolio_hold_em()` | -              |
|   🔵    | 季度变动     | string   | `fund_portfolio_hold_em()` | 新进/增持/减持 |

### 5.7 资产配置

| 优先级 | 字段名称 | 数据类型 | AkShare 方法                            | 说明    |
| :----: | -------- | -------- | --------------------------------------- | ------- |
|   🔵    | 股票占比 | number   | `fund_report_asset_allocation_cninfo()` | 单位: % |
|   🔵    | 债券占比 | number   | `fund_report_asset_allocation_cninfo()` | 单位: % |
|   🔵    | 现金占比 | number   | `fund_report_asset_allocation_cninfo()` | 单位: % |
|   🔵    | 其他占比 | number   | `fund_report_asset_allocation_cninfo()` | 单位: % |

### 5.8 行业配置

| 优先级 | 字段名称 | 数据类型 | AkShare 方法                              | 说明    |
| :----: | -------- | -------- | ----------------------------------------- | ------- |
|   🔵    | 行业名称 | string   | `fund_portfolio_industry_allocation_em()` | -       |
|   🔵    | 配置比例 | number   | `fund_portfolio_industry_allocation_em()` | 单位: % |
|   🔵    | 同类平均 | number   | `fund_portfolio_industry_allocation_em()` | 单位: % |
|   🔵    | 比较基准 | number   | `fund_portfolio_industry_allocation_em()` | 单位: % |

### 5.9 债券持仓 (可选)

| 优先级 | 字段名称 | 数据类型 | AkShare 方法                    | 说明    |
| :----: | -------- | -------- | ------------------------------- | ------- |
|   🔵    | 债券代码 | string   | `fund_portfolio_bond_hold_em()` | -       |
|   🔵    | 债券名称 | string   | `fund_portfolio_bond_hold_em()` | -       |
|   🔵    | 持仓比例 | number   | `fund_portfolio_bond_hold_em()` | 单位: % |
|   🔵    | 持仓市值 | number   | `fund_portfolio_bond_hold_em()` | -       |

### 5.10 分红与拆分

| 优先级 | 字段名称 | 数据类型 | AkShare 方法                                       | 说明 |
| :----: | -------- | -------- | -------------------------------------------------- | ---- |
|   🔵    | 分红详情 | array    | `fund_open_fund_info_em(indicator="分红送配详情")` | -    |
|   🔵    | 拆分详情 | array    | `fund_open_fund_info_em(indicator="拆分详情")`     | -    |
|   🔵    | 分红排行 | array    | `fund_fh_rank_em()`                                | -    |

### 5.11 基金估值 (盘中)

| 优先级 | 字段名称     | 数据类型 | AkShare 方法                 | 说明     |
| :----: | ------------ | -------- | ---------------------------- | -------- |
|   🔵    | 盘中估算净值 | number   | `fund_value_estimation_em()` | 实时估值 |
|   🔵    | 估算涨跌幅   | number   | `fund_value_estimation_em()` | 单位: %  |

### 5.12 其他分析数据

| 优先级 | 字段名称 | 数据类型 | AkShare 方法                              | 说明 |
| :----: | -------- | -------- | ----------------------------------------- | ---- |
|   🔵    | 基金业绩 | object   | `fund_individual_achievement_xq()`        | 雪球 |
|   🔵    | 基金分析 | object   | `fund_individual_analysis_xq()`           | -    |
|   🔵    | 盈利概率 | object   | `fund_individual_profit_probability_xq()` | -    |
|   🔵    | 交易规则 | object   | `fund_individual_detail_info_xq()`        | -    |

---

## 附录：图例说明

| 符号 | 含义                                        |
| ---- | ------------------------------------------- |
| 🔴    | **必须显示** - 核心信息，详情页必须展示     |
| 🔵    | **可选显示** - 扩展信息，可根据需求选择展示 |
| ⭐    | **类型特有** - 该资产类型独有的数据         |

---

## 附录：五类资产核心差异

| 特性       | A股      | 港股     | 美股     | ETF           | 场外基金 |
| ---------- | -------- | -------- | -------- | ------------- | -------- |
| 交易方式   | 实时交易 | 实时交易 | 实时交易 | 实时交易      | 每日申赎 |
| 定价方式   | 实时价格 | 实时价格 | 实时价格 | 实时价格+IOPV | 每日净值 |
| 货币单位   | 人民币   | 港元     | 美元     | 人民币        | 人民币   |
| 涨跌停限制 | 有       | 无       | 无       | 有            | 无       |
| 盘口数据   | 五档     | 无       | 无       | 有            | 无       |
| 基金经理   | 无       | 无       | 无       | 有            | 有       |
| 持仓信息   | 无       | 无       | 无       | 有            | 有       |
| 折溢价率   | 无       | 无       | 无       | 有            | 无       |
