# 后端架构文档 (apps/server)

后端使用 Bun + Hono + Prisma 构建，采用 CLEAN Architecture，按业务功能组织代码。

## 技术栈

| 类别        | 技术                |
| ----------- | ------------------- |
| 运行时      | Bun                 |
| Web 框架    | Hono                |
| ORM         | Prisma              |
| 数据库      | PostgreSQL          |
| 缓存        | Redis               |
| 认证        | JWT + bcryptjs      |
| 邮件        | Resend / Nodemailer |
| API 文档    | hono-openapi        |
| HTTP 客户端 | Bun 原生 fetch      |
| 日志        | pino + pino-pretty  |
| 工具库      | Remeda, Zod         |

## 目录结构

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
│   ├── shared/             # 共享
│   │   ├── lib/           # 工具函数
│   │   ├── types/         # 类型定义
│   │   ├── i18n/          # 国际化
│   │   └── logging/       # 日志
│   │
│   ├── middleware/         # 全局中间件
│   ├── db/                 # 数据库
│   │   └── schema.prisma  # 统一 Schema
│   ├── redis/              # Redis
│   ├── config/             # 配置
│   └── main.ts             # 应用入口
└── package.json
```

## 核心模块

| 目录/文件                  | 说明                            |
| -------------------------- | ------------------------------- |
| `features/auth/`           | 认证功能 (登录、注册、找回密码) |
| `features/user/`           | 用户功能 (获取/更新用户信息)    |
| `middleware/auth.ts`       | JWT Token 验证中间件            |
| `middleware/rate-limit.ts` | 请求限流中间件                  |

## 日志系统

后端使用 `pino` 作为日志框架。

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

## Python 服务 (services/python-xxx)

Python 服务预留用于后续扩展（如数据分析、机器学习等）。

### 技术栈

| 类别     | 技术        |
| -------- | ----------- |
| Web 框架 | FastAPI     |
| 包管理   | uv          |
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
