---
description: 运行全量验证套件
---

# 验证 (Validate)

## 目标
验证代码库的完整性和功能的正确性。

## 检查项

### 1. 静态分析
- **Lint**: `bun run lint`
- **类型检查**: `bun run type-check`

### 2. 构建验证
- **构建**: `bun run build`

### 3. 产物验证
- 检查 `.agents/design/${feature_name}/` 是否存在且包含 `prd.md` 和 `openapi.yml`。
- 检查 `.agents/plan/` 是否包含计划文件。

### 4. 数据库
- 确保 Prisma schema 有效：`bun run --filter server db:validate` (如果脚本存在) 或 `bun x prisma validate`。

## 输出
报告任何失败并建议修复方案。
