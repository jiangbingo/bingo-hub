# 测试文件摘要

## 已创建的测试文件

### 1. vitest.config.ts
- Vitest 测试框架配置
- 使用 jsdom 环境
- 覆盖率阈值设为 60%
- 包含路径别名配置

### 2. src/__tests__/setup.ts
- 测试环境全局配置
- Mock localStorage、clipboard、URL API
- Mock crypto.subtle 用于 JWT 生成
- Mock fetch 用于 HTTP 请求测试

### 3. src/__tests__/services/bigmodelService.test.ts
**测试 BigModel API 服务（约 500+ 行）**

测试覆盖：
- `getApiKey()` - API Key 获取
- `chatCompletion()` - 非流式聊天
  - 正确参数传递
  - 默认模型处理
  - 错误响应处理
  - 网络错误处理
- `chatCompletionStream()` - 流式聊天
  - 流选项设置
  - [DONE] 信号处理
  - 响应体缺失处理
  - 无效 JSON 跳过
- `generateImage()` - 图像生成
  - API Key 验证
  - 参数正确性
  - 默认值处理
  - API 错误处理
- `downloadImage()` - 图像下载
  - 默认/自定义文件名
  - 下载错误处理
- `copyImageUrl()` - 复制链接
  - 剪贴板操作
  - 错误处理
- `generateVideoAsync()` - 视频生成
  - API Key 验证
  - 请求提交
  - 默认模型
- `getVideoStatus()` - 视频状态
  - 成功状态
  - 失败状态
- `pollVideoResult()` - 轮询结果
  - 成功轮询
  - 失败处理
  - 超时处理
- `downloadVideo()` - 视频下载
  - 默认/自定义文件名

### 4. src/__tests__/utils/storage.test.ts
**测试存储工具（约 600+ 行）**

测试覆盖：
- `StorageManager` - 基本存储管理
  - `getStats()` - 统计信息计算
  - `isNearLimit()` - 限额检测
  - `setItem()` - 存储与配额处理
  - `getItem()` - 读取与 JSON 解析
  - `removeItem()` / `clear()` - 删除操作
  - `keys()` - 键列表与过滤
  - `clearOldest()` - 旧数据清理
- `CompressedStorage` - 压缩存储
  - 压缩存储操作
  - 解压读取
  - 错误处理
- `VersionedStorage` - 版本化存储
  - 状态读取
  - 版本迁移
  - 状态保存
  - 清除操作
- `createPersistStorage()` - Zustand 适配器
- `exportStorage()` / `importStorage()` - 导入导出
- `clearAppStorage()` - 应用存储清理

### 5. src/__tests__/stores/appStore.test.ts
**测试 Zustand 状态管理（约 600+ 行）**

测试覆盖：
- 初始状态验证
- 消息管理
  - 添加消息
  - 多消息顺序
  - 清空消息
  - 所有角色类型
- 会话管理
  - 唯一 ID 生成
  - 会话属性
  - 当前会话设置
  - 会话更新
  - 会话删除
  - 关联资源删除
  - 不同模式支持
- 资产生成管理
  - ID 自动生成
  - 时间戳
  - 按会话过滤
  - 按类型过滤
  - 所有资源类型
- 主题管理
- 模型选择
- 状态不可变性
- 复杂工作流

### 6. api/__tests__/chat.test.ts
**测试聊天 API 端点（约 450+ 行）**

测试覆盖：
- HTTP 方法验证（405 错误）
- 请求体验证
  - 缺失 messages
  - 无效 messages 类型
  - 缺失 model
- API Key 处理
  - 未配置错误
  - JWT Token 生成
- 非流式响应
  - 响应转发
  - 默认参数
  - API 错误处理
- 流式响应
  - 正确头部设置
  - Chunk 转发
  - 缓冲区分割
  - 无效 JSON 处理
  - 响应体缺失
- 错误处理
  - 网络错误
  - 未知错误
  - 错误日志
- JWT Token 生成
  - 无效 API Key 格式
  - Token 结构验证
- 请求转发验证

## 测试统计

| 文件 | 测试套件 | 测试用例估计 |
|------|----------|-------------|
| bigmodelService.test.ts | ~10 | ~60+ |
| storage.test.ts | ~8 | ~50+ |
| appStore.test.ts | ~8 | ~50+ |
| chat.test.ts | ~7 | ~40+ |
| **总计** | **~33** | **~200+** |

## 覆盖率目标

配置的最低覆盖率阈值：
- Statements: 60%
- Branches: 60%
- Functions: 60%
- Lines: 60%

## 运行测试

```bash
# 安装依赖
npm install

# 运行所有测试
npm test

# 运行一次并生成覆盖率
npm run test:coverage

# 使用 UI 界面
npm run test:ui
```

## 下一步

1. 安装测试依赖
2. 运行测试验证一切正常
3. 根据覆盖率报告添加更多测试用例
4. 考虑添加 E2E 测试（Playwright）
