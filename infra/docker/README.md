# CogniKit 开发环境部署指南

## 快速启动

### 1. 启动开发服务 (PostgreSQL + Redis)

```bash
cd infra/docker
docker-compose up -d
```

验证服务状态：
```bash
docker-compose ps
```

### 2. 配置环境变量

更新根目录的 `.env` 文件：

```bash
# Database
DATABASE_URL="postgresql://cognikit:cognikit_dev_password@localhost:5432/cognikit?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT (请修改为随机字符串)
JWT_SECRET="请使用随机生成的至少32位密钥"
JWT_EXPIRES_IN="7d"

# Email (Resend) - 需要注册 https://resend.com 获取 API Key
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"

# OAuth (可选)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# App
NODE_ENV="development"
PORT="3001"
FRONTEND_URL="http://localhost:3000"
```

### 3. 运行数据库迁移

```bash
cd apps/server
bunx prisma migrate dev --name init
```

这将创建所有数据库表。

### 4. 启动后端服务

```bash
cd apps/server
bun run dev
```

服务将在 http://localhost:3001 启动

### 5. 测试 API

**健康检查**:
```bash
curl http://localhost:3001/health
```

**发送验证码**:
```bash
curl -X POST http://localhost:3001/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "target": "test@example.com",
    "type": "register"
  }'
```

**注册用户**:
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "repeatPassword": "Test1234",
    "code": "123456"
  }'
```

**登录**:
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "test@example.com",
    "password": "Test1234"
  }'
```

**获取当前用户** (需要 Token):
```bash
curl http://localhost:3001/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 停止服务

```bash
cd infra/docker
docker-compose down
```

保留数据卷：
```bash
docker-compose down -v  # 删除数据卷 (慎用)
```

## 数据库管理

### Prisma Studio (可视化数据库管理)

```bash
cd apps/server
bunx prisma studio
```

浏览器访问: http://localhost:5555

### 查看数据库日志

```bash
cd infra/docker
docker-compose logs -f postgres
docker-compose logs -f redis
```

## 常见问题

### Q: 端口被占用？
```bash
# 查看占用端口的进程
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :3001  # 后端服务

# 杀死进程
kill -9 <PID>
```

### Q: 数据库连接失败？
1. 确认 Docker 服务已启动: `docker-compose ps`
2. 检查 .env 中的 DATABASE_URL 是否正确
3. 查看 PostgreSQL 日志: `docker-compose logs postgres`

### Q: Redis 连接失败？
1. 确认 Redis 容器运行正常: `docker ps | grep redis`
2. 测试连接: `redis-cli ping`

### Q: 邮件发送失败？
1. 确认 RESEND_API_KEY 配置正确
2. 检查 EMAIL_FROM 域名是否已在 Resend 验证
3. 查看后端日志中的错误信息

## 开发工作流

1. **启动服务**: `docker-compose up -d`
2. **运行迁移**: `bunx prisma migrate dev`
3. **启动后端**: `bun run dev`
4. **代码修改**: 热重载自动生效
5. **查看日志**: 观察终端输出
6. **调试**: 使用 Prisma Studio 查看数据
