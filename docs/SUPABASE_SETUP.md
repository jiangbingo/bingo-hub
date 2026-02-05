# Supabase 配置指南

本指南将帮助你正确配置 Supabase 以支持 BingoHub 的 GitHub OAuth 登录功能。

## 目录

1. [获取 API 密钥](#1-获取-api-密钥)
2. [配置环境变量](#2-配置环境变量)
3. [设置 GitHub OAuth](#3-设置-github-oauth)
4. [创建数据库表](#4-创建数据库表)
5. [测试配置](#5-测试配置)
6. [常见问题](#6-常见问题)

---

## 1. 获取 API 密钥

### 步骤 1: 登录 Supabase

访问 [https://supabase.com](https://supabase.com) 并登录你的账户。

### 步骤 2: 选择项目

在 Dashboard 中选择你的 `bingo` 项目。

### 步骤 3: 获取 API 密钥

1. 点击左侧菜单的 **Settings** → **API**
2. 在 **Project API keys** 部分，你会看到以下内容：

```
Project URL
https://exhhhnliwgvppgudfybe.supabase.co

Project API keys
anon/public key
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNcci1wdWJsaXNoYWJsZV9IHBfdWZGU3WEw3c3dkZEJ5WUYyQWdfd2NMZmI2WCIsInR5cGUiOiJwdWJsaXNoYWJsZSIsInZlcnNpb24iOiIxLjAiLCJhdXRoIjoicHJvamVjdCIsInByb2plY3RfaWQiOiJiaW5nbyIsInJvbGVzIjoicHJvamVjdCIsInNjb3BlcyI6InByb2plY3QifQ.sb_publishable_HP_ufFR3XL7swddByYF2Ag_wcL2fB6X
```

### ⚠️ 重要：正确复制密钥

**正确的做法：**
```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS0...（完整复制，不要修改）
```

**错误的做法：**
```
VITE_SUPABASE_ANON_KEY=sb_publishable_HP_ufFR3XL7swddByYF2Ag_wcL2fB6X  ❌ 只复制了尾部
VITE_SUPABASE_ANON_KEY="eyJhbGci...sb_publishable_HP_ufFR3XL7swddByYF2Ag_wcL2fB6X"  ❌ 不要添加引号
```

> **密钥格式说明**：`anon/public key` 是一个完整的 JWT token，通常以 `eyJ` 开头，长度约为 300-400 个字符。必须完整复制，不能截取或修改。

---

## 2. 配置环境变量

### 本地开发

编辑项目根目录的 `.env.local` 文件：

```bash
# Supabase 项目 URL
VITE_SUPABASE_URL=https://exhhhnliwgvppgudfybe.supabase.co

# Supabase 匿名密钥（完整的 publishable key）
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（完整的 JWT token）
```

### Vercel 部署

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的 `bingo-hub` 项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下变量（注意：**不要**添加 `VITE_` 前缀，Vercel 会自动处理）：

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://exhhhnliwgvppgudfybe.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

5. 保存后重新部署项目

---

## 3. 设置 GitHub OAuth

### 步骤 1: 在 Supabase 中启用 GitHub Provider

1. 在 Supabase Dashboard 中，进入 **Authentication** → **Providers**
2. 找到 **GitHub** 并点击启用
3. 保持页面打开，稍后需要填写回调 URL

### 步骤 2: 创建 GitHub OAuth App

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 **New OAuth App**
3. 填写以下信息：

| 字段 | 值 |
|------|-----|
| Application name | `BingoHub` |
| Homepage URL | `http://localhost:5173` (本地开发) |
| Authorization callback URL | `https://exhhhnliwgvppgudfybe.supabase.co/auth/v1/callback` |

4. 点击 **Register application**
5. 复制生成的 **Client ID**
6. 点击 **Generate a new client secret** 并复制

### 步骤 3: 配置 Supabase GitHub Provider

回到 Supabase 的 GitHub Provider 配置页面：

1. **Enable** 打开
2. **Client ID**: 粘贴 GitHub OAuth App 的 Client ID
3. **Client Secret**: 粘贴 GitHub OAuth App 的 Client Secret
4. 点击 **Save**

### 步骤 4: 添加重定向 URL

在 Supabase Dashboard 中：

1. 进入 **Authentication** → **URL Configuration**
2. 在 **Redirect URLs** 中添加：

```
http://localhost:5173/dashboard
https://bingo-hub.vercel.app/dashboard
```

3. 点击 **Save**

---

## 4. 创建数据库表

### 方法 1: 使用 SQL 编辑器

1. 在 Supabase Dashboard 中，进入 **SQL Editor**
2. 点击 **New query**
3. 粘贴以下 SQL 并执行：

```sql
-- 登录日志表
CREATE TABLE IF NOT EXISTS auth_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  login_method TEXT CHECK (login_method IN ('github', 'email')),
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  login_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户资料表（可选，用于扩展用户信息）
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_timestamp ON auth_logs(login_timestamp DESC);

-- 启用行级安全策略 (RLS)
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 允许所有用户读取登录日志（仅管理员会使用）
CREATE POLICY "Allow read access" ON auth_logs
  FOR SELECT USING (true);

-- 允许插入登录日志
CREATE POLICY "Allow insert logs" ON auth_logs
  FOR INSERT WITH CHECK (true);

-- 用户资料策略
CREATE POLICY "Users can read all profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

4. 执行成功后，你应该看到 "Success. No rows returned"

### 方法 2: 使用 Supabase CLI

```bash
# 安装 Supabase CLI (如果未安装)
brew install supabase/tap/supabase

# 链接到你的项目
supabase link --project-ref exhhhnliwgvppgudfybe

# 执行迁移
supabase db push
```

---

## 5. 测试配置

### 测试本地开发

1. 确保 `.env.local` 配置正确
2. 启动开发服务器：
   ```bash
   npm run dev
   ```
3. 访问 `http://localhost:5173`
4. 点击 GitHub 登录按钮
5. 完成授权后应该跳转到 Dashboard

### 验证环境变量

在浏览器控制台执行：

```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### 检查网络请求

1. 打开浏览器开发者工具 → Network
2. 尝试登录
3. 检查是否有 `401 Unauthorized` 错误：
   - 如果有 → `VITE_SUPABASE_ANON_KEY` 不正确
   - 如果没有 → 检查其他错误信息

---

## 6. 常见问题

### Q1: 401 Unauthorized 错误

**症状：** 控制台显示 `GET https://xxx.supabase.co/auth/v1/user 401`

**原因：** `VITE_SUPABASE_ANON_KEY` 格式不正确

**解决：**
1. 重新从 Supabase Dashboard 复制完整的 anon/public key
2. 确保没有添加引号或修改内容
3. 重启开发服务器

### Q2: GitHub 登录后显示"访问被拒绝"

**原因：** 用户名不在管理员列表中

**解决：** 编辑 [src/auth/supabaseClient.ts](src/auth/supabaseClient.ts:25)：

```typescript
export const ADMIN_USERNAMES = ['jiangbingo', 'your_github_username'] as const;
```

### Q3: 环境变量不生效

**检查清单：**
- [ ] 本地开发：文件名是 `.env.local`（不是 `.env` 或 `.env.example`）
- [ ] Vite 项目：环境变量以 `VITE_` 开头
- [ ] 重启了开发服务器
- [ ] 检查 `.gitignore` 确保 `.env.local` 不会被提交

### Q4: GitHub OAuth 回调失败

**症状：** 登录后跳转回首页而不是 Dashboard

**解决：**
1. 检查 Supabase Authentication → URL Configuration 中的 Redirect URLs
2. 确保包含完整路径：`/dashboard`
3. 检查代码中的重定向配置（[authContext.tsx:153](src/auth/authContext.tsx:153)）

### Q5: Vercel 部署后无法登录

**检查清单：**
- [ ] Vercel 环境变量已配置
- [ ] 环境变量名称包含 `VITE_` 前缀
- [ ] 重新部署了项目
- [ ] GitHub OAuth App 的 Authorization callback URL 包含生产域名

---

## 配置检查清单

在完成配置后，请确认以下项目：

- [ ] `.env.local` 中 `VITE_SUPABASE_URL` 正确
- [ ] `.env.local` 中 `VITE_SUPABASE_ANON_KEY` 是完整的 JWT token
- [ ] GitHub OAuth App 已创建并启用
- [ ] Supabase GitHub Provider 已配置 Client ID 和 Secret
- [ ] Supabase Redirect URLs 包含本地和生产域名
- [ ] 数据库表 `auth_logs` 已创建
- [ ] Vercel 环境变量已设置（如需部署）
- [ ] 本地开发服务器运行正常
- [ ] GitHub 登录流程测试通过

---

## 相关文件

| 文件 | 说明 |
|------|------|
| [.env.local](/.env.local) | 本地环境变量配置 |
| [.env.example](/.env.example) | 环境变量模板 |
| [src/auth/supabaseClient.ts](src/auth/supabaseClient.ts) | Supabase 客户端配置 |
| [src/auth/authContext.tsx](src/auth/authContext.tsx) | 认证上下文 |

---

## 需要帮助？

如果遇到问题，请提供：
1. 浏览器控制台的完整错误信息
2. 网络请求的失败详情
3. `.env.local` 中的配置（隐藏敏感信息）

如：
```
VITE_SUPABASE_URL=https://exhhhnliwgvppgudfybe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...（完整复制，不要修改）
```
