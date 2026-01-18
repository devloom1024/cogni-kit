# 数据库设计规范 (Database Design Standards)

本文档定义了 CogniKit 项目的数据库设计与操作规范。作为数据持久层，严格遵守这些标准对于保障数据的一致性、性能和可维护性至关重要。

## 1. Schema 设计原则

### 1.1 命名规范 (Prisma)
*   **模型 (Table)**: 使用 **PascalCase** (大驼峰)。
    *   正例: `User`, `LoginLog`, `UserProfile`
    *   映射: 使用 `@@map("table_name")` 映射到数据库中的 `snake_case` 表名（为了兼容传统 SQL 工具）。
*   **字段 (Column)**: 使用 **camelCase** (小驼峰)。
    *   正例: `firstName`, `emailVerified`
    *   映射: 使用 `@map("column_name")` 映射到数据库中的 `snake_case` 列名。
*   **枚举 (Enum)**: 使用 **PascalCase**。
    *   正例: `Role`, `PaymentStatus`

### 1.2 必备字段
每个实体模型**必须**包含以下三个字段：
*   `id`: 主键，通常使用 UUID 或 CUID。
*   `createdAt`: 创建时间 (`@default(now())`)。
*   `updatedAt`: 更新时间 (`@updatedAt`)。

### 1.3 字段类型选择
*   **主键**: 优先使用 `String` (UUID/CUID)，便于分布式生成和迁移。避免使用自增 ID (`Int` / `BigInt`)，除非有极强的性能理由。
*   **金额**: 使用 `Decimal` 或 `BigInt` (存储分为单位)，**严禁**使用 `Float` 或 `Double` 存储金额。
*   **时间**: 使用 `DateTime`，Prisma 默认处理为 UTC。

### 1.4 注释规范
*   **文档注释**: **必须**使用 `///` 为模型和关键字段添加业务说明。
    *   这些注释会被 Prisma Client 生成到 TypeScript 类型定义中，提供 IDE 智能提示。
    *   示例:
        ```prisma
        /// 系统注册用户，包含登录凭证和基本资料
        model User {
          /// 用户的唯一邮箱地址，用作登录账号
          email String @unique
        }
        ```

---

## 2. 关系与索引

### 2.1 索引策略
*   **唯一索引**: 对于业务上必须唯一的字段（如 `email`, `username`, `orderNo`），必须添加 `@unique`。
*   **外键索引**: 在关系型数据库中，外键字段通常需要索引以优化 JOIN 查询。Prisma 会在 `@relation` 定义时自动处理外键约束，但显式定义 `@@index([userId])` 有助于查询性能。
*   **复合索引**: 对于常用的多字段查询（如按 `status` 和 `createdAt` 排序），应创建复合索引 `@@index([status, createdAt])`。

### 2.2 关系定义
*   **显式关系**: 总是显式定义关系的双向连接，确保 Prisma Client API 的完整性。
*   **级联删除**: 谨慎使用 `onDelete: Cascade`。
    *   适用: 父子关系（如 `Post` -> `Comment`），删帖删评。
    *   禁止: 关键业务数据（如 `User` -> `Order`），用户注销不应物理删除其历史订单。

---

## 3. 迁移管理 (Migrations)

### 3.1 开发流程
*   **修改 Schema**: 在 `schema.prisma` 中修改模型。
*   **生成迁移**: 运行 `bunx prisma migrate dev --name <descriptive-name>`。
    *   这会生成 SQL 文件并应用到开发数据库。
    *   **严禁**手动修改数据库结构而不经过 Prisma Migrate。
    *   **严禁**手动编辑生成的 SQL 迁移文件（除非处理 Prisma 无法自动处理的数据迁移）。

### 3.2 生产部署
*   CI/CD 流程中必须包含 `prisma migrate deploy` 步骤，以将迁移应用到生产数据库。

---

## 4. 示例

```prisma
// prisma/schema.prisma

/// 用户会话表，用于存储 JWT 刷新令牌
model Session {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  
  // 关联定义
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 索引定义：优化根据 userId 查询会话的速度
  @@index([userId])
  // 映射定义：数据库表名为 sessions
  @@map("sessions")
}
```
