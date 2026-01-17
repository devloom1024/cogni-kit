# 环境变量管理方案

## 📋 问题分析

当前项目结构：
```
cogni-kit/
├── .env                    # 根目录
├── apps/web/.env          # 前端需要
├── apps/server/.env       # 后端需要
└── infra/docker/          # Docker Compose 需要
```

**痛点**：
- ❌ 多个 .env 文件需要同步维护
- ❌ 容易遗漏或不一致
- ❌ 增加维护成本

---

## ✅ 推荐方案：环境变量前缀 + Turborepo + 脚本

### 核心思路

1. **根目录统一维护** `.env`
2. **使用前缀区分** 不同应用的变量
3. **Turborepo 自动继承** 共享变量
4. **脚本工具辅助** 验证和同步

---

## 🎯 方案实施

### 1. 根目录 .env 文件结构

```bash
# =================================
# 共享配置 (所有应用都可访问)
# =================================
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# =================================
# 数据库配置 (Server + Docker)
# =================================
DATABASE_URL=postgresql://cognikit:cognikit_dev_password@localhost:5432/cognikit?schema=public
POSTGRES_USER=cognikit
POSTGRES_PASSWORD=cognikit_dev_password
POSTGRES_DB=cognikit

# =================================
# Redis 配置 (Server + Docker)
# =================================
REDIS_URL=redis://localhost:6379

# =================================
# 后端专用配置 (SERVER_* 前缀)
# =================================
SERVER_PORT=3001
SERVER_JWT_SECRET=dev-secret-key-please-change-in-production-minimum-32-characters
SERVER_JWT_EXPIRES_IN=7d
SERVER_RESEND_API_KEY=your-resend-api-key
SERVER_EMAIL_FROM=noreply@yourdomain.com

# OAuth (Server)
SERVER_GITHUB_CLIENT_ID=
SERVER_GITHUB_CLIENT_SECRET=
SERVER_GOOGLE_CLIENT_ID=
SERVER_GOOGLE_CLIENT_SECRET=

# =================================
# 前端专用配置 (WEB_* 前缀)
# =================================
WEB_PORT=3000
WEB_API_URL=http://localhost:3001
WEB_ENABLE_ANALYTICS=false

# =================================
# Docker 专用配置
# =================================
DOCKER_POSTGRES_PORT=5432
DOCKER_REDIS_PORT=6379
```

### 2. Turborepo 配置 (turbo.json)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": [
    "NODE_ENV",
    "FRONTEND_URL",
    "BACKEND_URL"
  ],
  "pipeline": {
    "dev": {
      "cache": false,
      "persistent": true,
      "env": [
        "DATABASE_URL",
        "REDIS_URL",
        "SERVER_*",
        "WEB_*"
      ]
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "env": [
        "NODE_ENV",
        "DATABASE_URL",
        "REDIS_URL",
        "SERVER_*",
        "WEB_*"
      ]
    }
  }
}
```

### 3. Docker Compose 配置

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: cognikit-postgres
    restart: unless-stopped
    env_file:
      - ../../.env  # 直接引用根目录 .env
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "${DOCKER_POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: cognikit-redis
    restart: unless-stopped
    ports:
      - "${DOCKER_REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 4. 环境变量同步脚本

创建 `scripts/sync-env.ts`：

```typescript
#!/usr/bin/env bun

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const ROOT_DIR = resolve(import.meta.dir, '..')
const ROOT_ENV = resolve(ROOT_DIR, '.env')

const ENV_MAPPINGS = {
  'apps/server/.env': {
    prefix: 'SERVER_',
    shared: ['NODE_ENV', 'DATABASE_URL', 'REDIS_URL'],
    stripPrefix: true, // SERVER_PORT -> PORT
  },
  'apps/web/.env': {
    prefix: 'WEB_',
    shared: ['NODE_ENV', 'FRONTEND_URL', 'BACKEND_URL'],
    stripPrefix: true, // WEB_PORT -> PORT
  },
}

function parseEnv(content: string): Record<string, string> {
  const env: Record<string, string> = {}
  
  content.split('\n').forEach(line => {
    line = line.trim()
    if (!line || line.startsWith('#')) return
    
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      env[match[1]] = match[2]
    }
  })
  
  return env
}

function syncEnv() {
  if (!existsSync(ROOT_ENV)) {
    console.error('❌ 根目录 .env 文件不存在')
    process.exit(1)
  }

  const rootEnv = parseEnv(readFileSync(ROOT_ENV, 'utf-8'))
  
  console.log('🔄 开始同步环境变量...\n')

  Object.entries(ENV_MAPPINGS).forEach(([targetPath, config]) => {
    const fullPath = resolve(ROOT_DIR, targetPath)
    const envLines: string[] = []
    
    // 添加注释
    envLines.push('# ⚠️  此文件由 scripts/sync-env.ts 自动生成')
    envLines.push('# ⚠️  请勿直接修改，在根目录 .env 中修改后运行: bun run sync-env')
    envLines.push('')
    
    // 添加共享变量
    if (config.shared.length > 0) {
      envLines.push('# 共享配置')
      config.shared.forEach(key => {
        if (rootEnv[key]) {
          envLines.push(`${key}=${rootEnv[key]}`)
        }
      })
      envLines.push('')
    }
    
    // 添加前缀变量
    envLines.push(`# ${config.prefix} 前缀变量`)
    Object.entries(rootEnv).forEach(([key, value]) => {
      if (key.startsWith(config.prefix)) {
        const newKey = config.stripPrefix 
          ? key.substring(config.prefix.length)
          : key
        envLines.push(`${newKey}=${value}`)
      }
    })
    
    writeFileSync(fullPath, envLines.join('\n') + '\n')
    console.log(`✅ 已同步: ${targetPath}`)
  })
  
  console.log('\n✨ 环境变量同步完成！')
}

syncEnv()
```

### 5. Package.json 脚本

根目录 `package.json`:

```json
{
  "scripts": {
    "sync-env": "bun run scripts/sync-env.ts",
    "dev": "bun run sync-env && turbo dev",
    "build": "bun run sync-env && turbo build",
    "check-env": "bun run scripts/check-env.ts"
  }
}
```

### 6. 环境变量验证脚本

创建 `scripts/check-env.ts`：

```typescript
#!/usr/bin/env bun

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const ROOT_DIR = resolve(import.meta.dir, '..')
const ROOT_ENV = resolve(ROOT_DIR, '.env')

const REQUIRED_VARS = {
  shared: ['NODE_ENV', 'FRONTEND_URL', 'BACKEND_URL'],
  server: ['DATABASE_URL', 'REDIS_URL', 'SERVER_JWT_SECRET'],
  web: ['WEB_API_URL'],
}

function checkEnv() {
  if (!existsSync(ROOT_ENV)) {
    console.error('❌ 根目录 .env 文件不存在')
    console.log('💡 请从 .env.example 复制: cp .env.example .env')
    process.exit(1)
  }

  const content = readFileSync(ROOT_ENV, 'utf-8')
  const env: Record<string, string> = {}
  
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      env[match[1].trim()] = match[2].trim()
    }
  })

  let hasError = false

  console.log('🔍 检查环境变量...\n')

  Object.entries(REQUIRED_VARS).forEach(([category, vars]) => {
    console.log(`📋 ${category.toUpperCase()}:`)
    
    vars.forEach(varName => {
      const prefixedName = category === 'server' 
        ? varName.startsWith('SERVER_') ? varName : `SERVER_${varName}`
        : category === 'web'
        ? varName.startsWith('WEB_') ? varName : `WEB_${varName}`
        : varName
      
      const value = env[varName] || env[prefixedName]
      
      if (!value || value === 'your-' + varName.toLowerCase()) {
        console.log(`  ❌ ${varName} - 未配置或使用默认值`)
        hasError = true
      } else {
        console.log(`  ✅ ${varName}`)
      }
    })
    console.log('')
  })

  if (hasError) {
    console.log('⚠️  请配置缺失的环境变量')
    process.exit(1)
  } else {
    console.log('✨ 所有必需的环境变量已配置！')
  }
}

checkEnv()
```

---

## 📝 使用指南

### 日常开发流程

1. **首次设置**
   ```bash
   # 从示例文件创建 .env
   cp .env.example .env
   
   # 编辑根目录 .env，配置所有变量
   vim .env
   
   # 同步到子项目
   bun run sync-env
   ```

2. **修改环境变量**
   ```bash
   # 1. 编辑根目录 .env
   vim .env
   
   # 2. 同步（或直接运行 dev，会自动同步）
   bun run sync-env
   ```

3. **启动开发**
   ```bash
   # 自动同步并启动所有服务
   bun run dev
   ```

4. **验证配置**
   ```bash
   bun run check-env
   ```

### Git 配置

`.gitignore`:
```gitignore
# 环境变量文件
.env
.env.local
.env.*.local

# 生成的子项目环境变量（由脚本自动生成）
apps/web/.env
apps/server/.env

# 保留示例文件
!.env.example
```

---

## 🎯 方案优势

### ✅ 优点

1. **单一来源** - 只需维护根目录 .env
2. **自动同步** - 脚本确保一致性
3. **类型安全** - TypeScript 脚本，可扩展验证
4. **前缀隔离** - 清晰区分不同应用的变量
5. **向后兼容** - Turborepo 原生支持
6. **Docker 友好** - 直接引用根 .env

### 📊 对比其他方案

| 方案 | 优点 | 缺点 |
|-----|------|------|
| **符号链接** | 简单 | 跨平台兼容性差，Windows 需要权限 |
| **手动复制** | 直接 | 容易不同步，维护困难 |
| **工具 (dotenv-vault)** | 功能强大 | 引入额外依赖，学习成本 |
| **前缀 + 脚本** ⭐ | 灵活、可控、类型安全 | 需要维护脚本 |

---

## 🚀 进阶功能

### 1. 多环境支持

```bash
# .env.development (开发环境)
# .env.staging (预发布)
# .env.production (生产环境)

# 使用
NODE_ENV=production bun run sync-env
```

### 2. 加密敏感变量

```typescript
// 使用 dotenv-vault 加密
bun add dotenv-vault

// 加密
bunx dotenv-vault encrypt

// 解密
bunx dotenv-vault decrypt
```

### 3. 集成 CI/CD

```yaml
# .github/workflows/deploy.yml
- name: Sync Environment Variables
  run: bun run sync-env
  
- name: Check Environment
  run: bun run check-env
```

---

## 📖 最佳实践

1. ✅ **提交 .env.example** 到 Git，记录所有必需变量
2. ✅ **不提交 .env** 到 Git
3. ✅ **使用前缀** 明确区分应用范围
4. ✅ **运行前同步** (集成到 dev/build 脚本)
5. ✅ **定期验证** 环境变量完整性
6. ✅ **文档化** 每个变量的用途

---

## 总结

这个方案通过 **前缀命名 + 自动化脚本 + Turborepo 配置** 实现了：

- 🎯 **集中管理** - 单一 .env 文件
- 🔄 **自动同步** - 脚本保证一致性
- 🛡️ **类型安全** - TypeScript 验证
- 📦 **开箱即用** - 集成到 dev 流程

立即可用，维护成本低！
