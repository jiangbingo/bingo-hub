/**
 * 速率限制器测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRateLimiter, getClientIp, RATE_LIMIT_CONFIGS } from '../rate-limit';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // 清空存储
    const limiter = createRateLimiter({ windowMs: 10000, maxRequests: 10 });
    limiter.clear();
  });

  describe('createRateLimiter', () => {
    it('should allow requests within limit', () => {
      const limiter = createRateLimiter({ windowMs: 10000, maxRequests: 5 });

      for (let i = 0; i < 5; i++) {
        const result = limiter.check('user1');
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }
    });

    it('should block requests exceeding limit', () => {
      const limiter = createRateLimiter({ windowMs: 10000, maxRequests: 3 });

      // 前3个请求应该通过
      for (let i = 0; i < 3; i++) {
        const result = limiter.check('user1');
        expect(result.allowed).toBe(true);
      }

      // 第4个请求应该被阻止
      const result = limiter.check('user1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      const limiter = createRateLimiter({ windowMs: 100, maxRequests: 2 });

      // 使用所有配额
      expect(limiter.check('user1').allowed).toBe(true);
      expect(limiter.check('user1').allowed).toBe(true);
      expect(limiter.check('user1').allowed).toBe(false);

      // 等待窗口过期
      await new Promise(resolve => setTimeout(resolve, 150));

      // 应该再次允许请求
      const result = limiter.check('user1');
      expect(result.allowed).toBe(true);
    });

    it('should handle multiple users independently', () => {
      const limiter = createRateLimiter({ windowMs: 10000, maxRequests: 2 });

      // 用户1用完配额
      expect(limiter.check('user1').allowed).toBe(true);
      expect(limiter.check('user1').allowed).toBe(true);
      expect(limiter.check('user1').allowed).toBe(false);

      // 用户2应该仍然有配额
      expect(limiter.check('user2').allowed).toBe(true);
      expect(limiter.check('user2').allowed).toBe(true);
      expect(limiter.check('user2').allowed).toBe(false);
    });

    it('should return correct limit info', () => {
      const limiter = createRateLimiter({ windowMs: 10000, maxRequests: 10 });

      const result = limiter.check('user1');
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(9);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });
  });

  describe('reset', () => {
    it('should reset specific user', () => {
      const limiter = createRateLimiter({ windowMs: 10000, maxRequests: 2 });

      expect(limiter.check('user1').allowed).toBe(true);
      expect(limiter.check('user1').allowed).toBe(true);
      expect(limiter.check('user1').allowed).toBe(false);

      limiter.reset('user1');

      expect(limiter.check('user1').allowed).toBe(true);
    });

    it('should not affect other users', () => {
      const limiter = createRateLimiter({ windowMs: 10000, maxRequests: 2 });

      limiter.check('user1');
      limiter.check('user2');

      limiter.reset('user1');

      // user1 应该重置
      expect(limiter.check('user1').allowed).toBe(true);

      // user2 应该仍然有1次剩余
      expect(limiter.check('user2').allowed).toBe(true);
      expect(limiter.check('user2').allowed).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      const limiter = createRateLimiter({ windowMs: 10000, maxRequests: 1 });

      limiter.check('user1');
      limiter.check('user2');
      limiter.check('user3');

      limiter.clear();

      // 所有用户应该都能再次请求
      expect(limiter.check('user1').allowed).toBe(true);
      expect(limiter.check('user2').allowed).toBe(true);
      expect(limiter.check('user3').allowed).toBe(true);
    });
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for', () => {
      const req = {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      };
      expect(getClientIp(req)).toBe('192.168.1.1');
    });

    it('should extract IP from x-forwarded-for array', () => {
      const req = {
        headers: {
          'x-forwarded-for': ['192.168.1.1, 10.0.0.1'],
        },
      };
      expect(getClientIp(req)).toBe('192.168.1.1');
    });

    it('should fallback to x-real-ip', () => {
      const req = {
        headers: {
          'x-real-ip': '192.168.1.2',
        },
      };
      expect(getClientIp(req)).toBe('192.168.1.2');
    });

    it('should return unknown when no headers present', () => {
      const req = {
        headers: {},
      };
      expect(getClientIp(req)).toBe('unknown');
    });
  });

  describe('RATE_LIMIT_CONFIGS', () => {
    it('should have strict config', () => {
      expect(RATE_LIMIT_CONFIGS.STRICT.windowMs).toBe(10000);
      expect(RATE_LIMIT_CONFIGS.STRICT.maxRequests).toBe(10);
    });

    it('should have medium config', () => {
      expect(RATE_LIMIT_CONFIGS.MEDIUM.windowMs).toBe(60000);
      expect(RATE_LIMIT_CONFIGS.MEDIUM.maxRequests).toBe(30);
    });

    it('should have loose config', () => {
      expect(RATE_LIMIT_CONFIGS.LOOSE.windowMs).toBe(60000);
      expect(RATE_LIMIT_CONFIGS.LOOSE.maxRequests).toBe(60);
    });
  });
});
