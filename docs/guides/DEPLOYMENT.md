# 部署指南

> BingoHub - Vercel 部署完整指南

---

## 快速开始

### 方式一：通过 Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 生产环境
vercel --prod
```

### 方式二：通过 GitHub 集成（推荐）

1. 访问 [vercel.com/new](https://vercel.com/new)
2. 导入你的 GitHub 仓库 `jiangbingo/bingoHub`
3. 配置环境变量（见下方）
4. 点击 Deploy

---

## 环境变量配置

### 获取 API Key

访问 [智谱AI开放平台](https://open.bigmodel.cn/usercenter/apikeys) 获取 API Key。

### Vercel 环境变量

进入 **Settings → Environment Variables**，添加：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `BIGMODEL_API_KEY` | 你的智谱AI API Key | Production, Preview, Development |

> **重要**: Vercel Serverless Functions 使用 `BIGMODEL_API_KEY`（无 `VITE_` 前缀）

### 本地开发环境

创建 `.env.local` 文件（已在 .gitignore 中保护）：

```bash
VITE_BIGMODEL_API_KEY=your_api_key_here
```

---

## 项目架构

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Browser   │ ───> │  Vercel Edge     │ ───> │  BigModel API   │
│  (React)    │      │  (/api/*)        │      │  (zhipuai)      │
└─────────────┘      └──────────────────┘      └─────────────────┘
```

### API 端点

| 功能 | 路径 | 方法 |
|------|------|------|
| 文本对话 | `/api/chat` | POST |
| 图像生成 | `/api/image` | POST |
| 视频生成 | `/api/video` | POST (创建), GET (查询) |

---

## 配置文件

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### 环境变量对比

| 环境 | 变量名 | 用途 |
|------|--------|------|
| 本地开发 | `VITE_BIGMODEL_API_KEY` | 前端直接调用 API |
| Vercel | `BIGMODEL_API_KEY` | Serverless Functions 代理 |

---

## 测试部署

### 本地测试 Vercel Functions

```bash
# 本地运行 Serverless Functions
vercel dev

# 访问 http://localhost:3000
```

### 测试 API 端点

```bash
# 测试对话 API
curl -X POST https://your-project.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4-flash","messages":[{"role":"user","content":"你好"}]}'

# 测试图像生成
curl -X POST https://your-project.vercel.app/api/image \
  -H "Content-Type: application/json" \
  -d '{"prompt":"一只可爱的小猫"}'
```

---

## 自定义域名

### 配置步骤

1. **Settings → Domains → Add Domain**
2. 输入你的域名 (如 `ai.yourdomain.com`)
3. 配置 DNS 记录

### DNS 配置

| 类型 | 名称 | 值 |
|------|------|-----|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

---

## 监控和日志

### Vercel Dashboard

- **Deployments**: 查看部署历史和状态
- **Logs**: 查看 Serverless Functions 日志
- **Analytics**: 访问分析和性能指标

### 查看日志

```bash
# 查看实时日志
vercel logs

# 查看特定部署的日志
vercel logs <deployment-url>
```

---

## 更新部署

### Git 工作流（自动部署）

```bash
git add .
git commit -m "feat: new feature"
git push origin main
# Vercel 自动部署
```

### 手动部署

```bash
vercel --prod
```

---

## 常见问题

### Q: API 调用返回 401 错误

A: 检查：
1. `BIGMODEL_API_KEY` 是否在 Vercel 环境变量中配置
2. API Key 格式是否正确
3. 重新部署项目以应用环境变量

### Q: 构建失败

A: 检查：
1. `npm run build` 是否在本地通过
2. TypeScript 类型错误
3. 依赖版本兼容性

### Q: Serverless Functions 超时

A: Vercel Hobby 计划限制：
- 函数执行时间: 10秒
- Pro 计划: 60秒

视频生成是异步任务，不受此限制。

### Q: 环境变量不生效

A: 确保：
1. Vercel 中使用 `BIGMODEL_API_KEY`（无 `VITE_` 前缀）
2. 重新部署项目
3. 检查变量应用于正确的环境（Production/Preview/Development）

---

## 部署检查清单

- [ ] `BIGMODEL_API_KEY` 已配置到 Vercel 环境变量
- [ ] 本地构建测试通过 (`npm run build`)
- [ ] 所有功能测试通过
- [ ] 自定义域名已配置 (可选)
- [ ] DNS 记录已更新 (自定义域名)

---

## 成本估算

### Vercel Pricing

| 计划 | 价格 | 带宽 | 函数执行 |
|------|------|------|----------|
| Hobby | 免费 | 100GB/月 | 100小时/月 |
| Pro | $20/月 | 1TB/月 | 1000小时/月 |

### BigModel API 成本

- 按实际使用量计费
- 详情: https://open.bigmodel.cn/pricing

---

## 安全建议

1. **API Key 保护**
   - 永远不要提交 `.env.local` 到 Git
   - 使用 Vercel 环境变量存储
   - 定期轮换密钥

2. **CORS 保护**
   - Serverless Functions 自动处理 CORS
   - 生产环境可添加 Origin 验证

3. **速率限制**
   - 考虑添加应用层速率限制
   - 监控 API 使用量

---

**部署完成后，你的 BingoHub 将通过 Vercel 全球 CDN 提供服务！** 🌍
