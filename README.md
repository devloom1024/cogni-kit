# CogniKit

**个人 AI 工具箱** - 一个基于 Turborepo 的全栈单体仓库 (Monorepo) 项目。

## ✨ 核心特性

- **现代全栈**：React (Vite) + Hono (Bun) + PostgreSQL
- **完整认证**：邮箱注册/登录、OAuth (GitHub/Google)、密码找回
- **极致性能**：Bun 运行时、Redis 缓存、Turborepo 增量构建
- **开发体验**：TypeScript 全栈类型安全、Clean Architecture 架构

## 🛠️ 技术栈

| 部分         | 技术方案                             | 端口   |
| ------------ | ------------------------------------ | ------ |
| **Frontend** | React, Vite, shadcn/ui, TailwindCSS  | `3000` |
| **Backend**  | Hono, Bun, Prisma, PostgreSQL, Redis | `3001` |
| **Shared**   | TypeScript Types (Packages)          | -      |
| **Infra**    | Docker, Turborepo                    | -      |

## 🚀 快速开始

### 1. 安装依赖

```bash
bun install
```

### 2. 环境配置

本项目统一在根目录管理环境变量。

```bash
cp .env.example .env
```

编辑 `.env` 文件。**注意**：项目使用前缀区分变量范围（`SERVER_` 用于后端，`WEB_` 用于前端）。

> 📖 **详细指南**：请阅读 [环境变量管理指南](docs/guide/env-management.md) 了解配置细节及自动同步机制。

### 3. 初始化数据库

```bash
# 启动数据库容器 (需要使用 -f 指定文件路径)
docker-compose -f infra/docker/docker-compose.yml up -d

# 推送 Schema
bun run --filter server db:push
```

### 4. 启动开发

```bash
# 回到根目录，一键启动所有服务 (Web + Server)
bun run dev
```

访问：
- 前端: [http://localhost:3000](http://localhost:3000) (或 5173，视 Vite 配置而定)
- 后端: [http://localhost:3001](http://localhost:3001)

## 📚 文档导航

为了保持 README 的整洁，详细的技术文档已移至 `docs/` 目录：

- **架构设计**
  - [前端架构 (apps/web)](docs/architecture/frontend.md) - 目录结构、主题、路由
  - [后端架构 (apps/server)](docs/architecture/backend.md) - Clean架构、日志、错误处理

- **功能指南**
  - [OAuth 2.0 配置指南](docs/guide/oauth-configuration.md) - GitHub/Google OAuth 登录配置

## 📦 常用命令

| 命令                                  | 说明                                   |
| ------------------------------------- | -------------------------------------- |
| **项目管理**                          |                                        |
| `bun run dev`                         | 启动开发环境 (全栈 + 自动同步环境变量) |
| `bun run build`                       | 构建生产版本                           |
| `bun run type-check`                  | 全栈类型检查                           |
| `bun run sync-env`                    | 手动同步环境变量到子项目               |
| **数据库 (Apps/Server)**              | *也可以进入 apps/server 目录运行*      |
| `bun run --filter server db:migrate`  | 执行数据库迁移 (Prisma Migrate)        |
| `bun run --filter server db:push`     | 推送 Schema 到数据库 (开发环境推荐)    |
| `bun run --filter server db:studio`   | 打开数据库管理界面 (Prisma Studio)     |
| `bun run --filter server db:generate` | 重新生成 Prisma Client                 |

---
Monorepo powered by [Turborepo](https://turbo.build/repo).
