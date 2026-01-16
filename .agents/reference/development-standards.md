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
*   **结构化日志**: 使用 `pino`。
    *   生产环境**严禁**使用 `console.log`。
    *   关键操作（登录、支付、修改）**必须**记录日志。
    *   格式：`log('event_name', { userId: '...', ...data })`。

### 3.3 数据库操作 (Prisma)
*   **Schema 命名**:
    *   表名使用 PascalCase (如 `User`, `LoginLog`)。
    *   字段名使用 camelCase (如 `firstName`)。
    *   每个表必须包含 `createdAt` 和 `updatedAt`。
*   **迁移管理**: 数据库变更**必须**通过 `prisma migrate` 生成迁移文件，**严禁**手动直接修改数据库结构。

---

## 4. 共享协作规范 (packages/shared)

### 4.1 DTO (Data Transfer Object)
*   所有的 API 请求参数和响应结构**必须**使用 **Zod** 定义 Schema，并导出 TypeScript 类型。
*   **位置**: `packages/shared/src/schemas/`。

**示例**:
```typescript
// packages/shared/src/schemas/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export type LoginRequest = z.infer<typeof loginSchema>;
```

### 4.2 国际化 (i18n)
*   **Key 命名**: 使用层级结构 (如 `auth.login.title`)，避免扁平化。
*   **后端错误**: 后端返回给前端的错误信息应包含 `error_code` 或 i18n key，而非直接返回文本。

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
*   **严禁**提交 `.env` 文件。
*   维护 `.env.example` 文件，包含所有 Key 和示例值。
*   使用 `zod` 在应用启动时验证环境变量有效性。
