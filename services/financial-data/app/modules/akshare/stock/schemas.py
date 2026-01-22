"""股票数据模型"""
from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime, date


# ==================== 枚举类型 ====================
MarketType = Literal["CN", "HK", "US"]
TradingStatus = Literal["TRADING", "CLOSED", "SUSPENDED"]


# ==================== 股票模型 ====================
class StockListItem(BaseModel):
    """股票列表项"""
    symbol: str = Field(..., description="股票代码")
    name: str = Field(..., description="股票名称")
    market: MarketType = Field(..., description="所属市场")


class StockSpot(BaseModel):
    """股票实时行情(含五档盘口)"""
    # 基本信息
    symbol: str = Field(..., description="股票代码")
    name: str | None = Field(None, description="股票名称")
    
    # 价格信息
    price: float = Field(..., description="最新价")
    open: float = Field(..., description="今开")
    prevClose: float = Field(..., description="昨收", alias="prev_close")
    high: float = Field(..., description="最高")
    low: float = Field(..., description="最低")
    avgPrice: float | None = Field(None, description="均价", alias="avg_price")
    
    # 成交信息
    volume: float = Field(..., description="成交量(手)")
    amount: float = Field(..., description="成交额(元)")
    
    # 涨跌信息
    change: float = Field(..., description="涨跌额")
    changePercent: float = Field(..., description="涨跌幅 (%)", alias="change_percent")
    
    # 技术指标
    turnoverRate: float | None = Field(None, description="换手率 (%)", alias="turnover_rate")
    amplitude: float | None = Field(None, description="振幅 (%)")
    volumeRatio: float | None = Field(None, description="量比", alias="volume_ratio")
    
    # 涨跌停
    upperLimit: float | None = Field(None, description="涨停价", alias="upper_limit")
    lowerLimit: float | None = Field(None, description="跌停价", alias="lower_limit")
    
    # 内外盘
    outerVolume: float | None = Field(None, description="外盘(手)", alias="outer_volume")
    innerVolume: float | None = Field(None, description="内盘(手)", alias="inner_volume")
    
    # 五档买盘
    bid1: float | None = Field(None, description="买一价")
    bid1Volume: float | None = Field(None, description="买一量(手)", alias="bid1_volume")
    bid2: float | None = Field(None, description="买二价")
    bid2Volume: float | None = Field(None, description="买二量(手)", alias="bid2_volume")
    bid3: float | None = Field(None, description="买三价")
    bid3Volume: float | None = Field(None, description="买三量(手)", alias="bid3_volume")
    bid4: float | None = Field(None, description="买四价")
    bid4Volume: float | None = Field(None, description="买四量(手)", alias="bid4_volume")
    bid5: float | None = Field(None, description="买五价")
    bid5Volume: float | None = Field(None, description="买五量(手)", alias="bid5_volume")
    
    # 五档卖盘
    ask1: float | None = Field(None, description="卖一价")
    ask1Volume: float | None = Field(None, description="卖一量(手)", alias="ask1_volume")
    ask2: float | None = Field(None, description="卖二价")
    ask2Volume: float | None = Field(None, description="卖二量(手)", alias="ask2_volume")
    ask3: float | None = Field(None, description="卖三价")
    ask3Volume: float | None = Field(None, description="卖三量(手)", alias="ask3_volume")
    ask4: float | None = Field(None, description="卖四价")
    ask4Volume: float | None = Field(None, description="卖四量(手)", alias="ask4_volume")
    ask5: float | None = Field(None, description="卖五价")
    ask5Volume: float | None = Field(None, description="卖五量(手)", alias="ask5_volume")
    
    # 状态信息
    timestamp: datetime = Field(..., description="数据更新时间")
    
    class Config:
        populate_by_name = True


class KLinePoint(BaseModel):
    """K 线数据点"""
    timestamp: int = Field(..., description="时间戳 (毫秒)")
    open: float = Field(..., description="开盘价")
    high: float = Field(..., description="最高价")
    low: float = Field(..., description="最低价")
    close: float = Field(..., description="收盘价")
    volume: float = Field(..., description="成交量")


# ==================== 公司信息 ====================
class StockProfile(BaseModel):
    """公司基本信息"""
    symbol: str = Field(..., description="股票代码")
    name: str = Field(..., description="股票名称")
    fullName: str | None = Field(None, description="公司全称", alias="full_name")
    englishName: str | None = Field(None, description="英文名称", alias="english_name")
    industry: str | None = Field(None, description="所属行业")
    listingDate: date | None = Field(None, description="上市日期", alias="listing_date")
    totalShares: float | None = Field(None, description="总股本 (亿股)", alias="total_shares")
    floatShares: float | None = Field(None, description="流通股 (亿股)", alias="float_shares")
    mainBusiness: str | None = Field(None, description="主营业务", alias="main_business")
    registeredCapital: float | None = Field(None, description="注册资本 (亿元)", alias="registered_capital")
    employeeCount: int | None = Field(None, description="员工人数", alias="employee_count")
    legalRepresentative: str | None = Field(None, description="法人代表", alias="legal_representative")
    secretary: str | None = Field(None, description="董秘")
    website: str | None = Field(None, description="公司官网")
    phone: str | None = Field(None, description="联系电话")
    address: str | None = Field(None, description="办公地址")
    
    class Config:
        populate_by_name = True


# ==================== 估值数据 ====================
class StockValuation(BaseModel):
    """估值数据"""
    symbol: str = Field(..., description="股票代码")
    marketCap: float | None = Field(None, description="总市值 (亿元)", alias="market_cap")
    floatMarketCap: float | None = Field(None, description="流通市值 (亿元)", alias="float_market_cap")
    pe: float | None = Field(None, description="市盈率")
    pb: float | None = Field(None, description="市净率")
    dividendYield: float | None = Field(None, description="股息率 (%)", alias="dividend_yield")
    change60d: float | None = Field(None, description="60日涨跌幅 (%)", alias="change_60d")
    changeYtd: float | None = Field(None, description="年初至今涨跌幅 (%)", alias="change_ytd")
    
    class Config:
        populate_by_name = True


# ==================== 财务数据 ====================
class StockFinancial(BaseModel):
    """财务数据摘要"""
    symbol: str = Field(..., description="股票代码")
    reportDate: date = Field(..., description="报告期", alias="report_date")
    revenue: float | None = Field(None, description="营业收入 (亿元)")
    netProfit: float | None = Field(None, description="净利润 (亿元)", alias="net_profit")
    eps: float | None = Field(None, description="每股收益")
    bvps: float | None = Field(None, description="每股净资产")
    roe: float | None = Field(None, description="ROE (%)")
    grossMargin: float | None = Field(None, description="毛利率 (%)", alias="gross_margin")
    debtRatio: float | None = Field(None, description="资产负债率 (%)", alias="debt_ratio")
    
    class Config:
        populate_by_name = True


# ==================== 股东信息 ====================
class ShareholderItem(BaseModel):
    """股东信息项"""
    name: str = Field(..., description="股东名称")
    shares: float = Field(..., description="持股数 (万股)")
    percentage: float = Field(..., description="持股比例 (%)")
    change: str | None = Field(None, description="变动情况")


class StockShareholders(BaseModel):
    """股东信息（仅A股）"""
    symbol: str = Field(..., description="股票代码")
    shareholderCount: int | None = Field(None, description="股东人数", alias="shareholder_count")
    fundHoldingRatio: float | None = Field(None, description="基金持股比例 (%)", alias="fund_holding_ratio")
    top10Shareholders: list[ShareholderItem] = Field(default_factory=list, description="十大股东", alias="top10_shareholders")
    top10FloatShareholders: list[ShareholderItem] = Field(default_factory=list, description="十大流通股东", alias="top10_float_shareholders")
    
    class Config:
        populate_by_name = True


# ==================== 资金流向 ====================
class FundFlow(BaseModel):
    """资金流向（仅A股）"""
    symbol: str = Field(..., description="股票代码")
    mainNetInflow: float = Field(..., description="主力净流入 (万元)", alias="main_net_inflow")
    mainNetInflowRatio: float | None = Field(None, description="主力净流入占比 (%)", alias="main_net_inflow_ratio")
    superLargeNetInflow: float | None = Field(None, description="超大单净流入 (万元)", alias="super_large_net_inflow")
    largeNetInflow: float | None = Field(None, description="大单净流入 (万元)", alias="large_net_inflow")
    mediumNetInflow: float | None = Field(None, description="中单净流入 (万元)", alias="medium_net_inflow")
    smallNetInflow: float | None = Field(None, description="小单净流入 (万元)", alias="small_net_inflow")
    
    class Config:
        populate_by_name = True


# ==================== 五档盘口 ====================
class PriceLevel(BaseModel):
    """价格档位"""
    price: float = Field(..., description="价格")
    volume: float = Field(..., description="数量 (手)")


class BidAsk(BaseModel):
    """五档盘口（仅A股）"""
    symbol: str = Field(..., description="股票代码")
    bids: list[PriceLevel] = Field(..., description="买盘五档")
    asks: list[PriceLevel] = Field(..., description="卖盘五档")
    upperLimit: float | None = Field(None, description="涨停价", alias="upper_limit")
    lowerLimit: float | None = Field(None, description="跌停价", alias="lower_limit")
    outerVolume: float | None = Field(None, description="外盘", alias="outer_volume")
    innerVolume: float | None = Field(None, description="内盘", alias="inner_volume")
    
    class Config:
        populate_by_name = True


# ==================== 批量请求 ====================
class BatchSymbolItem(BaseModel):
    """批量请求股票项"""
    symbol: str = Field(..., description="股票代码")
    market: MarketType = Field(..., description="市场类型")


class BatchSpotRequest(BaseModel):
    """批量行情请求"""
    symbols: list[BatchSymbolItem] = Field(..., description="股票列表", max_length=50)


# ==================== 列表响应（含容错） ====================
class MarketFetchResult(BaseModel):
    """单个市场的获取结果"""
    market: MarketType = Field(..., description="市场类型")
    fetched: bool = Field(..., description="是否成功获取数据")
    count: int = Field(0, description="获取到的数据条数")
    error: Optional[str] = Field(None, description="错误信息")

    class Config:
        populate_by_name = True


class StockListResponse(BaseModel):
    """股票列表响应（含各市场获取状态）"""
    total_count: int = Field(..., description="总数据条数")
    markets: list[MarketFetchResult] = Field(..., description="各市场获取状态")
    data: list[StockListItem] = Field(..., description="股票列表数据")

    class Config:
        populate_by_name = True
