/**
 * 速率限制中间件
 * 用于 Vercel Serverless Functions
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRateLimiter, getClientIp, type RateLimitConfig } from './rate-limit';
import { setCORSHeaders } from '../cors';

export interface RateLimitMiddlewareOptions {
  /** 速率限制配置 */
  config: RateLimitConfig;
  /** 自定义键生成函数（默认使用 IP） */
  keyGenerator?: (req: VercelRequest) => string;
  /** 限制失败时的处理函数 */
  onLimitReached?: (req: VercelRequest, res: VercelResponse) => void;
}

/**
 * 兼容 VercelRequest 的 headers 类型
 */
type HeadersLike = Record<string, string | string[] | undefined>;

/**
 * 从 VercelRequest 获取兼容的 headers 对象
 */
function getHeadersLike(req: VercelRequest): HeadersLike {
  return req.headers as HeadersLike;
}

/**
 * 创建速率限制中间件
 */
export function createRateLimitMiddleware(options: RateLimitMiddlewareOptions) {
  const { config, keyGenerator, onLimitReached } = options;
  const limiter = createRateLimiter(config);

  return function rateLimit(req: VercelRequest, res: VercelResponse): boolean {
    // 生成标识符
    const identifier = keyGenerator ? keyGenerator(req) : getClientIp({ headers: getHeadersLike(req) });

    // 检查速率限制
    const result = limiter.check(identifier);

    // 设置响应头
    res.setHeader('X-RateLimit-Limit', result.limit.toString());
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      // 设置重试时间头
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());

      // 调用自定义处理函数或返回默认错误
      if (onLimitReached) {
        onLimitReached(req, res);
      } else {
        // 设置 CORS 头
        setCORSHeaders(req, res);

        res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          retryAfter,
        });
      }

      return false;
    }

    return true;
  };
}

/**
 * 预定义的中间件
 */
export const rateLimitMiddlewares = {
  /** 严格限制：10秒10次 */
  strict: createRateLimitMiddleware({
    config: { windowMs: 10000, maxRequests: 10 },
  }),

  /** 中等限制：1分钟30次 */
  medium: createRateLimitMiddleware({
    config: { windowMs: 60000, maxRequests: 30 },
  }),

  /** 宽松限制：1分钟60次 */
  loose: createRateLimitMiddleware({
    config: { windowMs: 60000, maxRequests: 60 },
  }),
} as const;
