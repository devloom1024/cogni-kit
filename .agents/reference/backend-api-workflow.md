# 后端 API 开发工作流 (Backend API Development Workflow)

> **核心原则**: Shared Schema First (共享 Schema 优先) - **Code is Documentation**.

本文档详细介绍了在 CogniKit 项目中开发后端 API 的标准流程。核心思想是以 `packages/shared` 中的 Zod Schema 为单一真理来源 (Single Source of Truth)，自动驱动文档生成、运行时校验和前端类型推导。

---

## 1. 核心概念

*   **唯一真理源**: `packages/shared/src/schemas/*.ts`。
*   **禁止事项**:
    *   禁止手动维护 `openapi.yml` 或 `swagger.json`。
    *   禁止在 Server 端 `routes.ts` 中手写 Zod 参数校验（除非仅仅是本地 helper）。
    *   禁止在前后端重复定义接口类型。
*   **技术栈**:
    *   Schema 定义: `@hono/zod-openapi` (Zod 的增强版)。
    *   Server 框架: `OpenAPIHono` (基于 Hono)。

---

## 2. 开发流程

### Step 1: 在 Shared 中定义 Schema

所有 DTO (Data Transfer Object) 必须定义在 `packages/shared` 中。

**文件位置**: `packages/shared/src/schemas/[module].ts`

**代码规范**:
1.  使用 `@hono/zod-openapi` 的 `z`。
2.  为字段添加 `.openapi({ example: ... })` 元数据。
3.  使用 `.openapi('ComponentName')` 注册组件名称。

```typescript
// packages/shared/src/schemas/auth.ts
import { z } from '@hono/zod-openapi';

// 定义 Request Schema
export const LoginRequestSchema = z.object({
  email: z.string().email().openapi({ example: 'user@example.com' }),
  password: z.string().min(8).openapi({ example: 'password123' })
}).openapi('LoginRequest'); // <--- 这里注册组件名，这将在 Swagger "Schemas" 中显示

// 定义 Response Schema
export const TokenResponseSchema = z.object({
  accessToken: z.string().openapi({ example: 'eyJ...' }),
  expiresIn: z.number().openapi({ example: 3600 })
}).openapi('TokenResponse');

// 导出类型供前端使用
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
```

### Step 2: 在 Server 中实现路由

**文件位置**: `apps/server/src/features/[module]/routes.ts`

**代码规范**:
1.  使用 `OpenAPIHono` 实例。
2.  使用 `createRoute` 定义路由元数据（路径、方法、Schema、Tag）。
3.  引用 Step 1 中定义的 Shared Schema。

```typescript
// apps/server/src/features/auth/routes.ts
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { LoginRequestSchema, TokenResponseSchema } from 'shared'; // <--- 直接引用

const app = new OpenAPIHono();

const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Auth'], // <--- Swagger 分组 Tag
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginRequestSchema // <--- 绑定 Request Schema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TokenResponseSchema // <--- 绑定 Response Schema
        }
      },
      description: 'Login successful'
    }
  }
});

// 实现处理逻辑
app.openapi(loginRoute, async (c) => {
  const { email, password } = c.req.valid('json'); // <--- 自动获得类型提示！
  // ... 业务逻辑
  return c.json({ accessToken: '...', expiresIn: 3600 });
});
```

### Step 3: 自动生成文档与验证

1.  启动 Server: `bun run dev`。
2.  访问 Swagger UI: `http://localhost:3001/swagger`。
3.  验证：
    *   新的 Endpoint 是否出现？
    *   Tag 分组是否正确？
    *   Request/Response 的 Schema 和 Example 是否显示正确？
    *   "Try it out" 是否能正常工作？

### Step 4: 前端集成 (Web)

前端直接复用 Shared Schema 进行表单验证和类型推导。

```typescript
// apps/web/src/features/auth/login-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginRequestSchema, type LoginRequest } from 'shared'; // <--- 复用！

export function LoginForm() {
  const form = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema), // <--- 直接作为校验规则
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  // ...
}
```

---

## 3. 高级技巧

### 3.1 字段复用
如果在 API 文档中出现多个甚至重复的字段定义，应将其抽取为基础 Schema。
例如 `UserSchema` 此类基础实体，应定义一次，然后在 `CreateUser` 或 `UpdateUser` 中 `pick` 或 `omit`，或者直接引用。

### 3.2 国际化 (i18n) 工作流

CogniKit 使用 **Shared Validation Keys** 策略，确保前后端验证信息一致。

1.  **Shared Translation Keys**:
    *   Validation 相关的翻译键定义在 `packages/shared/src/i18n/locales/*.json`。
    *   例如: `"validation.password.min": "密码至少需要 8 个字符"`。

2.  **Schema 定义**:
    *   在 Zod Schema 中，`message` 必须是 **Translation Key**。
    *   **禁止**使用硬编码的自然语言。

```typescript
// 正确示例
z.string().min(8, 'validation.password.min')

// 错误示例
z.string().min(8, 'Password must be at least 8 characters')
```

3.  **Client 端处理**:
    *   Web 端会自动合并 Shared Resources。
    *   直接使用 `t(error.message)` 进行渲染。

4.  **Server 端处理**:
    *   Server 会捕获 ZodError。
    *   利用 Request Context 中的 `t` 函数将 Key 转换为对应语言的文本。
    *   API 最终返回的是**已翻译**的文本（作为 default message），同时也包含 Key 以供客户端（如有需要）自行翻译。

### 3.3 安全方案 (Security Schemes)
如果接口需要认证，请在 `createRoute` 中添加 `security` 配置：

```typescript
security: [{ bearerAuth: [] }]
```

确保 `main.ts` 中已在 OpenAPI 配置中定义了 `bearerAuth`。
