# CogniKit

个人 AI 工具箱。

## 功能特性

- **用户认证** - 邮箱注册/登录、找回密码、OAuth (GitHub/Google)
- **数据存储** - PostgreSQL + Redis 缓存

---

## 项目组织

CogniKit 采用 **Turborepo** 管理的 Monorepo 结构，由以下部分组成：

| 部分 | 说明 | 端口 |
|------|------|------|
| `apps/web` | 前端应用 (React + Vite) | 3000 |
| `apps/server` | 后端服务 (Hono + Bun) | 3001 |
| `packages/shared` | 共享类型定义 | - |
| `services/python-xxx` | Python 服务 (预留) | 8080 |

### 服务架构

```
浏览器
    │
    ▼
┌─────────────────┐
│  React (Web)    │  ← 前端 (3000)
│  Vite + shadcn  │
└────────┬────────┘
         │ HTTP REST
         ▼
┌─────────────────┐
│  Hono (Server)  │  ← 后端 (3001)
│  Bun + Prisma   │
│  JWT + Redis    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Python Service  │     │   External API  │
│  (预留扩展)      │     │                 │
│  (8080)         │     │                 │
└─────────────────┘     └─────────────────┘
```

### 目录结构

```
cogni-kit/
├── apps/
│   ├── web/           # 前端应用
│   └── server/        # 后端服务
├── packages/
│   └── shared/        # 共享类型定义
├── services/
│   └── python-xxx/    # Python 服务 (预留)
├── infra/
│   └── docker/        # Docker 配置
├── .env.example
├── package.json
├── turbo.json
└── README.md
```

---

## 前端 (apps/web)

前端使用 React + Vite + shadcn/ui 构建。

### 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React + Vite |
| UI 组件 | shadcn/ui + Tailwind CSS |
| 路由 | React Router |
| 状态管理 | TanStack Query (服务端) + Zustand (客户端) |
| 表单 | React Hook Form + Zod |
| HTTP 客户端 | axios |
| 国际化 | react-i18next |
| 主题切换 | shadcn 内置 (next-themes) |
| 工具库 | Lucide React, date-fns, clsx |

### 目录结构

```
apps/web/
├── public/
│   └── locales/            # 国际化资源文件
│       ├── en/
│       │   └── translation.json
│       └── zh/
│           └── translation.json
├── src/
│   ├── components/        # UI 组件
│   │   ├── ui/           # shadcn 基础组件 (Button, Input...)
│   │   ├── forms/        # 业务表单组件
│   │   └── theme/        # 主题切换组件
│   ├── features/         # 功能模块
│   │   └── auth/         # 登录、注册相关
│   ├── pages/            # 页面组件
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── Dashboard.tsx
│   ├── lib/              # 工具函数
│   │   ├── api.ts        # axios 封装
│   │   └── utils.ts      # 通用工具
│   ├── i18n/             # 国际化配置
│   │   ├── index.ts      # i18n 实例
│   │   └── config.ts     # 语言配置
│   ├── stores/           # Zustand 状态
│   │   ├── useUserStore.ts
│   │   └── useThemeStore.ts  # 主题状态
│   ├── hooks/            # 自定义 Hooks
│   ├── App.tsx
│   └── main.tsx
├── components.json       # shadcn 配置
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

### 国际化

前端使用 `react-i18next` 实现国际化：

```bash
bun add react-i18next i18next i18next-http-backend i18next-browser-languagedetector
```

```typescript
// src/i18n/config.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh'],
    interpolation: { escapeValue: false },
  })

export default i18n
```

```typescript
// src/main.tsx
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/config'

root.render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
)
```

```typescript
// src/pages/Login.tsx
import { useTranslation } from 'react-i18next'

export function Login() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('auth.login.title')}</h1>
      <input placeholder={t('auth.login.email')} />
    </div>
  )
}
```

### 主题切换

shadcn 内置支持主题切换，使用 `next-themes`：

```bash
# shadcn init 后自动安装
bunx shadcn@latest add switch
```

```typescript
// src/components/theme/ThemeSwitch.tsx
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-1" />
    </Button>
  )
}
```

### 核心模块

| 目录 | 说明 |
|------|------|
| `components/ui` | shadcn 基础组件，原子化 |
| `features/auth` | 认证相关业务逻辑 (登录、注册、找回密码) |
| `lib/api.ts` | axios 实例 + 请求封装 |
| `stores/` | 全局状态 (用户信息、主题等) |

---

## 后端 (apps/server)

后端使用 Bun + Hono + Prisma 构建，采用 CLEAN Architecture，按业务功能组织代码。

### 技术栈

| 类别 | 技术 |
|------|------|
| 运行时 | Bun |
| Web 框架 | Hono |
| ORM | Prisma |
| 数据库 | PostgreSQL |
| 缓存 | Redis |
| 认证 | JWT + bcryptjs |
| 邮件 | Resend / Nodemailer |
| API 文档 | hono-openapi |
| HTTP 客户端 | Bun 原生 fetch |
| 日志 | pino + pino-pretty |
| 国际化 | i18next |
| 工具库 | Remeda, Zod |

### 目录结构

```
apps/server/
├── src/
│   ├── features/            # 按业务功能划分
│   │   ├── auth/           # 认证功能
│   │   │   ├── routes.ts   # API 路由
│   │   │   ├── service.ts  # 业务逻辑
│   │   │   └── dto.ts      # 请求/响应对象
│   │   │
│   │   └── user/           # 用户功能
│   │       ├── routes.ts
│   │       ├── service.ts
│   │       └── dto.ts
│   │
│   ├── shared/             # 共享
│   │   ├── lib/           # 工具函数
│   │   ├── types/         # 类型定义
│   │   ├── constants.ts   # 常量
│   │   ├── i18n/          # 国际化
│   │   │   ├── locales/   # 翻译文件
│   │   │   │   ├── en.json
│   │   │   │   └── zh.json
│   │   │   └── index.ts   # i18n 配置
│   │   └── logging/       # 日志
│   │       ├── index.ts   # pino 实例
│   │       └── logger.ts  # 封装
│   │
│   ├── middleware/         # 全局中间件
│   │   ├── auth.ts        # JWT 验证
│   │   ├── cors.ts        # CORS
│   │   └── rate-limit.ts  # 限流
│   │
│   ├── db/                 # 数据库
│   │   ├── index.ts       # Prisma Client
│   │   └── schema.prisma  # 统一 Schema
│   │
│   ├── redis/              # Redis
│   │   └── index.ts
│   │
│   ├── config/             # 配置
│   └── main.ts             # 应用入口
│
└── package.json
```

### 日志系统

后端使用 `pino` 作为日志框架：

```bash
bun add pino pino-pretty
```

```typescript
// src/shared/logging/index.ts
import { createLogger } from 'pino'

const isDev = process.env.NODE_ENV === 'development'

export const logger = createLogger({
  level: isDev ? 'debug' : 'info',
  transport: isDev
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
})
```

```typescript
// src/shared/logging/logger.ts
import { logger } from './index'
import { context } from 'hono/context'

type LogContext = {
  event: string
  [key: string]: unknown
}

export function log(event: string, data?: LogContext) {
  logger.info({ event, ...data })
}

export function logError(event: string, error: Error, data?: LogContext) {
  logger.error({ event, error: error.message, stack: error.stack, ...data })
}
```

```typescript
// src/features/auth/service.ts
import { log, logError } from '@/shared/logging/logger'

export const authService = {
  async login(params: LoginParams) {
    try {
      log('login_start', { email: params.email })
      
      // 业务逻辑...
      
      log('login_success', { email: params.email })
      return { token, user }
    } catch (error) {
      logError('login_error', error as Error, { email: params.email })
      throw error
    }
  },
}
```

### 国际化

后端使用 `i18next` 实现错误消息和验证消息的国际化：

```bash
bun add i18next
```

```typescript
// src/shared/i18n/index.ts
import i18next from 'i18next'

await i18next.init({
  lng: 'zh',
  resources: {
    zh: {
      translation: {
        auth: {
          invalid_code: '验证码错误',
          email_required: '邮箱不能为空',
          user_not_found: '用户不存在',
        },
      },
    },
    en: {
      translation: {
        auth: {
          invalid_code: 'Invalid verification code',
          email_required: 'Email is required',
          user_not_found: 'User not found',
        },
      },
    },
  },
})

export const t = i18next.t
```

```typescript
// src/shared/i18n/getlang.ts
import { context } from 'hono/context'

export function getLang(): string {
  return context.get('lang') || 'zh'
}
```

```typescript
// src/middleware/i18n.ts
import { context } from 'hono/context'

export const i18nMiddleware = async (c: Context, next: Next) => {
  const lang = c.req.header('Accept-Language')?.split(',')[0] || 'zh'
  context.set('lang', lang)
  await next()
}
```

```typescript
// src/features/auth/service.ts
import { t, getLang } from '@/shared/i18n'

export const authService = {
  async login(params: LoginParams) {
    const lang = getLang()
    
    // 验证
    const isValid = await verifyCode(params.email, params.code)
    if (!isValid) {
      throw new Error(t('auth.invalid_code', { lng: lang }))
    }
    
    // ...
  },
}
```

### 核心模块

| 目录/文件 | 说明 |
|-----------|------|
| `features/auth/` | 认证功能 (登录、注册、找回密码) |
| `features/user/` | 用户功能 (获取/更新用户信息) |
| `middleware/auth.ts` | JWT Token 验证中间件 |
| `middleware/rate-limit.ts` | 请求限流中间件 |
| `db/schema.prisma` | 数据库 Schema 定义 |

### 功能模块示例

```typescript
// features/auth/routes.ts
import { Hono } from 'hono'
import { z } from 'zod'
import { authService } from './service'
import { loginSchema, registerSchema } from './dto'

const auth = new Hono()

// POST /auth/login
auth.post('/login', async (c) => {
  const body = await c.req.json()
  const data = loginSchema.parse(body)
  const result = await authService.login(data)
  return c.json(result)
})

// POST /auth/register
auth.post('/register', async (c) => {
  const body = await c.req.json()
  const data = registerSchema.parse(body)
  const result = await authService.register(data)
  return c.json(result)
})

export { auth }
```

```typescript
// features/auth/service.ts
import { prisma } from '@/db'
import { sendEmailCode } from '@/shared/email'
import { generateCode } from '@/shared/lib'
import type { LoginParams, RegisterParams } from './dto'

export const authService = {
  async login(params: LoginParams) {
    // 验证验证码...
    // 签发 JWT...
    return { token, user }
  },

  async register(params: RegisterParams) {
    // 生成验证码...
    // 发送邮件...
    return { success: true }
  },
}
```

```typescript
// features/auth/dto.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
})

export const registerSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  name: z.string().min(2).max(50),
})

export type LoginParams = z.infer<typeof loginSchema>
export type RegisterParams = z.infer<typeof registerSchema>
```

---

## Python 服务 (services/python-xxx)

Python 服务预留用于后续扩展（如数据分析、机器学习等）。

### 技术栈

| 类别 | 技术 |
|------|------|
| Web 框架 | FastAPI |
| 包管理 | uv |
| 定时任务 | APScheduler |

### 目录结构

```
services/python-xxx/
├── main.py                # FastAPI 入口
├── routers/               # API 路由
├── tasks/                 # 定时任务
├── pyproject.toml
└── .env
```

---

## 共享包 (packages/shared)

共享类型定义，供前端和后端引用，确保类型一致。

### 目录结构

```
packages/shared/
├── src/
│   ├── types/             # 类型定义
│   │   ├── auth.ts        # 认证相关类型
│   │   └── user.ts        # 用户相关类型
│   └── utils.ts           # 共享工具
└── package.json
```

### 类型示例

```typescript
// packages/shared/src/types/auth.ts
export interface LoginParams {
  email: string
  code: string  // 邮箱验证码
}

export interface LoginResponse {
  token: string
  user: User
}

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
}
```

---

## 数据库模型

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum AuthProvider {
  email
  github
  google
}

model User {
  id             String      @id @default(uuid())
  email          String      @unique
  passwordHash   String?
  name           String?
  avatarUrl      String?
  provider       AuthProvider @default(email)
  emailVerified  Boolean     @default(false)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  sessions       Session[]
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model EmailCode {
  id        String    @id @default(uuid())
  email     String
  code      String
  type      String    // register, login, reset_password
  expiresAt DateTime
  usedAt    DateTime?
}
```

### 模型说明

| 表 | 说明 |
|---|------|
| User | 用户表，存储用户基本信息 |
| Session | 会话表，存储 JWT token |
| EmailCode | 验证码表，存储邮箱验证码 |

> **注意**: 数据库 Schema 定义在 `db/schema.prisma` 文件中。

---

## 认证流程

| 场景 | 流程 |
|------|------|
| **邮箱注册** | 输入邮箱 → 发送 6 位验证码 → 验证成功 → 创建账户 |
| **邮箱登录** | 输入邮箱 → 发送验证码 → 验证成功 → 签发 JWT |
| **密码登录** | 输入邮箱密码 → 验证 bcrypt → 签发 JWT |
| **找回密码** | 输入邮箱 → 发送重置链接 → 点击链接 → 设置新密码 |
| **OAuth 登录** | 点击 GitHub/Google → 授权回调 → 绑定或创建账户 → 签发 JWT |

---

## 初始化命令

### 前端

```bash
# 创建 Vite + React + TypeScript 项目
bun create vite apps/web --template react-ts

# 安装 shadcn/ui
bunx shadcn@latest init

# 添加必要组件
bunx shadcn@latest add button input card form toast dropdown-menu avatar label checkbox select switch

# 安装依赖
bun add react-router @tanstack/react-query zustand react-hook-form @hookform/resolvers zod lucide-react date-fns clsx tailwind-merge class-variance-authority axios

# 安装国际化
bun add react-i18next i18next i18next-http-backend i18next-browser-languagedetector
```

### 后端

```bash
# 创建目录
mkdir -p apps/server/src/{features,shared,db,redis,config}
mkdir -p apps/server/src/shared/{lib,types,i18n,logging}
mkdir -p apps/server/prisma

# 初始化 package.json
cd apps/server
bun init -y

# 安装依赖
bun add hono @hono/node-server @prisma/client ioredis jsonwebtoken bcryptjs resend zod remeda cron-parser i18next
bun add -D prisma bun-types typescript @types/bcryptjs @types/jsonwebtoken pino pino-pretty

# 初始化 Prisma
bunx prisma init

# 安装 hono-openapi
bun add hono-openapi
```

### Python 服务 (预留)

```bash
# 安装 uv (如果未安装)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 创建目录
mkdir -p services/python-xxx/{routers,tasks}

# 初始化项目 (使用 uv)
cd services/python-xxx
uv init .

# 添加依赖
uv add fastapi uvicorn[standard] pandas apscheduler python-dotenv pydantic

# 开发模式运行
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

---

## 开发命令

### Monorepo 统一命令（推荐）

```bash
# 一键启动所有服务（前端 + 后端，使用 Turborepo）
bun run dev

# 构建所有项目
bun run build

# 类型检查所有项目
bun run type-check

# Lint 所有代码
bun run lint

# 清理所有构建产物和依赖
bun run clean
```

### 单独启动服务

```bash
# 仅启动前端 (http://localhost:5173)
cd apps/web && bun run dev

# 仅启动后端 (http://localhost:3001)
cd apps/server && bun run dev

# 仅启动 Python 服务
cd services/python-xxx && uv run uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

### 数据库相关命令

```bash
cd apps/server

# 生成 Prisma Client
bunx prisma generate

# 同步 schema 到数据库（开发环境）
bunx prisma db push

# 创建迁移文件（生产环境）
bunx prisma migrate dev

# 打开 Prisma Studio（可视化数据库管理）
bunx prisma studio
```

### 其他常用命令

```bash
# 添加 shadcn/ui 组件
cd apps/web && bunx shadcn@latest add <component-name>

# 查看项目依赖
bun pm ls

# 更新所有依赖
bun update

# 运行 TypeScript 类型检查
bun run type-check
```

---

## 部署

```bash
# Docker Compose 部署
docker-compose up -d
```


---

## 快速开始

### 1. 安装依赖

```bash
# 安装所有 Workspace 的依赖
bun install
```

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，配置数据库连接等
```

### 3. 初始化数据库

```bash
cd apps/server

# 运行数据库迁移
bunx prisma migrate dev --name init

# 生成 Prisma Client
bunx prisma generate
```

### 4. 启动开发服务器

```bash
# 回到根目录，一键启动所有服务
cd ../..
bun run dev
```

访问：
- **前端**: http://localhost:5173
- **后端 API**: http://localhost:3001
- **后端健康检查**: http://localhost:3001/health

---

## Monorepo 特性

本项目使用 **Turborepo** 进行 Monorepo 管理，具备以下特性：

- ✅ **并行执行**：同时启动/构建多个项目
- ✅ **智能缓存**：只重新构建变更的部分，速度提升 10x+
- ✅ **依赖感知**：自动按正确顺序构建（shared → apps）
- ✅ **增量构建**：大幅缩短开发反馈周期
- ✅ **统一工具链**：全栈统一使用 Bun

详细配置见：`turbo.json`

