# 环境变量管理快速指南

## ✅ 已实施的方案

**核心思路**: 根目录统一维护 + 前缀区分 + 自动同步

```
根目录 .env (单一来源)
    ↓ 自动同步脚本
    ├─→ apps/server/.env (自动生成)
    ├─→ apps/web/.env (自动生成)
    └─→ infra/docker/.env (自动生成)
```

---

## 📝 使用方法

### 1. 修改环境变量

**只需编辑根目录 .env**:

```bash
vim .env
```

使用前缀区分应用：
- `SERVER_*` → apps/server
- `WEB_*` → apps/web
- 无前缀 → 共享变量

示例：
```bash
# 共享
NODE_ENV=development

# 后端专用
SERVER_PORT=3001
SERVER_JWT_SECRET=xxxxx

# 前端专用
WEB_PORT=3000
WEB_API_URL=http://localhost:3001
```

### 2. 同步环境变量

```bash
# 方式1: 手动同步
bun run sync-env

# 方式2: 自动同步 (dev/build 会自动执行)
bun run dev    # 自动同步后启动
bun run build  # 自动同步后构建
```

### 3. 验证配置

```bash
bun run check-env
```

输出示例：
```
🔍 检查环境变量...

📋 SHARED:
  ✅ NODE_ENV

📋 SERVER:
  ✅ DATABASE_URL
  ✅ REDIS_URL
  ✅ SERVER_JWT_SECRET
  ✅ SERVER_EMAIL_FROM

✨ 所有必需的环境变量已配置！
```

---

## 📂 生成的文件

### apps/server/.env (自动生成)

```bash
# ⚠️  此文件由 scripts/sync-env.ts 自动生成
# ⚠️  请勿直接修改，在根目录 .env 中修改后运行: bun run sync-env

# 共享配置
NODE_ENV=development
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379

# SERVER_前缀变量 (前缀已去除)
PORT=3001
JWT_SECRET=xxxxx
RESEND_API_KEY=xxxxx
```

### apps/web/.env (自动生成)

```bash
# ⚠️  此文件由 scripts/sync-env.ts 自动生成
# ⚠️  请勿直接修改，在根目录 .env 中修改后运行: bun run sync-env

# 共享配置
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# WEB_前缀变量 (前缀已去除)
PORT=3000
API_URL=http://localhost:3001
ENABLE_ANALYTICS=false
```

---

## 🐳 Docker Compose

Docker Compose 使用独立的 .env 文件（自动生成）：

```yaml
services:
  postgres:
    env_file:
      - .env  # infra/docker/.env (自动生成，仅包含 Docker 相关变量)
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

生成的 `infra/docker/.env` 内容：

```bash
# ⚠️  此文件由 scripts/sync-env.ts 自动生成
# ⚠️  请勿直接修改，在根目录 .env 中修改后运行: bun run sync-env

# 共享配置
POSTGRES_USER=cognikit
POSTGRES_PASSWORD=cognikit_dev_password
POSTGRES_DB=cognikit
DOCKER_POSTGRES_PORT=5432
DOCKER_REDIS_PORT=6379
```

---

## ⚙️ 可用命令

| 命令 | 功能 |
|------|------|
| `bun run sync-env` | 手动同步环境变量到子项目 |
| `bun run check-env` | 验证必需的环境变量是否配置 |
| `bun run dev` | 自动同步 + 启动开发服务器 |
| `bun run build` | 自动同步 + 构建生产版本 |

---

## 🎯 最佳实践

### ✅ 推荐做法

1. **修改变量**: 只编辑根目录 `.env`
2. **使用前缀**: 明确区分应用范围
   - `SERVER_PORT` → apps/server 的 PORT
   - `WEB_PORT` → apps/web 的 PORT
3. **自动同步**: 使用 `bun run dev` 自动同步
4. **提交示例**: 提交 `.env.example` 到 Git

### ❌ 避免做法

1. ❌ 不要直接编辑 `apps/server/.env`
2. ❌ 不要直接编辑 `apps/web/.env`
3. ❌ 不要提交 `.env` 到 Git
4. ❌ 不要在子项目 `.env` 中添加变量

---

## 📖 环境变量配置示例

### 根目录 .env

```bash
# =================================
# 共享配置
# =================================
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# =================================
# 数据库 (Server + Docker)
# =================================
DATABASE_URL=postgresql://cognikit:cognikit_dev_password@localhost:5432/cognikit
POSTGRES_USER=cognikit
POSTGRES_PASSWORD=cognikit_dev_password
POSTGRES_DB=cognikit

# =================================
# Redis
# =================================
REDIS_URL=redis://localhost:6379

# =================================
# 后端专用 (SERVER_* 前缀)
# =================================
SERVER_PORT=3001
SERVER_JWT_SECRET=your-secret-key-min-32-chars
SERVER_JWT_EXPIRES_IN=7d
SERVER_RESEND_API_KEY=re_xxxxxxxxxxxxx
SERVER_EMAIL_FROM=noreply@yourdomain.com

# OAuth
SERVER_GITHUB_CLIENT_ID=
SERVER_GITHUB_CLIENT_SECRET=
SERVER_GOOGLE_CLIENT_ID=
SERVER_GOOGLE_CLIENT_SECRET=

# =================================
# 前端专用 (WEB_* 前缀)
# =================================
WEB_PORT=3000
WEB_API_URL=http://localhost:3001
WEB_ENABLE_ANALYTICS=false

# =================================
# Docker
# =================================
DOCKER_POSTGRES_PORT=5432
DOCKER_REDIS_PORT=6379
```

---

## 🔧 工作流程

### 首次设置

```bash
# 1. 复制示例文件
cp .env.example .env

# 2. 编辑配置
vim .env

# 3. 同步到子项目
bun run sync-env

# 4. 验证配置
bun run check-env
```

### 日常开发

```bash
# 1. 修改环境变量 (根目录 .env)
vim .env

# 2. 启动开发 (自动同步)
bun run dev
```

### 添加新变量

```bash
# 1. 在根目录 .env 添加变量 (使用正确的前缀)
echo "SERVER_NEW_FEATURE=enabled" >> .env

# 2. 同步
bun run sync-env

# 3. 验证
cat apps/server/.env | grep NEW_FEATURE
```

---

## 🎓 进阶配置

### 添加新的子项目

编辑 `scripts/sync-env.ts`:

```typescript
const ENV_MAPPINGS = {
  'apps/server/.env': { ... },
  'apps/web/.env': { ... },
  'apps/mobile/.env': {  // 新增
    prefix: 'MOBILE_',
    shared: ['NODE_ENV', 'BACKEND_URL'],
    stripPrefix: true,
  },
}
```

### 自定义验证规则

编辑 `scripts/check-env.ts`:

```typescript
const REQUIRED_VARS = {
  shared: ['NODE_ENV'],
  server: ['DATABASE_URL', 'SERVER_JWT_SECRET', ...],
  web: ['WEB_API_URL'],  // 添加必需变量
}
```

---

## 📊 方案优势总结

| 优势 | 说明 |
|------|------|
| ✅ **单一来源** | 只需维护根目录 .env |
| ✅ **自动同步** | dev/build 自动执行，无需手动 |
| ✅ **类型安全** | TypeScript 脚本，可扩展 |
| ✅ **前缀隔离** | 清晰区分不同应用 |
| ✅ **Docker 友好** | 直接引用，无需复制 |
| ✅ **验证机制** | check-env 确保完整性 |

---

## 🐛 常见问题

### Q: 为什么子项目的 .env 有警告注释？

A: 这些文件是自动生成的，提醒不要直接修改。在根目录 .env 修改后会自动同步。

### Q: 可以在子项目添加变量吗？

A: 不推荐。应该在根目录 .env 添加，使用正确的前缀。

### Q: Git 是否忽略生成的 .env？

A: 是的，`.gitignore` 已配置忽略所有 .env 文件，但保留 .env.example。

### Q: 如何添加生产环境配置？

A: 创建 `.env.production` 并修改同步脚本支持多环境。

---

**维护人**: Sisyphus AI  
**最后更新**: 2026-01-17
