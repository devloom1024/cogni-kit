#!/bin/bash

# CogniKit API 测试脚本

BASE_URL="http://localhost:3001"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="Test1234"

echo "🧪 CogniKit API 测试"
echo "===================="
echo ""

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 健康检查
echo "1️⃣  健康检查..."
HEALTH=$(curl -s "$BASE_URL/health")
if echo "$HEALTH" | grep -q "ok"; then
  echo -e "${GREEN}✅ 健康检查通过${NC}"
  echo "$HEALTH" | jq .
else
  echo -e "${RED}❌ 健康检查失败${NC}"
  exit 1
fi
echo ""

# 2. 发送验证码 (可选 - 需要配置邮件服务)
echo "2️⃣  发送验证码 (跳过 - 需要配置 Resend API Key)..."
# curl -s -X POST "$BASE_URL/auth/send-code" \
#   -H "Content-Type: application/json" \
#   -d "{\"target\":\"$TEST_EMAIL\",\"type\":\"register\"}"
echo "  ℹ️  需要在 .env 中配置 RESEND_API_KEY"
echo ""

# 3. 注册用户 (跳过 - 需要真实验证码)
echo "3️⃣  注册用户 (跳过 - 需要验证码)..."
echo "  ℹ️  使用 Prisma Studio 或直接数据库创建测试用户"
echo ""

# 4. 登录测试 (需要先创建用户)
echo "4️⃣  登录测试..."
echo "  ℹ️  需要先通过其他方式创建测试用户"
echo ""

# 5. 测试路由
echo "5️⃣  测试 API 路由结构..."
echo "  GET  $BASE_URL/ - 根路径"
echo "  GET  $BASE_URL/health - 健康检查"
echo "  POST $BASE_URL/auth/send-code - 发送验证码"
echo "  POST $BASE_URL/auth/register - 注册"
echo "  POST $BASE_URL/auth/login - 登录"
echo "  POST $BASE_URL/auth/refresh-token - 刷新Token"
echo "  POST $BASE_URL/auth/logout - 登出"
echo "  POST $BASE_URL/auth/forgot-password - 重置密码"
echo "  GET  $BASE_URL/users/me - 获取当前用户"
echo ""

echo "✅ 基础测试完成"
echo ""
echo "📝 下一步:"
echo "  1. 配置 .env 中的 RESEND_API_KEY (https://resend.com)"
echo "  2. 使用 Prisma Studio 创建测试用户: bunx prisma studio"
echo "  3. 运行完整的端到端测试"
echo ""
