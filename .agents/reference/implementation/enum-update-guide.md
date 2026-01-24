# 枚举值更新指南

本指南以 `FundType` 为例，说明如何在项目中新增或修改枚举值。

## 需要更新的文件

### 1. Python 服务端 (services/financial-data)

| 文件                                                | 说明                                             |
| --------------------------------------------------- | ------------------------------------------------ |
| `app/modules/akshare/common/utils/fund_type_map.py` | 映射表 `FUND_TYPE_MAP` 和 `FundTypeLiteral` 类型 |
| `app/modules/akshare/fund/models/fund_type.py`      | `FundType` 枚举类（如使用）                      |

### 2. Node.js 服务端 (apps/server)

| 文件                   | 说明                        |
| ---------------------- | --------------------------- |
| `prisma/schema.prisma` | Prisma `enum FundType` 定义 |

### 3. 共享包 (packages/shared)

| 文件                  | 说明                               |
| --------------------- | ---------------------------------- |
| `src/types/models.ts` | 前后端共享的 `FundType` 常量和类型 |

### 4. API 文档 (.agents/design)

| 文件                               | 说明                        |
| ---------------------------------- | --------------------------- |
| `investment-watchlist/openapi.yml` | OpenAPI `fundType` 枚举定义 |

## 更新步骤

### Step 1: 更新 Python 映射表

```python
# services/financial-data/app/modules/akshare/common/utils/fund_type_map.py

FundTypeLiteral = Literal[
    "EXISTING_VALUE",
    "NEW_VALUE",  # 新增
]

FUND_TYPE_MAP: Dict[str, FundTypeLiteral] = {
    "中文名称": "NEW_VALUE",  # 新增映射
}
```

### Step 2: 更新 Prisma Schema

```prisma
// apps/server/prisma/schema.prisma

enum FundType {
  EXISTING_VALUE
  NEW_VALUE  // 新增
}
```

### Step 3: 更新 Shared 类型

```typescript
// packages/shared/src/types/models.ts

export const FundType = {
  EXISTING_VALUE: 'EXISTING_VALUE',
  NEW_VALUE: 'NEW_VALUE',  // 新增
} as const
```

### Step 4: 生成 Prisma Client

```bash
cd apps/server
bun run db:generate
```

### Step 5: 同步数据库

```bash
cd apps/server
bun run db:push
```

> ⚠️ 如果删除了现有枚举值，Prisma 会提示确认，输入 `y` 继续。

### Step 6: 重启服务

```bash
# 重启所有服务
bun run dev

# 或单独重启 Python 服务
cd services/financial-data
source .venv/bin/activate && python -m uvicorn app.main:app --reload
```

### Step 7: 清除缓存（如有需要）

```bash
# 清除 akshare 相关缓存
redis-cli KEYS "akshare:*" | xargs redis-cli DEL
```

## 验证

运行同步脚本验证：

```bash
bun run --cwd apps/server bin/sync-assets.ts
```

## 注意事项

1. **类型一致性**：确保 Python `FundTypeLiteral`、Prisma `enum`、TypeScript `const` 三处值完全一致
2. **数据库迁移**：`db:push` 会直接修改数据库，生产环境建议使用 `db:migrate`
3. **缓存清理**：如果数据已缓存，需要清除 Redis 缓存才能看到新数据
4. **服务重启**：Python 服务需要重启才能加载新代码（开发模式下 watchfiles 会自动重载）
