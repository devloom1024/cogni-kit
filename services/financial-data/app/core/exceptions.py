"""自定义异常"""


class BaseServiceError(Exception):
    """服务基础异常"""
    
    def __init__(self, message: str, code: str = "INTERNAL_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class DataSourceError(BaseServiceError):
    """数据源错误（AkShare 获取数据失败）"""
    
    def __init__(self, message: str):
        super().__init__(message, code="DATA_SOURCE_ERROR")


class CalculationError(BaseServiceError):
    """计算错误（技术指标计算失败）"""
    
    def __init__(self, message: str):
        super().__init__(message, code="CALCULATION_ERROR")


class CacheError(BaseServiceError):
    """缓存错误（Redis 操作失败）"""
    
    def __init__(self, message: str):
        super().__init__(message, code="CACHE_ERROR")


class ValidationError(BaseServiceError):
    """数据验证错误"""
    
    def __init__(self, message: str):
        super().__init__(message, code="VALIDATION_ERROR")


class NotFoundError(BaseServiceError):
    """资源不存在"""
    
    def __init__(self, message: str):
        super().__init__(message, code="NOT_FOUND")
