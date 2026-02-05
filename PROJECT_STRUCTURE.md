# BingoHub - 项目结构

> **最后更新**: 2026-02-02
> **项目名称**: BingoHub
> **技术栈**: React 19 + Vite 6 + TypeScript

---

## 目录结构

```
bingoHub/
├── api/                      # Vercel Serverless Functions
│   ├── chat.ts              # 对话 API 代理
│   ├── image.ts             # 图像生成 API 代理
│   └── video.ts             # 视频生成 API 代理
│
├── src/                      # 主源代码目录
│   ├── components/          # React 组件
│   │   ├── layout/         # 布局组件 (Header, Sidebar, MainLayout)
│   │   ├── settings/       # 设置页面组件
│   │   ├── ui/             # 通用 UI 组件
│   │   └── workspace/      # 功能工作区组件
│   │
│   ├── pages/              # 页面组件
│   │   ├── Dashboard.tsx   # 仪表盘
│   │   ├── ChatPage.tsx    # 文本对话
│   │   ├── ImagePage.tsx   # 图像生成
│   │   ├── VideoPage.tsx   # 视频生成
│   │   └── HistoryPage.tsx # 历史记录
│   │
│   ├── services/           # API 服务
│   │   ├── bigmodelService.ts    # 直接调用 API (本地)
│   │   ├── vercelApiService.ts   # Vercel 代理 (生产)
│   │   └── geminiService.ts      # Gemini AI 服务
│   │
│   ├── stores/             # Zustand 状态管理
│   │   ├── appStore.ts     # 主状态
│   │   ├── imageStore.ts   # 图像状态
│   │   └── settingsStore.ts # 设置状态
│   │
│   ├── styles/             # 样式文件
│   │   ├── theme.css       # 设计系统 CSS 变量
│   │   └── globals.css     # 全局样式
│   │
│   ├── types/              # TypeScript 类型定义
│   │   ├── bigmodel.ts     # BigModel 类型
│   │   ├── settings.ts     # 设置类型
│   │   └── index.ts        # 类型导出
│   │
│   ├── hooks/              # 自定义 Hooks
│   │   └── useTheme.ts     # 主题切换 Hook
│   │
│   ├── App.tsx             # 根应用组件
│   ├── main.tsx            # 应用入口
│   └── index.css           # 全局 CSS
│
├── components/              # 旧版组件 (已废弃，保留历史)
│   └── legacy/             # 旧版组件归档
│       ├── Dashboard.tsx
│       ├── ReasoningHub.tsx
│       ├── SonicLab.tsx
│       └── VisualStudio.tsx
│
├── docs/                    # 文档目录
│   ├── guides/             # 部署和使用指南
│   │   ├── DEPLOYMENT.md
│   │   └── VERCEL_DEPLOYMENT.md
│   │
│   ├── reviews/            # 审查和上下文文档
│   │   ├── CODE_REVIEW_REPORT.md
│   │   └── SESSION_CONTEXT.md
│   │
│   ├── history/            # 历史文档
│   │   ├── HISTORY_IMPLEMENTATION_REPORT.md
│   │   ├── HISTORY_QUICKSTART.md
│   │   └── HISTORY_USAGE_EXAMPLES.md
│   │
│   ├── design/             # 设计文档
│   │   └── settings-design.md
│   │
│   └── plans/              # 项目计划
│       ├── 2026-01-31-bigmodel-explorer-platform.md
│       └── 2026-02-01-ui-ux-optimization.md
│
├── .claude/                 # Claude Code 配置 (可选)
├── api/                     # Vercel Serverless Functions
├── dist/                    # 构建输出目录
├── node_modules/            # 依赖包
├── components/              # 旧版组件归档
│
├── .env.example             # 环境变量模板
├── .env.local               # 本地环境变量 (不提交)
├── .gitignore               # Git 忽略配置
├── index.html               # HTML 入口
├── package.json             # 项目配置
├── package-lock.json        # 依赖锁定文件
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
├── vercel.json              # Vercel 部署配置
└── README.md                # 项目说明
```

---

## 文件说明

### 配置文件

| 文件 | 说明 |
|------|------|
| `package.json` | 项目依赖和脚本配置 |
| `tsconfig.json` | TypeScript 编译配置 |
| `vite.config.ts` | Vite 构建工具配置 |
| `vercel.json` | Vercel 部署配置 |
| `.gitignore` | Git 忽略文件规则 |
| `.env.example` | 环境变量模板 |

### 入口文件

| 文件 | 说明 |
|------|------|
| `index.html` | HTML 入口，引入 `/src/main.tsx` |
| `src/main.tsx` | React 应用入口，渲染 `App.tsx` |
| `src/App.tsx` | 根应用组件，配置路由 |

### API 端点 (Vercel Serverless Functions)

| 端点 | 说明 |
|------|------|
| `/api/chat` | 对话 API 代理 |
| `/api/image` | 图像生成 API 代理 |
| `/api/video` | 视频生成 API 代理 |

---

## 路由结构

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | 重定向到 `/dashboard` | 首页 |
| `/dashboard` | `Dashboard.tsx` | 仪表盘 |
| `/chat` | `ChatPage.tsx` | 文本对话 |
| `/image` | `ImagePage.tsx` | 图像生成 |
| `/video` | `VideoPage.tsx` | 视频生成 |
| `/history` | `HistoryPage.tsx` | 历史记录 |
| `/settings` | 设置组件 | 设置页面 |

---

## 环境变量

### 本地开发
```bash
# .env.local (不提交到 Git)
VITE_BIGMODEL_API_KEY=your_api_key_here
```

### Vercel 部署
```
Settings → Environment Variables
- BIGMODEL_API_KEY (无 VITE_ 前缀)
```

---

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 本地测试 Vercel Functions
vercel dev

# 部署到 Vercel
vercel --prod
```

---

## 代码规范

- **命名**: PascalCase (组件), camelCase (函数/变量)
- **路径别名**: `@/*` → `./src/*`
- **状态管理**: Zustand + persist
- **样式**: CSS + 设计系统变量
- **不可变性**: 使用展开运算符，避免直接突变

---

## 相关文档

- [README.md](./README.md) - 项目概述
- [docs/reviews/CODE_REVIEW_REPORT.md](./docs/reviews/CODE_REVIEW_REPORT.md) - 代码审查报告
- [docs/reviews/SESSION_CONTEXT.md](./docs/reviews/SESSION_CONTEXT.md) - 项目上下文
- [docs/guides/DEPLOYMENT.md](./docs/guides/DEPLOYMENT.md) - 部署指南
