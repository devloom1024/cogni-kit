---
description: 初始化 Agent 并加载代码库理解
---

# Prime: 加载项目上下文

## 目标

通过分析结构、文档和关键文件，建立对代码库的全面理解。

## 流程

### 1. 分析项目结构

列出所有跟踪的文件：
!`git ls-files`

显示目录结构：
在 Linux/Mac 上运行：`find . -maxdepth 2 -not -path '*/.*'` (或者如果可用使用 `tree`)

### 2. 阅读核心文档

**关键**：必须优先阅读以下基础文档：
- `README.md` (项目概览)
- `.agents/reference/common/*.md` (开发标准与最佳实践)

### 3. 识别关键文件 (Monorepo 上下文)

基于结构，识别并阅读：
- **根目录**: `package.json`, `turbo.json`
- **后端 (apps/server)**: `package.json`, `src/index.ts` (或主入口), `prisma/schema.prisma`
- **前端 (apps/web)**: `package.json`, `vite.config.ts`

### 4. 理解当前状态

检查最近活动：
!`git log -10 --oneline`

检查当前分支和状态：
!`git status`

## 输出报告

提供包含以下内容的简明摘要：

### 项目概览
- 应用的目标和类型 (Monorepo 结构)
- 主要技术栈 (Bun, Hono, React, Prisma)

### 核心标准 (来自 Reference 文档)
- 从 `.agents/reference/common/` 识别出的关键开发标准

### 当前状态
- 当前活跃分支
- 最近的变更
