# Prisma 7 配置修复总结

## 问题
- 原始 `schema.prisma` 缺少数据源 URL 配置
- Prisma 7 改变了配置方式，不再在 schema 文件中使用 `url = env("DATABASE_URL")`

## 解决方案

### 1. 更新 schema.prisma
```prisma
datasource db {
  provider = "postgresql"
  // 不再需要 url 字段
}
```

### 2. 创建 prisma.config.ts
Prisma 7 需要单独的配置文件来管理数据源连接：

```typescript
import { defineConfig, env } from 'prisma/config'
import 'dotenv/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

### 3. 安装必需依赖
```bash
bun add @prisma/adapter-pg dotenv pg
```

### 4. 使用 Database Adapter
在代码中使用 `@prisma/adapter-pg` 连接数据库（已在 `src/shared/db.ts` 实现）：

```typescript
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })
```

## 验证
```bash
# 验证 schema
bunx prisma validate
# ✅ The schema at prisma/schema.prisma is valid 🚀

# 生成 Prisma Client
bunx prisma generate
# ✅ Generated Prisma Client (v7.2.0)
```

## 环境变量同步修复

同时修复了 Docker Compose 的环境变量同步问题：

### 问题
- `docker-compose.yml` 引用根目录 `.env`，但同步脚本未生成 `infra/docker/.env`

### 解决方案
1. 更新 `scripts/sync-env.ts`，添加 Docker 配置映射：
```typescript
'infra/docker/.env': {
  prefix: '',
  shared: [
    'POSTGRES_USER',
    'POSTGRES_PASSWORD', 
    'POSTGRES_DB',
    'DOCKER_POSTGRES_PORT',
    'DOCKER_REDIS_PORT',
  ],
  stripPrefix: false,
}
```

2. 更新 `docker-compose.yml`，使用本地 `.env`：
```yaml
services:
  postgres:
    env_file:
      - .env  # 使用 infra/docker/.env（自动生成）
```

3. 移除过时的 `version: '3.8'`（Docker Compose 新版本不再需要）

## 测试结果
✅ 环境变量同步成功
✅ Docker Compose 配置验证通过
✅ Prisma schema 验证通过
✅ Prisma Client 生成成功

## 参考文档
- [Prisma Hono Integration Guide](https://www.prisma.io/docs/guides/hono)
- [Prisma 7 Configuration](https://pris.ly/d/config-datasource)
- [Database Drivers](https://www.prisma.io/docs/orm/overview/databases/database-drivers)

---

**修复时间**: 2026-01-17  
**Prisma 版本**: 7.2.0  
**状态**: ✅ 完成
