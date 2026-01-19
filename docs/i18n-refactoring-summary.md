# 国际化重构总结

本文档总结了对项目国际化（i18n）处理的重构工作。

## 📋 改进内容

### 1️⃣ **创建 `SuccessCode` 枚举**

在 `packages/shared/src/types/error.ts` 中添加了 `SuccessCode` 枚举，与 `ErrorCode` 保持一致的设计模式：

```typescript
export const SuccessCode = {
  // ========== 认证相关 ==========
  CODE_SENT: 'auth.code_sent',
  REGISTER_SUCCESS: 'auth.register_success',
  LOGIN_SUCCESS: 'auth.login_success',
  LOGOUT_SUCCESS: 'auth.logout_success',
  PASSWORD_RESET_SUCCESS: 'auth.password_reset_success',
  TOKEN_REFRESHED: 'auth.token_refreshed',

  // ========== OAuth 相关 ==========
  OAUTH_SUCCESS: 'oauth.success',

  // ========== 通用 ==========
  OPERATION_SUCCESS: 'common.operation_success',
  UPDATE_SUCCESS: 'common.update_success',
  DELETE_SUCCESS: 'common.delete_success',
  CREATE_SUCCESS: 'common.create_success',
} as const
```

### 2️⃣ **优化 `AppError` 类**

简化了 `AppError` 的构造函数，移除了冗余的 `message` 参数：

**之前：**
```typescript
constructor(
    public code: ErrorCode,
    message: string = 'internal.error',  // 冗余参数
    public status: ContentfulStatusCode = 500,
    public details?: Record<string, unknown>
)
```

**现在：**
```typescript
constructor(
    public code: ErrorCode,
    public status: ContentfulStatusCode = 500,
    public details?: Record<string, unknown>
)
```

**使用示例：**
```typescript
// 之前
throw new AppError(ErrorCode.INVALID_CODE, 'auth.invalid_code', 400)

// 现在
throw new AppError(ErrorCode.INVALID_CODE, 400)
```

### 3️⃣ **添加 OAuth 错误码**

在 `ErrorCode` 中添加了 OAuth 专用的错误码：

```typescript
// ========== OAuth 相关 ==========
OAUTH_INVALID_PROVIDER: 'oauth.invalid_provider',
OAUTH_NOT_CONFIGURED: 'oauth.not_configured',
```

### 4️⃣ **完善 i18n 翻译文件**

在 `apps/server/src/shared/i18n/locales/zh.json` 和 `en.json` 中添加了：

- 成功消息的翻译（auth.*, oauth.*, common.*）
- OAuth 错误消息的翻译
- 所有新增的 ErrorCode 和 SuccessCode 对应的翻译

### 5️⃣ **重构路由处理**

#### Auth Routes (`apps/server/src/features/auth/routes.ts`)

**发送验证码：**
```typescript
// 之前
return c.json({ success: true, message: 'Verification code sent', expiresIn: 900 }, 200)

// 现在
const t = c.get('t')
return c.json({ 
  success: true, 
  message: t(SuccessCode.CODE_SENT),  // 使用国际化
  expiresIn: 900 
}, 200)
```

**重置密码：**
```typescript
// 之前
return c.json({ success: true, message: 'Password reset successfully' })

// 现在
const t = c.get('t')
return c.json({ 
  success: true, 
  message: t(SuccessCode.PASSWORD_RESET_SUCCESS) 
})
```

#### OAuth Routes (`apps/server/src/features/oauth/routes.ts`)

移除了硬编码的错误消息，改用 `AppError` 和 `ErrorCode`：

```typescript
// 之前
return c.json({ code: 'oauth.invalid_provider', message: 'Invalid OAuth provider' }, 400)

// 现在
throw new AppError(ErrorCode.OAUTH_INVALID_PROVIDER, 400, { provider })
```

### 6️⃣ **更新所有 Service 层**

更新了 `apps/server/src/features/auth/service.ts` 和 `oauth/service.ts` 中所有的 `AppError` 调用，使用新的简化签名。

## 🎯 设计原则

### **统一的国际化架构**

1. **ErrorCode = i18n key**：ErrorCode 的值直接作为 i18n 的 key
2. **SuccessCode = i18n key**：SuccessCode 的值直接作为 i18n 的 key
3. **集中管理**：所有消息码在 `shared` 包中统一维护
4. **自动翻译**：通过 error handler 和响应处理自动进行国际化翻译

### **错误处理流程**

```
Service 层抛出 AppError(ErrorCode, status)
         ↓
Error Handler 捕获
         ↓
使用 t(error.message) 翻译 ErrorCode
         ↓
返回国际化的错误响应
```

### **成功消息处理流程**

```
Routes 层生成成功响应
         ↓
使用 t(SuccessCode.XXX) 翻译
         ↓
返回国际化的成功响应
```

## 📝 使用指南

### **添加新的错误类型**

1. 在 `packages/shared/src/types/error.ts` 中添加 `ErrorCode`
2. 在 `apps/server/src/shared/i18n/locales/zh.json` 和 `en.json` 中添加翻译
3. 在代码中使用：`throw new AppError(ErrorCode.YOUR_ERROR, status)`

### **添加新的成功消息**

1. 在 `packages/shared/src/types/error.ts` 中添加 `SuccessCode`
2. 在 `apps/server/src/shared/i18n/locales/zh.json` 和 `en.json` 中添加翻译
3. 在路由中使用：
   ```typescript
   const t = c.get('t')
   return c.json({ 
     success: true, 
     message: t(SuccessCode.YOUR_SUCCESS) 
   })
   ```

## ✅ 优势

1. **类型安全**：使用 TypeScript 枚举，编译时检查
2. **集中管理**：所有消息码在一个文件中维护
3. **易于扩展**：添加新消息只需三步（定义码→添加翻译→使用）
4. **自动国际化**：无需在每个地方手动调用翻译函数
5. **一致性**：错误和成功消息使用相同的模式
6. **可维护性**：代码更简洁，减少硬编码字符串

## 🔍 检查清单

- [x] SuccessCode 枚举已创建
- [x] ErrorCode 添加 OAuth 相关错误码
- [x] AppError 类已优化（移除 message 参数）
- [x] 所有 AppError 调用已更新
- [x] Auth routes 使用 SuccessCode
- [x] OAuth routes 使用 ErrorCode
- [x] i18n 翻译文件已完善（中英文）
- [x] 所有硬编码消息已移除

## 📌 注意事项

1. **@ts-expect-error 注释**：在 OAuth routes 中使用了 `@ts-expect-error`，因为 Hono OpenAPI 的类型系统无法识别通过 error handler 统一处理的错误响应
2. **Context 中的 t 函数**：在路由处理函数中，应优先使用 `c.get('t')` 获取 i18n middleware 注入的翻译函数
3. **ErrorCode vs SuccessCode**：ErrorCode 用于错误场景（通过 AppError 抛出），SuccessCode 用于成功响应（在路由中直接使用）
