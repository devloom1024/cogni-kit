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

---

## 6. React 最佳实践

**适用范围**: `apps/web`

### 6.1 目录结构

遵循 React 官方推荐的 "按功能分组" 模式：

```
src/
├── pages/                   # 页面组件（路由入口）
│   ├── Home.tsx
│   └── auth/
│       ├── LoginPage.tsx
│       └── RegisterPage.tsx
├── features/                # 业务功能模块（组件 + 业务逻辑）
│   └── auth/
│       ├── components/      # auth 专用组件
│       │   └── SocialAuth.tsx
│       ├── queries.ts       # TanStack Query hooks
│       └── index.ts         # barrel export
├── components/              # 可复用组件
│   ├── ui/                  # shadcn/ui 基础组件（原子化）
│   ├── forms/               # 通用表单组件
│   │   └── FormError.tsx
│   ├── layout/              # 布局组件
│   │   ├── AppLayout.tsx    # 主应用布局（需登录）
│   │   └── AuthLayout.tsx   # 认证布局
│   └── theme/               # 主题相关
├── hooks/                   # 全局自定义 Hooks
├── context/                 # 全局 Context
├── lib/                     # 工具函数
└── stores/                  # Zustand 状态管理
```

### 6.2 组件设计原则

*   **单一职责**: 每个组件只做一件事，保持短小精悍。
*   **组件拆分时机**:
    *   组件代码超过 80 行
    *   逻辑可被多个地方复用
    *   JSX 分支（条件渲染）过多
*   **命名规范**:
    *   组件文件: **PascalCase** (`LoginPage.tsx`, `FormError.tsx`)
    *   工具文件: **kebab-case** (`utils.ts`, `api.ts`)
    *   Hook 文件: **camelCase** 以 `use` 开头 (`useAuth.ts`)

### 6.3 状态管理策略

| 状态类型 | 方案 | 说明 |
|----------|------|------|
| 服务端数据 | TanStack Query | 缓存、轮询、乐观更新 |
| 全局 UI 状态 | Zustand | 主题、侧边栏开关 |
| 页面状态 | `useState` / `useReducer` | 本地表单、局部 UI |
| URL 状态 | React Router | 路由参数、查询字符串 |

### 6.4 性能优化

*   **路由懒加载**: 非首屏页面使用 `React.lazy()` + `Suspense`

```typescript
// ✅ Good
const LoginPage = lazy(() => import("@/pages/auth/LoginPage").then(m => ({ default: m.LoginPage })))

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>...</Routes>
    </Suspense>
  )
}

// ❌ Bad (同步加载所有页面)
import { LoginPage } from "@/pages/auth/LoginPage"
```

*   **组件记忆化**:
    *   父组件重渲染导致子组件不必要更新时，使用 `React.memo()`
    *   稳定 props 的组件通常不需要 memo
*   **避免深层嵌套**: 目录层级不超过 3 层，避免 `components/forms/auth/...`

### 6.5 代码组织模式

*   **页面组件 (`pages/`)**: 组合 features 和 components，负责路由和数据获取
*   **功能模块 (`features/`)**: 包含业务逻辑、专用组件、API hooks
*   **可复用组件 (`components/`)**: 纯 UI，与业务无关，可跨功能使用

### 6.6 样式与 UI 组件

*   **shadcn/ui**: 所有基础组件从 `@/components/ui/` 导入
*   **Tailwind CSS**: 优先使用工具类，保持组件自包含
*   **避免样式泄漏**: 使用 `cns`/`clsx` 管理条件类名

```typescript
import { cn } from "@/lib/utils"

function Button({ className, variant, ...props }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded",
        variant === "primary" && "bg-blue-500 text-white",
        className
      )}
      {...props}
    />
  )
}
```
