# Vercel Serverless Functions 速率限制

为 Vercel Serverless Functions 添加了速率限制功能，防止 API 滥用。

## 已添加速率限制的 API

- `/api/chat` - 文本对话 API
- `/api/image` - 图像生成 API
- `/api/video` - 视频生成 API

## 限制规则

每个 IP 地址每 10 秒最多 10 次请求。

## 响应头

当请求受到速率限制时，会返回以下响应头：

- `X-RateLimit-Limit` - 时间窗口内的最大请求数
- `X-RateLimit-Remaining` - 剩余可用请求数
- `X-RateLimit-Reset` - 限制重置时间（ISO 8601 格式）
- `Retry-After` - 建议重试的秒数（仅在超限时）

## 超出限制的响应

当超出速率限制时，返回 HTTP 429 状态码：

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Try again in X seconds.",
  "retryAfter": 5
}
```

## 实现说明

### 使用的 IP 地址获取顺序

1. `x-forwarded-for` 头的第一个 IP
2. `x-real-ip` 头
3. 兜底使用 `unknown`

### 注意事项

在 Vercel Serverless 环境中：

- 内存速率限制仅在单个函数实例内有效
- 如果需要跨实例的分布式速率限制，建议使用 Upstash Redis
- 当前实现适合防止单个用户的突发请求

### 文件结构

```
api/
├── lib/
│   ├── rate-limit.ts              # 速率限制核心实现
│   ├── rate-limit-middleware.ts   # 中间件封装
│   └── __tests__/
│       └── rate-limit.test.ts     # 单元测试
├── chat.ts                         # 已添加速率限制
├── image.ts                        # 已添加速率限制
└── video.ts                        # 已添加速率限制
```

## 自定义配置

如需更改速率限制配置，可以在 API 文件中修改 `rateLimiter` 的配置：

```typescript
const rateLimiter = createRateLimitMiddleware({
  config: {
    windowMs: 10000,    // 时间窗口（毫秒）
    maxRequests: 10     // 最大请求数
  },
});
```

### 预定义配置

可以使用预定义的配置：

```typescript
import { RATE_LIMIT_CONFIGS } from './lib/rate-limit';

// 严格：10秒10次
RATE_LIMIT_CONFIGS.STRICT

// 中等：1分钟30次
RATE_LIMIT_CONFIGS.MEDIUM

// 宽松：1分钟60次
RATE_LIMIT_CONFIGS.LOOSE
```

## 测试

运行速率限制的单元测试：

```bash
npm test api/lib/__tests__/rate-limit.test.ts
```

## 升级到分布式速率限制

如需使用 Upstash Redis 实现分布式速率限制：

1. 安装 `@upstash/ratelimit` 和 `@upstash/redis`
2. 替换内存存储为 Redis 存储
3. 确保设置了 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN` 环境变量
