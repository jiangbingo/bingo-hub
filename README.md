<div align="center">

# BingoHub

**AI 驱动的工作台平台** - 集成聊天、图像和视频生成功能

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-cyan)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.1.0-purple)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 项目简介

BingoHub 是一个功能丰富的 AI 工作台，提供三大核心功能模块：

- **聊天对话** - 基于 BigModel (智谱清言) 的智能对话
- **图像生成** - AI 驱动的图像创作工具
- **视频处理** - 视频任务管理和处理

### 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 状态管理 | Zustand |
| 样式方案 | Tailwind CSS + CSS Modules |
| 认证服务 | Supabase Auth (GitHub OAuth) |
| AI 服务 | BigModel (智谱清言) API |
| 部署平台 | Vercel |

---

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 创建 `.env.local`：

```bash
cp .env.example .env.local
```

在 `.env.local` 中配置以下变量：

```bash
# BigModel API Key (获取地址: https://open.bigmodel.cn/usercenter/apikeys)
VITE_BIGMODEL_API_KEY=your_api_key_here

# Supabase 项目 URL (获取地址: https://supabase.com/dashboard/project/_/settings/api)
VITE_SUPABASE_URL=your_supabase_project_url

# Supabase 匿名密钥
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> 详细配置说明请参阅 [Supabase 配置指南](docs/SUPABASE_SETUP.md)

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

---

## 功能模块

### 聊天 (Chat)

- 流式对话响应
- 多模型支持 (GLM-4, GLM-4-Flash, GLM-4-Air)
- 对话历史管理
- Markdown 渲染支持

### 图像 (Image)

- AI 图像生成
- 图像预览和下载
- 生成历史记录

### 视频 (Video)

- 视频任务管理
- 任务状态跟踪
- 批量处理支持

---

## 认证系统

项目支持两种登录方式：

1. **GitHub OAuth** - 推荐，一键登录
2. **邮箱密码** - 传统方式

### 管理员配置

编辑 `src/auth/supabaseClient.ts` 中的管理员列表：

```typescript
export const ADMIN_USERNAMES = ['your_github_username'] as const;
```

---

## 项目结构

```
bingoHub/
├── api/                    # Vercel Serverless Functions
│   ├── chat.ts            # 聊天 API
│   ├── image.ts           # 图像生成 API
│   └── video.ts           # 视频处理 API
├── src/
│   ├── auth/              # 认证模块
│   │   ├── authContext.tsx
│   │   ├── supabaseClient.ts
│   │   └── types.ts
│   ├── components/        # React 组件
│   │   ├── auth/         # 认证组件
│   │   ├── layout/       # 布局组件
│   │   ├── settings/     # 设置组件
│   │   └── ui/           # UI 组件
│   ├── pages/            # 页面组件
│   ├── services/         # API 服务
│   ├── stores/           # Zustand 状态管理
│   ├── types/            # TypeScript 类型定义
│   └── utils/            # 工具函数
├── docs/                 # 项目文档
│   ├── SUPABASE_SETUP.md # Supabase 配置指南
│   ├── TESTING.md        # 测试文档
│   └── guides/           # 使用指南
├── .env.example          # 环境变量模板
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 部署

### Vercel 部署

1. Fork 或 Clone 本仓库
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 配置环境变量
4. 部署完成

> 详细部署说明请参阅 [部署指南](docs/guides/DEPLOYMENT.md)

---

## 测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行 Vercel API 测试
npm run test:api
```

---

## 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run test` | 运行测试 |
| `npm run lint` | 代码检查 |
| `npm run type-check` | TypeScript 类型检查 |

---

## 文档

- [项目结构](PROJECT_STRUCTURE.md)
- [Supabase 配置指南](docs/SUPABASE_SETUP.md)
- [测试文档](docs/TESTING.md)
- [部署指南](docs/guides/DEPLOYMENT.md)

---

## License

[MIT](LICENSE)

---

## 相关链接

- [BigModel API 文档](https://open.bigmodel.cn/dev/api)
- [Supabase 文档](https://supabase.com/docs)
- [Vite 文档](https://vitejs.dev/)
- [React 文档](https://react.dev/)

---

<div align="center">

**Built with ❤️ by [jiangbingo](https://github.com/jiangbingo)**

</div>
