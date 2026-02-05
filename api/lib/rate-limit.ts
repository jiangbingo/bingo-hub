/**
 * 简单的内存速率限制器
 * 适用于 Vercel Serverless Functions
 *
 * 限制规则：每个 IP 每 10 秒最多 10 次请求
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

export interface RateLimitConfig {
  /** 时间窗口（毫秒） */
  windowMs: number;
  /** 最大请求数 */
  maxRequests: number;
}

/**
 * 内存存储（在 Serverless 环境中，每个函数实例有独立内存）
 * 注意：在 Vercel Serverless 中，内存仅在函数实例存活期间有效
 * 如需分布式速率限制，建议使用 Upstash Redis
 */
const store = new Map<string, RateLimitEntry>();

/**
 * 清理过期条目
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  store.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => store.delete(key));
}

/**
 * 获取客户端 IP 地址
 */
export function getClientIp(req: { headers: Record<string, string | string[] | undefined> }): string {
  // 优先使用 x-forwarded-for
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // x-forwarded-for 可能是字符串或数组，统一处理
    const value = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    // x-forwarded-for 可能包含多个 IP，取第一个
    return value.split(',')[0].trim();
  }

  // 其次使用 x-real-ip
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  // 兜底使用空字符串（实际场景中不应该出现）
  return 'unknown';
}

/**
 * 创建速率限制器
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests } = config;

  return {
    /**
     * 检查请求是否允许
     */
    check(identifier: string): RateLimitResult {
      const now = Date.now();

      // 定期清理过期条目
      if (store.size > 1000) {
        cleanupExpiredEntries();
      }

      const entry = store.get(identifier);

      // 如果没有记录或已过期，创建新记录
      if (!entry || now > entry.resetTime) {
        const newEntry: RateLimitEntry = {
          count: 1,
          resetTime: now + windowMs,
        };
        store.set(identifier, newEntry);

        return {
          allowed: true,
          limit: maxRequests,
          remaining: maxRequests - 1,
          resetTime: newEntry.resetTime,
        };
      }

      // 检查是否超过限制
      if (entry.count >= maxRequests) {
        return {
          allowed: false,
          limit: maxRequests,
          remaining: 0,
          resetTime: entry.resetTime,
        };
      }

      // 增加计数
      entry.count += 1;
      store.set(identifier, entry);

      return {
        allowed: true,
        limit: maxRequests,
        remaining: maxRequests - entry.count,
        resetTime: entry.resetTime,
      };
    },

    /**
     * 重置指定标识符的限制
     */
    reset(identifier: string): void {
      store.delete(identifier);
    },

    /**
     * 清空所有记录
     */
    clear(): void {
      store.clear();
    },
  };
}

/**
 * 预定义的速率限制器配置
 */
export const RATE_LIMIT_CONFIGS = {
  /** 严格限制：10秒10次 */
  STRICT: { windowMs: 10000, maxRequests: 10 } as const,
  /** 中等限制：1分钟30次 */
  MEDIUM: { windowMs: 60000, maxRequests: 30 } as const,
  /** 宽松限制：1分钟60次 */
  LOOSE: { windowMs: 60000, maxRequests: 60 } as const,
} as const;
