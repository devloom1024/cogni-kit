---
description: 执行技术代码审查
---

# 代码审查 (Code Review)

## 目标
根据项目标准审查最近的更改。

## 参考标准
**你必须依据以下文档进行审查**：
- `@.agents/reference/common/*.md`
- `@.agents/reference/design/*.md`
- `@.agents/reference/implementation/*.md`

## 关注领域

### 后端 (apps/server)
- **Clean Architecture**：职责是否分离 (Route -> Controller -> Service -> Repository)？
- **错误处理**：Hono 错误处理是否使用正确？
- **类型安全**：是否使用了 Zod schema 进行验证？
- **API 匹配**：实现是否匹配 `openapi.yml`？

### 前端 (apps/web)
- **组件**：是否正确使用了 Shadcn UI 组件？
- **Tailwind**：工具类是否使用得当？
- **状态管理**：数据获取是否通过 TanStack Query 处理？

## 输出
提供分类的问题列表：
- **严重 (Critical)**：Bug 或安全问题。
- **设计 (Design)**：架构违规。
- **细节 (Nitpick)**：风格或小的改进。
