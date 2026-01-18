# AGENTS.md - AI 编码代理指南

> 为在 cogni-kit 代码库中工作的 AI 代理提供上下文。

## 项目概述

**CogniKit** 是一个全栈 Monorepo 项目（Turborepo + Bun）：
- **前端**: React + Vite + shadcn/ui + TailwindCSS (`apps/web`)
- **后端**: Hono + Bun + Prisma + PostgreSQL + Redis (`apps/server`)
- **共享包**: 类型、Schema、常量 (`packages/shared`)

## 构建/检查/测试命令

```bash
# 根目录（Turborepo）
bun install              # 安装所有依赖
bun run dev              # 启动所有服务（自动同步环境变量）
bun run build            # 构建所有包
bun run type-check       # 全栈 TypeScript 类型检查
bun run lint             # 全栈 ESLint 检查

# 后端（apps/server）
bun run --filter server dev           # 启动开发服务器（热重载）
bun run --filter server type-check    # 类型检查
bun run --filter server db:push       # 推送 Schema 到数据库（开发环境）
bun run --filter server db:migrate    # 运行数据库迁移（生产环境）
bun run --filter server db:generate   # 重新生成 Prisma Client

# 前端（apps/web）
bun run --filter web dev              # 启动 Vite 开发服务器
bun run --filter web type-check       # 类型检查

# 测试（目前未配置测试框架，添加后使用：）
bun test                              # 运行所有测试
bun test path/to/file.test.ts         # 运行单个测试文件
```

## 代码风格指南

### TypeScript（严格模式）
- `strict: true`、`noUncheckedIndexedAccess: true`、`noImplicitOverride: true`
- **禁止使用** `any`、`@ts-ignore`、`@ts-expect-error`

### 导入规范

```typescript
// 后端（apps/server）- 本地导入必须使用 .js 扩展名（ESM 规范）
import { prisma } from '../../shared/db.js'
import { UserStatus, type User } from 'shared'

// 前端（apps/web）- 使用 @/ 路径别名
import { Button } from "@/components/ui/button"
import { type User } from 'shared'
```

### 命名规范

| 元素 | 规范 | 示例 |
|------|------|------|
| 变量/函数 | camelCase | `sendVerificationCode` |
| React 组件 | PascalCase | `ThemeSwitch` |
| 类型/接口 | PascalCase | `User`、`ApiError` |
| 枚举 | PascalCase + SCREAMING_SNAKE | `UserStatus.ACTIVE` |
| 常量 | SCREAMING_SNAKE_CASE | `TOKEN_CONFIG` |
| 文件（组件） | PascalCase | `ThemeSwitch.tsx` |
| 文件（工具） | kebab-case | `error-handler.ts` |

### Zod 验证（packages/shared/src/schemas/）

**重要**: 项目采用 **Schema 优先架构**，所有数据类型由 Zod Schema 作为单一数据源。

```typescript
import { z } from '@hono/zod-openapi'

// 定义 Schema
export const loginSchema = z.object({
  account: z.string().min(1, 'Account is required'),
  password: z.string().min(1, 'Password is required'),
}).openapi('LoginRequest')

// 通过 z.infer 推导类型（禁止手写接口）
export type LoginRequest = z.infer<typeof loginSchema>

// 路由中使用：
const data = loginSchema.parse(await c.req.json())  // 验证失败时抛出 ZodError
```

**类型导入规范**:
- ✅ 数据模型类型（User, TokenPair, AuthResponse 等）从 `shared` 导出（它们在 `schemas/` 中通过 `z.infer` 推导）
- ✅ 枚举定义（UserStatus, SocialProvider 等）从 `shared` 导出（它们在 `types/` 中定义）
- ❌ 禁止在 `types/` 中手写数据模型接口后再在 `schemas/` 中重复定义 Schema

### 错误处理（后端）

```typescript
// Service 层 - 抛出具体错误信息
if (!user) throw new Error('User not found')

// 中间件自动将错误信息映射为 API 错误码
// 参见：apps/server/src/middleware/error-handler.ts
```

### 日志记录

```typescript
import { logger } from '../shared/logger.js'

logger.info({ userId: user.id, email }, 'User registered')
logger.error({ error: error.message, stack: error.stack }, 'Request error')
```

### API 响应格式

```typescript
return c.json({ user, tokens })                    // 成功，返回数据
return c.json({ success: true, message: 'Done' })  // 简单成功响应
return c.body(null, 204)                           // 无内容
return c.json({ code: ErrorCode.USER_NOT_FOUND, message: 'User not found' }, 404)  // 错误
```

## 项目架构

```
apps/server/src/
├── features/           # 业务功能模块（auth、user、oauth）
│   └── auth/
│       ├── routes.ts   # HTTP 路由处理（Hono）
│       └── service.ts  # 业务逻辑
├── middleware/         # 全局中间件（auth、error-handler、rate-limit）
├── shared/             # 共享工具（db、logger、i18n、lib/）
├── config/             # 配置（使用 Zod 验证环境变量）
└── main.ts             # 应用入口

apps/web/src/
├── components/ui/      # shadcn 组件（请勿直接修改）
├── features/           # 功能模块
├── lib/                # 工具函数
├── stores/             # Zustand 状态管理
└── hooks/              # 自定义 Hooks

packages/shared/src/
├── types/              # 纯枚举定义（as const 模式）和内部类型
├── schemas/            # Zod Schema 定义 + z.infer 推导的类型（数据模型的单一数据源）
├── constants/          # 共享常量
└── utils/              # 共享工具函数
```

## 环境变量

**重要**：只修改根目录 `.env` 文件，子项目的 `.env` 文件会自动生成。

前缀规则：
- `SERVER_*` → 仅后端使用
- `WEB_*` → 仅前端使用
- 无前缀 → 共享变量

```bash
bun run sync-env  # 手动同步（或直接 `bun run dev` 自动同步）
```

## 关键依赖库

| 包 | 用途 |
|----|------|
| Hono | Web 框架（https://hono.dev） |
| Prisma | ORM（https://prisma.io/docs） |
| Zod | 数据验证（https://zod.dev） |
| shadcn/ui | UI 组件（https://ui.shadcn.com） |
| TanStack Query | 服务端状态管理 |
| Zustand | 客户端状态管理 |
| pino | 日志记录 |

## 常见模式

### 添加后端功能
1. 创建 `apps/server/src/features/[name]/`，包含 `routes.ts` + `service.ts`
2. 在 `main.ts` 中挂载路由：`app.route('/[name]', [name])`
3. 在 `packages/shared/` 中添加共享类型/Schema

### 添加前端功能
1. 创建 `apps/web/src/features/[name]/`
2. 在该目录下添加组件、Hooks、API 调用
3. 使用 TanStack Query 进行数据获取

### 数据库变更
1. 编辑 `apps/server/prisma/schema.prisma`
2. 运行 `bun run --filter server db:push`（开发）或 `db:migrate`（生产）
3. 运行 `bun run --filter server db:generate` 更新 Prisma Client 类型
