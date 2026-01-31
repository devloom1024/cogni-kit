"""Provider 相关自定义异常"""


class ProviderError(Exception):
    """基础 Provider 异常"""


class ProviderUnavailableError(ProviderError):
    """Provider 当前不可用"""

    def __init__(self, provider: str, message: str | None = None):
        detail = message or "provider unavailable"
        super().__init__(f"{provider}: {detail}")
        self.provider = provider
        self.detail = detail


class ProviderSelectionError(ProviderError):
    """所有 Provider 均不可用"""

    def __init__(self, errors: list[str]):
        message = "; ".join(errors) if errors else "no provider available"
        super().__init__(message)
        self.errors = errors
