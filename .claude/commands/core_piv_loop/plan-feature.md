---
description: 创建详细的实施计划
---

# 规划功能 (Plan Feature)

## 目标
严格遵循项目的设计优先工作流，为新功能创建详细的实施计划。

## 前置条件
**阅读所有参考文档**：
- `.agents/reference/common/*.md` (通用标准)
- `.agents/reference/design/*.md` (API 和数据库设计标准)
- `.agents/reference/implementation/*.md` (后端/前端实现标准)

## 流程

### 第一阶段：需求分析与 PRD
1.  **明确需求**：与用户讨论直到目标完全清晰。
2.  **创建 PRD**：
    - 目录：`.agents/design/${feature_name}/`
    - 文件：`prd.md`
    - 内容：详细的用户故事、验收标准和范围。
    - **动作**：创建此文件并请求用户批准。

### 第二阶段：数据库设计
1.  **分析 Schema**：阅读 `apps/server/prisma/schema.prisma`。
2.  **设计变更**：
    - 遵循 `database-design-standards.md`。
    - **动作**：直接修改 `apps/server/prisma/schema.prisma` 添加新的模型/字段。
    - **验证**：确保 schema 有效 (运行 `bun run --filter server db:validate` 如果可用，或进行视觉检查)。

### 第三阶段：API 设计 (OpenAPI)
1.  **设计 API**：
    - 遵循 `api-design-standards.md`。
    - **动作**：创建 `.agents/design/${feature_name}/openapi.yml`。
    - 内容：完整的 OpenAPI 3.0 定义 (路径, 方法, 请求/响应体)。

### 第四阶段：实施计划
1.  **起草计划**：
    - 目录：`.agents/plan/`
    - 文件：`${feature_name}-${date:YYYYMMDDHHmm}.md` (请自行生成时间戳)
    - 内容：逐步实施清单。
        - **后端**：DB 迁移 -> Repository -> Service -> Controller -> Routes。
        - **前端**：API 客户端 -> 组件 -> 页面集成。
        - **验证**：需要运行的测试。

## 输出
1.  确认所有设计产物 (`prd.md`, `openapi.yml`) 已创建。
2.  确认 `schema.prisma` 已更新。
3.  确认实施计划已在 `.agents/plan/` 中创建。
