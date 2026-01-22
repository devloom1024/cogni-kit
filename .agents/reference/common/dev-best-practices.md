# CogniKit 开发最佳实践 (Best Practices)

本文档提供了针对 CogniKit 技术栈的深入技术建议和模式。遵循这些实践可以提升代码质量、性能、安全性和健壮性。

---

## 1. TypeScript 最佳实践

**适用范围**: `apps/web`, `apps/server`, `packages/shared`

### 1.1 Strict Mode (严以律己)
*   **规则**: `tsconfig.json` 必须开启 `"strict": true`。
*   **No Any**: 严禁显式使用 `any`。遇到未知类型请使用 `unknown` 并配合 Type Guard 或 Zod 解析。
*   **No Ignore**: 禁止使用 `// @ts-ignore`，除非有极其充分的理由（必须添加注释说明）。

### 1.2 类型定义
*   **Types over Interfaces**: 优先使用 `type` 定义 DTO、Union Types 和对象。这与 Zod 的 `z.infer` 更兼容。仅在需要 Declaration Merging 时使用 `interface`。
*   **Explicit Returns**: 对于复杂的函数，建议显式标注返回值类型，有助于编译器检查和代码阅读。

### 1.3 异步处理
*   **Async/Await**: 杜绝 `.then().catch()` 链式调用，一律使用 `async/await` 配合 `try/catch`。
*   **Parallelism (并行优化)**: 相互不依赖的异步操作，**必须**使用 `Promise.all` 并行执行，而非串行等待。

```typescript
// ✅ Good
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);

// ❌ Bad (串行慢)
const user = await getUser(id);
const posts = await getPosts(id);
```

### 1.4 不可变性
*   优先使用非破坏性方法（如 `map`, `filter`, `reduce`, `toSpliced`）处理数组。
*   避免直接修改对象引用，使用解构 `...` 创建新对象。

---

## 2. Python 最佳实践

**适用范围**: `services/python-xxx`

### 2.1 现代工具链
*   **uv**: 严格使用 `uv` 进行包管理和虚拟环境管理。
*   **Ruff**: 使用 Ruff 进行 Linting 和 Formatting，替代 Flake8/Black。

### 2.2 类型提示与 Pydantic
*   **Type Hints**: 所有函数参数和返回值必须编写 Python 3.10+ 风格的 Type Hints。
*   **Pydantic Models**: API 的输入输出必须定义 `BaseModel`，严禁直接返回 `dict`。

### 2.3 异步 I/O
*   **Async/Await**: 数据库查询和 HTTP 请求必须异步。
*   **Non-blocking**: **绝对禁止**在 `async def` 中执行阻塞操作（如 `time.sleep`, `requests`）。CPU 密集型任务应放入后台任务队列。

### 2.4 命名规范
*   **变量/函数/方法**: 使用 **snake_case**（蛇形命名）
    *   ✅ `total_count`, `get_stock_list()`
    *   ❌ `totalCount`, `getStockList()`
*   **类名**: 使用 **PascalCase**（帕斯卡命名）
    *   ✅ `StockProfile`, `KLineResponse`
    *   ❌ `stockProfile`, `kLineResponse`
*   **常量**: 使用 **UPPER_SNAKE_CASE**
    *   ✅ `MAX_RETRY_COUNT`
    *   ❌ `maxRetryCount`
*   **Pydantic 模型字段**:
    *   Python 字段名使用 **snake_case**
    *   JSON 序列化使用 **camelCase**（通过 `alias` 实现）
    *   必须设置 `populate_by_name = True` 兼容两种格式

```python
from pydantic import BaseModel, Field

class StockSpot(BaseModel):
    """股票实时行情"""
    # Python 使用 snake_case，alias 定义 JSON 输出的 camelCase
    prev_close: float = Field(..., description="昨收", alias="prevClose")
    change_percent: float = Field(..., description="涨跌幅 (%)", alias="changePercent")
    outer_volume: float | None = Field(None, description="外盘(手)", alias="outerVolume")

    class Config:
        populate_by_name = True  # 支持 snake_case 和 camelCase
```

---

## 3. 数据库最佳实践 (PostgreSQL + Prisma)

### 3.1 Schema 设计
*   **索引策略**:
    *   所有作为 `WHERE` 查询条件的字段必须加索引 `@@index`。
    *   所有外键字段必须加索引。
    *   需要唯一的字段必须加 `@@unique`。
*   **数据完整性**: 优先在数据库层面（NOT NULL, FOREIGN KEY, ENUM）约束数据，不要仅依赖代码逻辑。

### 3.2 事务 (Transactions)
*   涉及多表写入的操作（如：注册用户 + 创建默认设置），**必须**使用 `prisma.$transaction` 保证原子性。

---

## 4. Redis 缓存最佳实践

### 4.1 Key 命名
*   使用冒号分隔的层级结构：`项目名:模块:ID:属性`。
*   **示例**: `cognikit:auth:session:uuid-1234`

### 4.2 过期时间 (TTL)
*   **强制**: 所有的缓存 Key **必须**设置过期时间。
*   **Jitter**: 对于热点数据，建议使用随机过期时间，防止缓存雪崩。

### 4.3 原子性
*   如果需要 "Check-and-Set" 逻辑，必须使用 **Lua 脚本** 或 **Redis 事务**，避免并发竞争条件。

---

## 5. 安全最佳实践

*   **SQL 注入**: 严禁手动拼接 SQL 字符串。
*   **敏感数据**:
    *   密码必须 Hash (bcrypt/argon2)。
    *   日志中严禁打印 Token、密码、PII 信息（需 Redact）。
*   **API 防护**:
    *   非公开接口必须校验 JWT。
    *   登录、短信等关键接口必须在 Redis 层实现 **Rate Limit (限流)**。
