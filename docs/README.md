# BingoHub 文档中心

> 项目文档索引

---

## 快速导航

| 文档 | 说明 |
|------|------|
| [项目结构](../PROJECT_STRUCTURE.md) | 完整的项目目录结构说明 |
| [部署指南](./guides/DEPLOYMENT.md) | Vercel 部署完整指南 |

---

## 文档分类

### 📖 指南 (Guides)

| 文档 | 描述 |
|------|------|
| [部署指南](./guides/DEPLOYMENT.md) | Vercel 部署、环境变量配置、自定义域名 |

### 🔍 审查 (Reviews)

| 文档 | 描述 |
|------|------|
| [项目上下文](./reviews/SESSION_CONTEXT.md) | 项目概述、技术栈、待办事项 |
| [代码审查报告](./reviews/CODE_REVIEW_REPORT.md) | 代码质量、安全审查、最佳实践 |

### 🎨 设计 (Design)

| 文档 | 描述 |
|------|------|
| [设置页面设计](./design/settings-design.md) | 设置功能设计文档 |

### 📦 归档 (Archive)

| 目录 | 描述 |
|------|------|
| [历史文档](./archive/history/) | 历史记录功能实施文档 |
| [项目计划](./archive/plans/) | 过去的项目实施计划 |

---

## 项目概述

**BingoHub** 是一个基于智谱 AI (BigModel) 的多模态 AI 创作平台。

### 核心功能

- 📝 **文本对话** - GLM-4 系列模型
- 🎨 **图像生成** - CogView-3 Plus/Flash
- 🎬 **视频生成** - CogVideoX-5B/2B
- 📜 **历史记录** - 会话与内容管理
- ⚙️ **设置管理** - API 配置、模型选择、主题切换

### 技术栈

```
Frontend:  React 19 + Vite 6 + TypeScript
State:     Zustand + persist
Router:    React Router v7
API:       智谱AI (zhipuai SDK + Vercel 代理)
Deploy:    Vercel (Serverless Functions)
DB:        IndexedDB (Dexie.js)
```

---

## 快速开始

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/jiangbingo/bingoHub.git
cd bingoHub

# 2. 安装依赖
npm install

# 3. 配置环境变量
echo "VITE_BIGMODEL_API_KEY=your_key_here" > .env.local

# 4. 启动开发服务器
npm run dev
```

### 环境变量

| 变量名 | 说明 |
|--------|------|
| `VITE_BIGMODEL_API_KEY` | 智谱AI API Key (本地开发) |
| `BIGMODEL_API_KEY` | 智谱AI API Key (Vercel) |

---

## 项目结构

```
bingoHub/
├── src/              # 主源代码
│   ├── components/   # React 组件
│   ├── pages/        # 页面组件
│   ├── services/     # API 服务
│   ├── stores/       # 状态管理
│   └── types/        # TypeScript 类型
├── api/              # Vercel Serverless Functions
├── docs/             # 文档目录
└── components/       # 旧版组件归档
```

详见 [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)

---

## 部署

详见 [部署指南](./guides/DEPLOYMENT.md)

```bash
# 通过 Vercel CLI
vercel --prod

# 或通过 GitHub 推送自动部署
git push origin main
```

---

## 路由结构

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | Dashboard | 仪表盘 |
| `/chat` | ChatPage | 文本对话 |
| `/image` | ImagePage | 图像生成 |
| `/video` | VideoPage | 视频生成 |
| `/history` | HistoryPage | 历史记录 |
| `/settings` | Settings | 设置页面 |

---

## 相关链接

- **智谱AI 开放平台**: https://open.bigmodel.cn
- **API 文档**: https://open.bigmodel.cn/dev/api
- **Vercel 文档**: https://vercel.com/docs

---

**最后更新**: 2026-02-02
