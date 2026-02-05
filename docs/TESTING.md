# 测试文档

## 概述

本项目使用 Vitest 和 Testing Library 进行单元测试和集成测试。

## 安装依赖

```bash
npm install
```

## 测试命令

| 命令 | 说明 |
|------|------|
| `npm test` | 运行测试（监视模式） |
| `npm run test:run` | 运行所有测试一次 |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |
| `npm run test:ui` | 启动 Vitest UI 界面 |
| `npm run test:watch` | 监视模式运行测试 |

## 测试覆盖目标

- **语句覆盖率**: >= 60%
- **分支覆盖率**: >= 60%
- **函数覆盖率**: >= 60%
- **行覆盖率**: >= 60%

## 测试结构

```
src/__tests__/
├── setup.ts              # 测试环境配置
├── services/             # 服务层测试
│   └── bigmodelService.test.ts
├── stores/               # 状态管理测试
│   └── appStore.test.ts
└── utils/                # 工具函数测试
    └── storage.test.ts

api/__tests__/
└── chat.test.ts          # API 端点测试
```

## 测试文件说明

### 1. bigmodelService.test.ts

测试 BigModel API 服务的所有功能：

- `chatCompletion` - 非流式聊天完成
- `chatCompletionStream` - 流式聊天完成
- `generateImage` - 图像生成
- `downloadImage` - 图像下载
- `copyImageUrl` - 复制图像链接
- `generateVideoAsync` - 视频生成
- `getVideoStatus` - 视频状态查询
- `pollVideoResult` - 轮询视频结果
- `downloadVideo` - 视频下载

### 2. storage.test.ts

测试存储工具的所有功能：

- `StorageManager` - 基本存储管理
  - `getStats()` - 获取存储统计
  - `isNearLimit()` - 检查存储限额
  - `setItem()` / `getItem()` / `removeItem()` - CRUD 操作
  - `clear()` - 清空存储
  - `keys()` - 获取键列表
  - `clearOldest()` - 清理旧数据

- `CompressedStorage` - 压缩存储
  - `setItem()` - 压缩存储
  - `getItem()` - 解压读取
  - `removeItem()` - 删除

- `VersionedStorage` - 版本化存储
  - `getState()` - 获取状态（带迁移）
  - `setState()` - 保存状态
  - `clear()` - 清除

- `createPersistStorage()` - Zustand 持久化适配器
- `exportStorage()` / `importStorage()` - 导入导出
- `clearAppStorage()` - 清空应用存储

### 3. appStore.test.ts

测试 Zustand 状态管理：

- 初始状态
- 消息管理 (addMessage, clearMessages)
- 会话管理 (createSession, updateSession, deleteSession, setCurrentSession, getSessionById)
- 资产生成管理 (addGeneratedAsset, deleteGeneratedAsset, getAssetsBySessionId, getAssetsByType)
- 主题管理 (setTheme)
- 模型选择 (setSelectedModel)
- 状态不可变性
- 复杂工作流

### 4. chat.test.ts

测试 API 端点：

- HTTP 方法验证
- 请求体验证
- API Key 处理
- 非流式响应
- 流式响应
- 错误处理
- JWT Token 生成

## Mock 配置

测试环境在 `src/__tests__/setup.ts` 中配置了以下 Mock：

- `localStorage` - 浏览器本地存储
- `navigator.clipboard` - 剪贴板 API
- `URL.createObjectURL` / `URL.revokeObjectURL` - URL 操作
- `document.createElement` - DOM 操作（用于下载）
- `crypto.subtle` - 加密 API（用于 JWT 生成）
- `fetch` - HTTP 请求

## 运行特定测试

```bash
# 运行单个测试文件
npm test -- bigmodelService.test.ts

# 运行匹配模式的测试
npm test -- --grep "storage"

# 运行特定测试套件
npm test -- -t "Session Management"
```

## 查看覆盖率报告

```bash
npm run test:coverage
```

覆盖率报告将生成在 `coverage/` 目录：
- `coverage/index.html` - HTML 格式报告
- `coverage/lcov.info` - LCOV 格式（用于 CI）

## 添加新测试

1. 在对应目录创建 `*.test.ts` 文件
2. 导入需要的测试工具和待测试模块
3. 编写测试用例

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { myFunction } from '../myModule';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

## TDD 流程

遵循红-绿-重构循环：

1. **RED** - 编写失败的测试
2. **GREEN** - 编写最小实现使测试通过
3. **REFACTOR** - 重构代码改进质量
4. 验证覆盖率 >= 60%

## 常见问题

### 测试超时

如果测试超时，可以在测试中增加超时时间：

```typescript
it('should complete', async () => {
  // ...
}, { timeout: 10000 });
```

### 异步测试

使用 `async/await` 处理异步操作：

```typescript
it('should fetch data', async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});
```

### 清理副作用

使用 `beforeEach` 清理状态：

```typescript
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
```
