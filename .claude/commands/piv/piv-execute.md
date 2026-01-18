---
allowed-tools: Bash(bun:*)
argument-hint: [plan-file]
description: 执行已批准的实施计划
---

# 执行计划 (Execute Plan)

## 目标
根据已批准的计划和设计文档实现功能代码。

## 上下文加载
1.  **阅读计划**：阅读特定的 `.agents/plan/${plan_file}.md`。
2.  **阅读设计**：阅读 `.agents/design/${feature_name}/prd.md` 和 `.agents/design/${feature_name}/openapi.yml`。
3.  **阅读标准**：阅读 `@.agents/reference/common/*.md` 和 `@.agents/reference/implementation/*.md`。

## 执行规则
- **严格遵守**：后端实现必须严格遵循 `openapi.yml` 契约。
- **Monorepo 上下文**：
    - 后端代码放在 `apps/server/src/`。
    - 前端代码放在 `apps/web/src/`。
- **数据库**：在编写逻辑代码之前，运行 `bun run --filter server db:push` 或 `migrate` 应用 Schema 变更。
- **命令**：使用 `bun` 进行所有的包管理和脚本执行。

## 逐步实施
1.  **后端**：实现清晰架构层 (Entity -> Repository -> UseCase -> Controller)。
2.  **前端**：生成/更新 API 客户端类型，然后构建 UI 组件。
3.  **中间检查**：频繁运行 `bun run type-check` 以尽早发现错误。

## 完成
在进行过程中，在 `.agents/plan/${plan_file}.md` 文件中标记步骤为已完成。
