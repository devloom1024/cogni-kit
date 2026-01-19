# OpenAPI 文档编写规范

本文档定义了 CogniKit 项目的 OpenAPI 文档编写标准，确保 API 文档的完整性、可读性和一致性。

## 1. 核心原则

- **完整性**: 所有字段、参数、枚举值都必须有描述
- **中文优先**: 所有面向业务的描述统一使用中文
- **示例丰富**: 关键接口必须提供请求/响应示例
- **类型严格**: 明确标注字段类型、格式、约束条件

---

## 2. 语言规范

### 2.1 描述语言选择

| 元素 | 语言 | 说明 |
|------|------|------|
| `info.title` | 中文 | API 标题 |
| `info.description` | 中文 | API 总体说明 |
| `tags[].description` | 中文 | 标签分组说明 |
| `paths[].summary` | 中文 | 接口简要说明 |
| `paths[].description` | 中文 | 接口详细说明 |
| `parameters[].description` | 中文 | 参数说明 |
| `properties[].description` | 中文 | 字段说明 |
| `enum` 值说明 | 中文 | 枚举值含义 |
| `schema` 名称 | 英文 PascalCase | 如 `UserProfile`, `OrderStatus` |
| `properties` 字段名 | 英文 camelCase | 如 `userId`, `createdAt` |

**示例**:
```yaml
info:
  title: 用户管理 API
  description: 提供用户注册、登录、个人信息管理等功能

paths:
  /users/{id}:
    get:
      summary: 获取用户详情
      description: 根据用户 ID 获取用户的完整个人信息
```

---

## 3. 必填描述规范

### 3.1 接口级别

**必须包含**:
- `summary`: 简短的接口功能说明（一句话）
- `description`: 详细的接口说明（可选，复杂接口必填）
- `tags`: 接口分组标签

**路径规范**:
- 所有路径必须包含版本前缀 `/api/v1`
- 使用 kebab-case 命名

**示例**:
```yaml
/api/v1/auth/login:
  post:
    summary: 用户登录
    description: |
      支持邮箱或用户名登录。
      登录成功后返回 JWT Token 和用户信息。
      连续失败 5 次将触发账号锁定 30 分钟。
    tags: [认证]
```

### 3.2 参数级别

**所有参数必须包含**:
- `description`: 参数说明
- `schema.type`: 数据类型
- `required`: 是否必填
- 约束条件（如 `minLength`, `maximum`, `enum`）

**示例**:
```yaml
parameters:
  - name: page
    in: query
    required: false
    description: 页码，从 1 开始
    schema:
      type: integer
      default: 1
      minimum: 1
  - name: status
    in: query
    required: false
    description: 订单状态筛选
    schema:
      type: string
      enum: [PENDING, PAID, SHIPPED, COMPLETED, CANCELLED]
```

### 3.3 Schema 字段级别

**所有字段必须包含**:
- `type`: 数据类型
- `description`: 字段说明
- `format`: 格式（如 `date-time`, `email`, `uuid`）
- `nullable`: 是否可为空（可空字段必须标注）
- `example`: 示例值（推荐）

**示例**:
```yaml
User:
  type: object
  required:
    - id
    - username
    - status
  properties:
    id:
      type: string
      format: uuid
      description: 用户唯一标识
      example: "550e8400-e29b-41d4-a716-446655440000"
    username:
      type: string
      minLength: 3
      maxLength: 20
      description: 用户名，3-20 个字符，仅支持字母、数字、下划线
      example: "zhang_san"
    nickname:
      type: string
      nullable: true
      description: 用户昵称，可为空
      example: "张三"
    email:
      type: string
      format: email
      nullable: true
      description: 邮箱地址，未验证时可为空
      example: "zhangsan@example.com"
    status:
      $ref: "#/components/schemas/UserStatus"
    createdAt:
      type: string
      format: date-time
      description: 账号创建时间（UTC）
      example: "2023-10-01T12:00:00Z"
```

### 3.4 枚举类型

**枚举必须包含**:
- `type`: 数据类型
- `enum`: 枚举值列表
- `description`: 枚举说明，包含每个值的含义

**推荐格式**:
```yaml
UserStatus:
  type: string
  enum:
    - ACTIVE
    - INACTIVE
    - BANNED
    - DELETED
  description: |
    用户状态:
    - ACTIVE: 正常激活状态
    - INACTIVE: 未激活（注册后未验证邮箱）
    - BANNED: 已封禁
    - DELETED: 已删除（软删除）

OrderStatus:
  type: string
  enum:
    - PENDING
    - PAID
    - SHIPPED
    - COMPLETED
    - CANCELLED
  description: |
    订单状态:
    - PENDING: 待支付
    - PAID: 已支付，待发货
    - SHIPPED: 已发货
    - COMPLETED: 已完成
    - CANCELLED: 已取消
```

---

## 4. 响应示例规范

### 4.1 成功响应

**必须包含**:
- 状态码说明
- 响应 Schema
- 实际示例（推荐）

**示例**:
```yaml
responses:
  "200":
    description: 登录成功
    content:
      application/json:
        schema:
          type: object
          properties:
            user:
              $ref: "#/components/schemas/User"
            tokens:
              $ref: "#/components/schemas/TokenPair"
        examples:
          success:
            summary: 登录成功示例
            value:
              user:
                id: "u_123456"
                username: "zhangsan"
                email: "zhangsan@example.com"
                status: "ACTIVE"
                createdAt: "2023-10-01T12:00:00Z"
              tokens:
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                refreshToken: "550e8400-e29b-41d4-a716-446655440000"
                expiresAt: "2023-10-01T13:00:00Z"
```

### 4.2 错误响应

**必须包含**:
- 所有可能的错误状态码
- 错误 Schema
- 典型错误示例

**示例**:
```yaml
responses:
  "400":
    description: 请求参数错误
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/Error"
        examples:
          validation_error:
            summary: 表单验证失败
            value:
              code: "validation_error"
              message: "请求参数验证失败"
              details:
                - field: "email"
                  message: "邮箱格式不正确"
                - field: "password"
                  message: "密码长度至少 8 位"
  "401":
    description: 未授权（未登录或 Token 无效）
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/Error"
        examples:
          unauthorized:
            summary: Token 无效
            value:
              code: "unauthorized"
              message: "Token 已过期或无效，请重新登录"
  "404":
    description: 资源不存在
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/Error"
        examples:
          not_found:
            summary: 用户不存在
            value:
              code: "user_not_found"
              message: "未找到该用户"
```

---

## 5. 特殊场景规范

### 5.1 分页接口 vs 全量接口

#### 5.1.1 分页接口（常规列表）

**适用场景**: 面向用户的查询接口，数据量可能很大

**必须说明**:
- 分页参数的默认值和限制
- 响应结构中的 `meta` 字段含义

**示例**:
```yaml
/api/v1/users:
  get:
    summary: 获取用户列表
    description: 支持分页查询，默认每页 20 条，最多 100 条
    tags: [User]
    parameters:
      - name: page
        in: query
        description: 页码，从 1 开始
        schema:
          type: integer
          default: 1
          minimum: 1
      - name: limit
        in: query
        description: 每页数量，最大 100
        schema:
          type: integer
          default: 20
          minimum: 1
          maximum: 100
    responses:
      "200":
        description: 用户列表（分页）
        content:
          application/json:
            schema:
              type: object
              properties:
                data:
                  type: array
                  items:
                    $ref: "#/components/schemas/User"
                meta:
                  $ref: "#/components/schemas/PaginationMeta"
```

#### 5.1.2 全量接口（数据同步）

**适用场景**: 
- 定时任务同步数据（如每日同步股票列表）
- 系统内部服务间调用
- 数据量相对固定且可控（通常 < 10000 条）

**特点**:
- 不支持分页参数
- 直接返回完整数组
- 必须在 `description` 中说明用途和数据量级

**示例**:
```yaml
/api/v1/akshare/stock/list:
  get:
    summary: 获取全量股票列表
    description: |
      **用途**: 供定时任务同步使用，每日凌晨 2 点调用。
      **数据量**: 约 5000 条（A股 + 港股 + 美股）。
      **注意**: 此接口返回全量数据，不支持分页。前端请使用 /api/v1/investment/assets/search 进行搜索。
    tags: [AkShare]
    parameters:
      - name: market
        in: query
        required: false
        description: 市场过滤（可选）
        schema:
          type: string
          enum: [CN, HK, US]
    responses:
      "200":
        description: 全量股票列表（无分页）
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: "#/components/schemas/StockInfo"
            examples:
              success:
                summary: 返回示例
                value:
                  - symbol: "600519"
                    name: "贵州茅台"
                    market: "CN"
                  - symbol: "00700"
                    name: "腾讯控股"
                    market: "HK"
```

**全量接口规范要点**:
1. ✅ 必须在 `description` 中说明：
   - 接口用途（如"供定时任务使用"）
   - 预期数据量级
   - 不支持分页的原因
   - 推荐的替代接口（如果有）

2. ✅ 响应直接返回数组，不包裹 `data` 和 `meta`

3. ✅ 如果数据量可能超过 10000 条，建议：
   - 添加可选的 `market`/`type` 等过滤参数
   - 或者改为支持分页

4. ❌ 不要在面向前端的接口中使用全量返回

### 5.2 批量操作

**必须说明**:
- 批量数量限制
- 部分失败的处理方式

**示例**:
```yaml
/api/v1/assets/quotes/batch:
  post:
    summary: 批量获取实时行情
    description: |
      一次最多查询 50 个标的。
      如果部分标的不存在，仍返回 200，但对应标的的数据为 null。
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [ids]
            properties:
              ids:
                type: array
                items:
                  type: string
                minItems: 1
                maxItems: 50
                description: 标的 ID 列表，最多 50 个
```

### 5.3 文件上传

**必须说明**:
- 支持的文件类型
- 文件大小限制

**示例**:
```yaml
/api/v1/users/avatar:
  post:
    summary: 上传用户头像
    description: |
      支持的格式: JPG, PNG, GIF
      文件大小限制: 5MB
    requestBody:
      required: true
      content:
        multipart/form-data:
          schema:
            type: object
            required: [file]
            properties:
              file:
                type: string
                format: binary
                description: 头像文件，支持 JPG/PNG/GIF，最大 5MB
```

---

## 6. 检查清单

在提交 OpenAPI 文档前，请确认：

### 基础信息
- [ ] `info.title` 使用中文
- [ ] `info.description` 包含 API 总体说明
- [ ] `servers` 配置了开发/生产环境地址
- [ ] `tags` 定义了所有接口分组

### 接口定义
- [ ] 每个接口都有 `summary`（中文）
- [ ] 复杂接口有 `description` 详细说明
- [ ] 所有参数都有 `description`
- [ ] 必填参数标记了 `required: true`
- [ ] 参数有合理的约束条件（min/max/enum）

### Schema 定义
- [ ] 所有字段都有 `description`（中文）
- [ ] 可空字段标记了 `nullable: true`
- [ ] 时间字段使用 `format: date-time`
- [ ] 枚举类型有完整的值说明
- [ ] 关键字段提供了 `example`

### 响应定义
- [ ] 列出了所有可能的状态码
- [ ] 每个状态码都有说明
- [ ] 错误响应使用统一的 `Error` Schema
- [ ] 关键接口提供了 `examples`

### 安全认证
- [ ] 定义了 `securitySchemes`
- [ ] 需要认证的接口添加了 `security` 声明

---

## 7. 示例对比

### ❌ 不规范示例

```yaml
User:
  type: object
  properties:
    id:
      type: string
    name:
      type: string
    status:
      type: string
      enum: [active, inactive]
```

**问题**:
- 缺少字段描述
- 枚举值没有说明
- 没有标注必填字段
- 枚举值使用小写（应该用大写）

### ✅ 规范示例

```yaml
User:
  type: object
  required:
    - id
    - username
    - status
  properties:
    id:
      type: string
      format: uuid
      description: 用户唯一标识
      example: "550e8400-e29b-41d4-a716-446655440000"
    username:
      type: string
      minLength: 3
      maxLength: 20
      description: 用户名，3-20 个字符
      example: "zhangsan"
    status:
      type: string
      enum: [ACTIVE, INACTIVE, BANNED]
      description: |
        用户状态:
        - ACTIVE: 正常激活
        - INACTIVE: 未激活
        - BANNED: 已封禁
      example: "ACTIVE"
```

---

## 8. 常见问题

### Q1: 什么时候使用 `nullable: true`？
**A**: 当字段在某些情况下可能为 `null` 时必须标注。例如：
- 用户未设置昵称时 `nickname` 为 `null`
- 未验证邮箱时 `email` 为 `null`

### Q2: `description` 应该写多详细？
**A**: 
- 简单字段：一句话说明即可（如 "用户名"）
- 复杂字段：说明格式、约束、业务含义（如 "订单编号，格式为 ORD + 14 位时间戳 + 4 位随机数"）
- 枚举类型：必须列出每个值的含义

### Q3: 如何处理废弃的接口？
**A**: 使用 `deprecated: true` 标记，并在 `description` 中说明替代方案：
```yaml
/api/v1/old-api:
  get:
    deprecated: true
    summary: 旧版 API（已废弃）
    description: |
      此接口将在 v2.0 版本移除。
      请使用 /api/v1/new-api 替代。
```

---

## 9. 参考资源

- [OpenAPI 3.0 规范](https://swagger.io/specification/)
- [CogniKit API 设计规范](./api-design-standards.md)
