# API 设计规范 (API Design Standards)

本文档定义了 CogniKit 项目的 RESTful API 设计规范。所有后端接口开发必须严格遵守本规范，以确保接口的一致性、易用性和标准性。

## 1. 核心原则

*   **RESTful 风格**: 充分利用 HTTP 方法 (GET, POST, PUT, DELETE) 和状态码表达资源操作和结果。
*   **直接返回数据**: 成功响应直接返回资源本身，不使用 `code/message/data` 包裹。
*   **标准错误处理**: 失败响应使用 HTTP 4xx/5xx 状态码，Body 返回标准错误结构。
*   **资源导向**: URL 设计应围绕“资源”而非“动词”。

---

## 2. URL 设计

*   **使用名词复数**: `/users`, `/articles`, `/comments`
*   **版本前缀**: 所有 API 路径必须包含版本前缀 `/api/v1`
    *   完整路径示例: `/api/v1/users`, `/api/v1/investment/assets`
    *   版本号使用 `v1`, `v2` 格式（小写 v + 数字）
    *   版本变更规则：
        *   **破坏性变更**（删除字段、修改响应结构）→ 升级大版本（v1 → v2）
        *   **兼容性变更**（新增字段、新增接口）→ 保持当前版本
*   **层级结构**:
    *   获取用户列表: `GET /api/v1/users`
    *   获取特定用户: `GET /api/v1/users/:id`
    *   获取用户的文章: `GET /api/v1/users/:id/articles`
*   **连字符命名**: URL 路径中使用连字符 (`kebab-case`)，避免驼峰或下划线。
    *   正例: `/api/v1/user-profiles`
    *   反例: `/api/v1/userProfiles`, `/api/v1/user_profiles`

---

## 3. 请求与响应

### 3.1 成功响应 (Success)

**原则**: 直接返回数据对象或数组。

*   **单资源 (GET /api/v1/users/1)**
    *   状态码: `200 OK`
    *   响应体:
        ```json
        {
          "id": "u_123",
          "username": "alice",
          "email": "alice@example.com",
          "createdAt": "2023-10-01T12:00:00Z"
        }
        ```

*   **列表资源 (GET /api/v1/users)**
    *   状态码: `200 OK`
    *   响应体: 直接返回数组 (或分页对象)
        ```json
        [
          { "id": "u_123", "name": "Alice" },
          { "id": "u_124", "name": "Bob" }
        ]
        ```
    *   *注: 如果需要分页，返回分页对象结构（见后文）。*

*   **创建资源 (POST /api/v1/users)**
    *   状态码: `201 Created`
    *   响应体: 返回创建后的完整资源对象。

*   **更新资源 (PATCH /api/v1/users/1)**
    *   状态码: `200 OK`
    *   响应体: 返回更新后的完整资源对象。

*   **删除资源 (DELETE /api/v1/users/1)**
    *   状态码: `204 No Content`
    *   响应体: 空。

### 3.2 错误响应 (Error)

**原则**: 使用 HTTP 状态码表示错误类别，Body 提供业务细节。

*   **结构**:
    ```json
    {
      "code": "string",   // 业务错误码 (固定枚举值，用于前端逻辑判断/国际化)
      "message": "string", // 开发者可读的调试信息 (不建议直接展示给用户)
      "details": any       // (可选) 额外的错误详情，如表单字段验证错误
    }
    ```

*   **示例**:
    *   **400 Bad Request** (参数错误)
        ```json
        {
          "code": "validation_error",
          "message": "Validation failed",
          "details": [
            { "field": "email", "message": "Invalid email format" }
          ]
        }
        ```
    *   **401 Unauthorized** (未登录)
        ```json
        {
          "code": "unauthorized",
          "message": "Please login first"
        }
        ```
    *   **403 Forbidden** (无权限)
        ```json
        {
          "code": "permission_denied",
          "message": "You do not have permission to access this resource"
        }
        ```
    *   **404 Not Found** (资源不存在)
        ```json
        {
          "code": "resource_not_found",
          "message": "User not found"
        }
        ```

---

## 4. 特殊场景规范

### 4.1 分页 (Pagination)

#### 4.1.1 常规分页接口

对于返回大量数据的列表接口，**必须**支持分页。

*   **请求参数**: 使用 query 参数
    *   `page`: 页码 (从 1 开始)
    *   `limit`: 每页数量 (默认 20)
    *   示例: `GET /api/v1/users?page=2&limit=10`

*   **响应结构**:
    ```json
    {
      "data": [ ... ], // 资源数组
      "meta": {
        "total": 100,       // 总记录数
        "page": 2,          // 当前页码
        "limit": 10,        // 每页数量
        "totalPages": 10    // 总页数
      }
    }
    ```
    *注意：仅在分页场景下，为了包含 meta 信息，允许包裹一层 `data`。非分页列表推荐直接返回数组。*

#### 4.1.2 全量接口（特殊场景）

**适用场景**:
- 定时任务数据同步（如每日同步股票列表）
- 系统内部服务间调用
- 数据量相对固定且可控（通常 < 10000 条）

**规范要求**:
- 直接返回数组，不使用分页结构
- 必须在接口文档中说明用途和数据量级
- 如果数据量可能超过 10000 条，必须改为分页接口

**示例**:
```
GET /api/v1/akshare/stock/list
用途: 供定时任务同步使用
数据量: 约 5000 条

响应: 200 OK
[
  { "symbol": "600519", "name": "贵州茅台", "market": "CN" },
  { "symbol": "00700", "name": "腾讯控股", "market": "HK" }
]
```

**注意**: 面向前端用户的查询接口不应使用全量返回，必须支持分页。

### 4.2 字段命名

*   **JSON 字段**: 统一使用 **小驼峰命名法 (camelCase)**。
    *   正例: `firstName`, `createdAt`
    *   反例: `first_name`, `created_at`
*   **日期时间**: 统一使用 **ISO 8601** 字符串格式 (UTC)。
    *   示例: `"2023-10-01T12:00:00Z"`

---

## 5. HTTP 状态码对照表

| 状态码 | 含义 | 适用场景 |
| :--- | :--- | :--- |
| **200** | OK | 查询成功，更新成功 |
| **201** | Created | 创建成功 |
| **204** | No Content | 删除成功，或者操作成功但无需返回数据 |
| **400** | Bad Request | 请求参数验证失败、格式错误 |
| **401** | Unauthorized | 未提供 Token 或 Token 无效 |
| **403** | Forbidden | 已登录但无权限执行此操作 |
| **404** | Not Found | 资源不存在 |
| **409** | Conflict | 资源冲突 (如注册时邮箱已存在) |
| **429** | Too Many Requests | 请求过于频繁 (限流) |
| **500** | Internal Server Error | 服务器内部未知错误 |

---

## 6. OpenAPI 文档规范

所有 API 必须提供 OpenAPI 3.0 规范文档。详细的文档编写标准请参考：

**[OpenAPI 文档编写规范](./openapi-documentation-standards.md)**

核心要求：
- 所有描述使用中文
- 所有字段、参数、枚举必须有完整的 `description`
- 关键接口必须提供请求/响应示例
- 必须定义安全认证方案（`securitySchemes`）
- 必须为参数添加验证约束（`minLength`, `maximum`, `enum` 等）

