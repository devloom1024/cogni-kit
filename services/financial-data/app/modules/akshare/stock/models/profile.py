"""公司信息模型"""
from pydantic import BaseModel, Field
from datetime import date


class StockProfile(BaseModel):
    """公司基本信息（不含交易数据）"""
    symbol: str = Field(..., description="股票代码")
    name: str = Field(..., description="公司简称")
    full_name: str | None = Field(None, description="公司全称", alias="fullName")
    english_name: str | None = Field(None, description="英文名称", alias="englishName")
    industry: str | None = Field(None, description="所属行业")
    province: str | None = Field(None, description="所在省份")
    listing_date: date | None = Field(None, description="上市日期", alias="listingDate")
    established_date: date | None = Field(None, description="成立日期", alias="establishedDate")
    main_business: str | None = Field(None, description="主营业务", alias="mainBusiness")
    operating_scope: str | None = Field(None, description="经营范围", alias="operatingScope")
    introduction: str | None = Field(None, description="公司简介")
    registered_capital: float | None = Field(None, description="注册资本 (亿元)", alias="registeredCapital")
    employee_count: int | None = Field(None, description="员工人数", alias="employeeCount")
    legal_representative: str | None = Field(None, description="法人代表", alias="legalRepresentative")
    chairman: str | None = Field(None, description="董事长")
    general_manager: str | None = Field(None, description="总经理", alias="generalManager")
    secretary: str | None = Field(None, description="董秘")
    website: str | None = Field(None, description="公司官网")
    email: str | None = Field(None, description="电子邮箱")
    phone: str | None = Field(None, description="联系电话")
    fax: str | None = Field(None, description="传真")
    postcode: str | None = Field(None, description="邮政编码")
    reg_address: str | None = Field(None, description="注册地址", alias="regAddress")
    office_address: str | None = Field(None, description="办公地址", alias="officeAddress")
    pre_name: str | None = Field(None, description="曾用名称", alias="preName")
    actual_controller: str | None = Field(None, description="实际控制人", alias="actualController")

    class Config:
        populate_by_name = True
