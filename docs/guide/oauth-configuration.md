# OAuth 2.0 配置指南

本文档介绍了如何配置 Google 和 GitHub 的 OAuth 2.0 登录功能。

## 环境变量配置

在 `apps/server/.env` 文件中，你需要配置以下环境变量：

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 1. GitHub OAuth 配置

### 步骤
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)。
2. 点击 **"New OAuth App"**。
3. 填写应用信息：
   - **Application Name**: CogniKit (或你的应用名称)
   - **Homepage URL**: `http://localhost:5173` (本地开发地址)
   - **Authorization callback URL**: `http://localhost:5173/auth/callback/github`
     > **注意**: 回调地址必须严格匹配，包括协议、域名、端口和路径。
4. 点击 **"Register application"**。
5. 获取 **Client ID** 和 **Client Secret** (需点击 "Generate a new client secret")。
6. 将这两个值填入 `apps/server/.env` 文件。

---

## 2. Google OAuth 配置

### 步骤
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)。
2. 创建一个新项目或选择现有项目。
3. 进入 **"APIs & Services" > "Credentials"**。
4. 点击 **"Create Credentials"** 并选择 **"OAuth client ID"**。
5. 如果是首次配置，需要先配置 **"OAuth consent screen"**：
   - User Type: External (通常选择此项用于测试)
   - 填写 App name, Email 等必填信息。
   - Scopes: 添加 `.../auth/userinfo.email` 和 `.../auth/userinfo.profile`。
   - Test users: 添加你用于测试的 Google 邮箱地址。
6. 回到 **"Create OAuth client ID"**：
   - **Application type**: Web application
   - **Name**: CogniKit Web
   - **Authorized JavaScript origins**: `http://localhost:5173`
   - **Authorized redirect URIs**: `http://localhost:5173/auth/callback/google`
     > **注意**: 重定向 URI 必须严格匹配。
7. 点击 **"Create"**。
8. 获取 **Client ID** 和 **Client Secret**。
9. 将这两个值填入 `apps/server/.env` 文件。

---

## 常见问题

### redirect_uri_mismatch
如果出现此错误，请检查以下几点：
1. 第三方平台（Google/GitHub）配置的 Redirect URI 是否与代码中生成的一致。
   - 本地开发应为: `http://localhost:5173/auth/callback/{provider}`
2. 确保端口号正确（如果你修改了 Vite 默认端口 5173）。
3. Google 配置生效可能需要几分钟。

### OAuth not configured
后端报错 "OAuth not configured" 表示 `.env` 文件中缺少对应的 Client ID 或 Secret，或者服务启动时未能正确加载环境变量。请检查 `.env` 文件并重启后端服务。
