# CogniKit 开发规范 (Development Standards)

本文档定义了 CogniKit 项目的强制性开发标准，旨在确保代码库的一致性、可维护性和协作效率。所有开发者必须严格遵守。

---

## 1. 核心工程原则

*   **Monorepo 优先**
    *   任何可能跨应用复用的逻辑（类型定义、DTOs、工具函数、常量）**必须**放入 `packages/shared`。
    *   **严禁**在 `apps/web` 和 `apps/server` 之间复制粘贴代码。
    *   保持 DRY (Don't Repeat Yourself) 原则。

*   **全栈类型安全 (End-to-End Type Safety)**
    *   前后端**必须**共享 Zod Schema 和 TypeScript Interface。
    *   后端修改 API 契约时，前端应通过类型检查立即感知变更。
    *   禁止在 API 边界使用 `any`。

*   **Feature-First 架构**
    *   代码组织应优先按照**业务功能 (Feature)** 划分（如 `auth`, `user`, `billing`）。
    *   **禁止**按照技术类型（如 `controllers`, `components`, `hooks`）将文件分散在不同根目录下。

---

## 2. 前端开发规范 (apps/web)

**技术栈**: React + Vite + shadcn/ui + Tailwind + TanStack Query + Zustand

### 2.1 组件与样式
*   **Shadcn/ui 使用原则**:
    *   `src/components/ui` 目录下的组件视为**基础库代码**，原则上不修改其逻辑。
    *   仅可通过 `className` 覆盖样式，或通过 `variants` 扩展。
    *   业务组件（如 `UserCard`）应构建在这些基础组件之上。
*   **Tailwind CSS 规范**:
    *   **严禁**使用 `style` 属性编写行内样式。
    *   使用 `cn()` (clsx + tailwind-merge) 工具函数处理条件样式和样式合并。
    *   **颜色与主题**: 必须使用 CSS 变量（如 `bg-primary`, `text-muted-foreground`）而非硬编码颜色（如 `bg-blue-500`），以支持 Dark Mode。
39: 
40: ### 2.2 表单开发规范 (Form Implementation)
41: *   **库选型**: 统一使用 `react-hook-form` + `zod` + `shadcn/ui`。
42: *   **实现模式**:
43:     *   必须使用 **Controller + Field** 模式（即 Controlled Components），而非 `register`（Uncontrolled）。
44:     *   这能确保与 UI 组件库的最佳兼容性及更强的类型控制。
45: *   **错误显示**:
46:     *   **严禁**直接渲染 `<span>{error.message}</span>`。
47:     *   **必须**使用包装组件（如 `FormError`）来显示错误信息。
48:     *   **原因**: Shared Schema 返回的是翻译键值（Translation Key），必须在前端通过 `t()` 函数转换后才能展示给用户。
49: *   **组件修改**:
50:     *   **严禁**直接修改 `src/components/ui` 目录下的第三方组件代码。
51:     *   如果需要扩展功能（如自动翻译错误），请创建 Wrapper 组件（如 `src/components/form-error.tsx`）。

### 2.2 状态管理
*   **服务端状态 (Server State)**: **必须**使用 **TanStack Query (React Query)**。
    *   API 请求、缓存、加载状态、错误重试均由 Query 处理。
    *   **禁止**将 API 数据手动存入 Zustand 或 Context。
*   **客户端状态 (Client State)**: 使用 **Zustand**。
    *   仅用于纯 UI 状态（如：侧边栏折叠/展开、模态框开关）。
    *   Store 命名应以 `use` 开头，如 `useUIStore`。

### 2.3 目录结构 (Feature-based)
遵循以下结构，保持高内聚：
```
src/features/auth/
├── components/    # 该功能独有的 UI 组件
├── hooks/         # 该功能独有的 Hooks (useLogin)
├── api/           # 该功能的 API 请求封装
├── types/         # 该功能的类型定义 (如果未在 shared 中)
└── index.ts       # 公开导出 (Public API)
```

---

## 3. 后端开发规范 (apps/server)

**技术栈**: Bun + Hono + Prisma + Clean Architecture

### 3.1 架构分层 (Clean Architecture)
严格遵守三层架构，**禁止越层调用**：

1.  **Router/Controller 层 (`routes.ts`)**:
    *   职责：HTTP 交互、解析请求、验证参数 (Zod)、调用 Service、返回响应。
    *   **禁止**在此层编写业务逻辑或直接访问数据库。
2.  **Service 层 (`service.ts`)**:
    *   职责：业务逻辑、事务管理、复杂计算、调用第三方 API。
    *   输入输出应为纯 JS 对象或 DTO，**不依赖** HTTP 上下文 (`Context`)。
3.  **Data Access 层 (`db/`, `prisma`)**:
    *   职责：数据持久化。

### 3.2 错误处理与日志

*   **统一异常处理**: 业务错误应抛出自定义 Error（或 Hono 的 `HTTPException`），由全局中间件捕获。
*   **Service 层错误处理**:
    *   **必须**使用 `AppError` 类抛出业务错误，而非直接抛出 Error。
    *   **必须**使用 `ErrorCode` 枚举定义错误码，禁止使用字符串字面量（如 `'auth.unauthorized'`）。
    *   **必须**导入 `ErrorCode`：`import { ErrorCode } from 'shared'`。
    *   **禁止**使用 `as any` 类型断言绕过类型检查。

    ```typescript
    // ✅ 正确示例
    import { AppError } from '../../shared/error.js'
    import { ErrorCode } from 'shared'

    if (!isOwner) {
      throw new AppError(ErrorCode.WATCHLIST_FORBIDDEN, 403)
    }

    // ❌ 错误示例
    if (!isOwner) {
      throw new AppError('auth.unauthorized' as any, 403)  // 禁止使用 as any
    }
    ```

*   **新增业务模块的错误码**: 在 `packages/shared/src/types/codes.ts` 的 `ErrorCode` 中添加模块专属错误码（如 `WATCHLIST_FORBIDDEN`），并在 `apps/server/src/shared/i18n/locales/*.json` 中添加对应的翻译键。
*   **结构化日志**: 使用 `pino`。
    *   生产环境**严禁**使用 `console.log`。
    *   关键操作（登录、支付、修改）**必须**记录日志。
    *   格式：`log('event_name', { userId: '...', ...data })`。

### 3.3 数据库操作 (Prisma)
*   详细规范请参考 **[数据库设计规范 (Database Design Standards)](./database-design-standards.md)**。
*   **核心原则摘要**:
    *   严格遵守 **Clean Architecture**，仅在 `Data Access` 层或 `Service` 层操作数据库。
    *   **必须**使用文档注释 (`///`) 为模型和字段添加说明。
    *   **必须**通过 `prisma migrate` 管理所有数据库变更。

### 3.4 OpenAPI 与文档 (Shared Schema First)
*   **核心原则**: **代码即文档 (Code is Documentation)**。
*   **详细工作流**: 请参考 **[后端 API 开发工作流 (Backend API Development Workflow)](./backend-api-workflow.md)**。
    *   包含从 Schema 定义、路由实现到前端集成的完整步骤。
    *   严禁手动维护 YAML 文件。

---

## 4. 共享协作规范 (packages/shared)

### 4.1 Schema 优先架构 (Schema-First Architecture)

**核心原则**: Zod Schema 是唯一真实数据源 (Single Source of Truth)

*   **类型定义规范**:
    *   所有数据类型（请求/响应 DTO、数据模型）**必须**先定义 Zod Schema，再通过 `z.infer<typeof schema>` 推导 TypeScript 类型。
    *   **禁止**手写 TypeScript 接口后再编写对应的 Zod Schema（会导致双重维护和不同步）。
    *   **例外**: 纯枚举定义（如 `UserStatus`）和不需要运行时验证的内部类型可保留在 `types/`。

*   **目录职责**:
    *   `packages/shared/src/schemas/`: 存放所有 Zod Schema 定义和通过 `z.infer` 推导的类型
    *   `packages/shared/src/types/`: 仅保留纯枚举定义（`as const` 模式）和不需要验证的内部类型

*   **正确示例**:
    ```typescript
    // ✅ packages/shared/src/schemas/user.ts
    import { z } from '@hono/zod-openapi'
    
    export const UserSchema = z.object({
      id: z.string(),
      username: z.string(),
      email: z.string().email().nullable(),
    }).openapi('User')
    
    export type User = z.infer<typeof UserSchema>  // 类型由 Schema 推导
    ```

*   **错误示例**:
    ```typescript
    // ❌ 不要在 types/ 中手写接口
    export interface User {
      id: string
      username: string
      email: string | null
    }
    
    // ❌ 然后在 schemas/ 中再写一遍
    export const UserSchema = z.object({ ... })
    ```

*   **优势**:
    *   **类型安全**: 验证规则与类型定义永不失同步
    *   **单一维护**: 修改 Schema 自动更新类型
    *   **运行时保障**: 编译时类型检查 + 运行时数据验证双重保障

### 4.2 DTO (Data Transfer Object)
*   **规范**: 必须使用 `@hono/zod-openapi` 定义 Schema 并添加元数据。
*   **详细指南**: 请参考 **[后端 API 开发工作流](./backend-api-workflow.md#step-1-在-shared-中定义-schema)**。

### 4.3 国际化 (i18n)

*   **翻译文件职责划分**:
    *   `packages/shared/src/i18n/`: 存放共享的 **validation 翻译**（如 `validation.password.min`）。
    *   `apps/server/src/shared/i18n/`: 存放后端 **业务模块翻译**（如 `auth.*`, `watchlist.*`, `oauth.*`）。
    *   前后端在初始化 i18next 时，合并 shared 翻译与本地翻译。
    *   **禁止**在前后端重复定义相同的翻译键。
*   **Shared Schema**: Zod Schema 中的 `message` 必须是 **Translation Key**，禁止硬编码自然语言。
    *   正例: `.min(5, 'validation.username_min')`
    *   反例: `.min(5, 'Username must be at least 5 characters')`
*   **Key 命名**: 使用层级结构 (如 `validation.password.min`)，避免扁平化。
*   **后端错误**:
    *   后端必须捕获所有 Zod 校验错误，并根据 `Accept-Language` 请求头将 Translation Key 翻译为最终文本返回（作为保底）。
    *   业务逻辑错误应抛出自定义 `AppError`，包含 `ErrorCode` 和翻译键。
    *   由 `app.onError()` 全局异常处理器统一转换为多语言响应。

### 4.4 类型定义与 Prisma 枚举 (types/ vs schemas/)

**核心原则**: 根据是否需要运行时验证划分目录职责

| 目录 | 用途 | 使用场景 |
|------|------|----------|
| `types/` | 纯枚举定义 (`as const` 模式) | 内部类型、不需要运行时验证 |
| `schemas/` | Zod Schema + 推导类型 | 需要运行时验证的 API 数据结构 |

#### 4.4.1 Prisma 枚举与 Zod Schema 的协同

当枚举同时存在于数据库和 API 时，采用 **Prisma → types → Zod** 的链式结构：

```
┌─────────────────┐
│ Prisma Schema   │  ← 数据来源（数据库真实类型）
│ enum FundType   │
└────────┬────────┘
         ↓
┌─────────────────┐
│ types/models.ts │  ← 导出 as const 常量 + 类型推导
│ FundType = {...}│
└────────┬────────┘
         ↓
┌─────────────────┐
│ schemas/*.ts    │  ← 使用 z.nativeEnum() 绑定 Prisma 类型
│ z.nativeEnum()  │
└─────────────────┘
```

**正确示例**:

```typescript
// ✅ prisma/schema.prisma (数据来源)
enum FundType {
  MONEY_NORMAL
  STOCK
  BOND_LONG
  // ...
}

// ✅ types/models.ts (导出常量 + 类型)
export const FundType = {
  MONEY_NORMAL: 'MONEY_NORMAL',
  STOCK: 'STOCK',
  BOND_LONG: 'BOND_LONG',
  // ...
} as const

export type FundType = typeof FundType[keyof typeof FundType]

// ✅ schemas/asset.ts (使用 z.nativeEnum)
import { FundType } from '../types/index.js'

export const AssetSearchResultSchema = z.object({
  fundType: z.nativeEnum(FundType).nullable().openapi({
    description: '场外基金类型',
  }),
})
```

#### 4.4.2 types/ 适用场景

*   **纯状态枚举**: `UserStatus`, `SocialProvider` 等不参与 API 验证的枚举
*   **数据库枚举映射**: Prisma enum 的 TypeScript 类型映射
*   **配置常量**: 不需要运行时验证的常量定义

```typescript
// ✅ 正确 - 纯枚举放 types/
export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const

export type UserStatus = typeof UserStatus[keyof typeof UserStatus]
```

#### 4.4.3 schemas/ 适用场景

*   **API 请求/响应**: 需要运行时验证的数据结构
*   **跨层数据传输**: Service → Controller 传递的数据对象
*   **外部接口契约**: 与前端共享的 API 类型定义

```typescript
// ✅ 正确 - API 数据结构放 schemas/
export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3),
  email: z.string().email(),
}).openapi('User')

export type User = z.infer<typeof UserSchema>
```

#### 4.4.4 何时定义在 Schema

| 场景 | 定义位置 | 原因 |
|------|----------|------|
| 数据库枚举用于 API 响应 | `types/` + `z.nativeEnum()` | 数据源是 Prisma |
| 纯内部状态枚举 | `types/` | 不需要运行时验证 |
| API 请求/响应 DTO | `schemas/` | 需要运行时验证 |
| 复杂对象结构 | `schemas/` | 需要验证规则 |

---

## 5. Git 与代码质量

### 5.1 提交规范
使用 **Angular 规范 (Conventional Commits)**：
*   `feat`: 新功能
*   `fix`: 修复 bug
*   `ui`: 样式更新
*   `chore`: 构建过程或辅助工具的变动
*   `refactor`: 代码重构

**示例**: `feat(auth): implement google oauth login`

### 5.2 环境变量
*   详细操作请参考 **[环境变量管理指南](../../docs/guide/env-management.md)**。
*   **严禁**提交 `.env` 文件。
*   维护 `.env.example` 文件，包含所有 Key 和示例值。
*   使用 `zod` 在应用启动时验证环境变量有效性。
