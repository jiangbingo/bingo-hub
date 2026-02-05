/**
 * Chat API Tests
 * 测试 /api/chat 端点
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import handler from '../chat';

// Mock crypto.subtle
vi.stubGlobal('crypto', {
  subtle: {
    importKey: vi.fn(() => Promise.resolve({
      algorithm: { name: 'HMAC', hash: 'SHA-256' },
      extractable: false,
      type: 'secret',
    })),
    sign: vi.fn(async () => {
      return new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);
    }),
  },
});

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment
const mockEnv = {
  BIGMODEL_API_KEY: 'test-id.test-secret',
};

describe('/api/chat', () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    // 设置环境变量
    process.env.BIGMODEL_API_KEY = mockEnv.BIGMODEL_API_KEY;

    // 创建 mock response
    mockRes = {
      status: vi.fn(() => mockRes),
      json: vi.fn(() => mockRes),
      setHeader: vi.fn(() => mockRes),
      write: vi.fn(() => mockRes),
      end: vi.fn(() => mockRes),
    };

    // 重置 fetch mock
    mockFetch.mockClear();
  });

  afterEach(() => {
    delete process.env.BIGMODEL_API_KEY;
  });

  const createMockRequest = (method: string, body?: any): any => ({
    method,
    body,
  });

  describe('HTTP Method Validation', () => {
    it('should return 405 for non-POST requests', async () => {
      mockReq = createMockRequest('GET');

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
    });

    it('should return 405 for PUT requests', async () => {
      mockReq = createMockRequest('PUT');

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(405);
    });

    it('should return 405 for DELETE requests', async () => {
      mockReq = createMockRequest('DELETE');

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(405);
    });
  });

  describe('Request Validation', () => {
    it('should return 400 when messages is missing', async () => {
      mockReq = createMockRequest('POST', {
        model: 'glm-4-flash',
      });

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid messages format' });
    });

    it('should return 400 when messages is not an array', async () => {
      mockReq = createMockRequest('POST', {
        messages: 'not an array',
        model: 'glm-4-flash',
      });

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid messages format' });
    });

    it('should return 400 when model is missing', async () => {
      mockReq = createMockRequest('POST', {
        messages: [{ role: 'user', content: 'Hello' }],
      });

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Model is required' });
    });

    it('should accept valid request with minimal parameters', async () => {
      mockReq = createMockRequest('POST', {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'glm-4-flash',
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'chat-123',
          choices: [{ message: { content: 'Hi there!' } }],
        }),
      });

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('API Key Handling', () => {
    it('should return 500 when API key is not configured', async () => {
      delete process.env.BIGMODEL_API_KEY;

      mockReq = createMockRequest('POST', {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'glm-4-flash',
      });

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'API key not configured' });
    });

    it('should generate JWT token from API key', async () => {
      mockReq = createMockRequest('POST', {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'glm-4-flash',
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'chat-123',
          choices: [],
        }),
      });

      await handler(mockReq, mockRes);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Bearer /),
          }),
        })
      );
    });
  });

  describe('Non-Streaming Response', () => {
    beforeEach(() => {
      mockReq = createMockRequest('POST', {
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi' },
        ],
        model: 'glm-4-flash',
        temperature: 0.5,
        top_p: 0.8,
        max_tokens: 2048,
      });
    });

    it('should forward response from BigModel API', async () => {
      const apiResponse = {
        id: 'chat-123',
        created: Date.now(),
        model: 'glm-4-flash',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Hello! How can I help you?',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => apiResponse,
      });

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(apiResponse);
    });

    it('should use default parameters when not provided', async () => {
      mockReq = createMockRequest('POST', {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'glm-4-flash',
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await handler(mockReq, mockRes);

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.temperature).toBe(0.7);
      expect(requestBody.top_p).toBe(0.9);
      expect(requestBody.max_tokens).toBe(4096);
      expect(requestBody.stream).toBe(false);
    });

    it('should handle BigModel API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: { message: 'Invalid API key' } }),
      });

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'BigModel API error',
        details: { error: { message: 'Invalid API key' } },
      });
    });

    it('should handle API errors without JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('No JSON');
        },
      });

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'BigModel API error',
        details: {},
      });
    });
  });

  describe('Streaming Response', () => {
    beforeEach(() => {
      mockReq = createMockRequest('POST', {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'glm-4-flash',
        stream: true,
      });
    });

    it('should set correct headers for streaming', async () => {
      const mockReader = {
        read: vi.fn(async () => ({ done: true, value: new Uint8Array() })),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      await handler(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
    });

    it('should forward streaming chunks', async () => {
      const chunks = [
        'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
        'data: [DONE]\n\n',
      ];

      let chunkIndex = 0;
      const mockReader = {
        read: vi.fn(async () => {
          if (chunkIndex < chunks.length) {
            const chunk = chunks[chunkIndex];
            chunkIndex++;
            return { done: false, value: new TextEncoder().encode(chunk) };
          }
          return { done: true, value: new Uint8Array() };
        }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      await handler(mockReq, mockRes);

      expect(mockRes.write).toHaveBeenCalledWith(expect.stringContaining('Hello'));
      expect(mockRes.write).toHaveBeenCalledWith(expect.stringContaining('world'));
      expect(mockRes.write).toHaveBeenCalledWith('data: [DONE]\n\n');
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should handle streaming with buffer splitting', async () => {
      // 模拟一个 chunk 在中间被分割的情况
      const fullChunk = 'data: {"choices":[{"delta":{"content":"test"}}]}\n\n';
      const half1 = fullChunk.slice(0, 10);
      const half2 = fullChunk.slice(10);

      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(half1) })
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(half2) })
          .mockResolvedValueOnce({ done: true, value: new Uint8Array() }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      await handler(mockReq, mockRes);

      expect(mockRes.write).toHaveBeenCalled();
    });

    it('should skip invalid JSON in stream', async () => {
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: invalid json\n\n') })
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: [DONE]\n\n') })
          .mockResolvedValueOnce({ done: true, value: new Uint8Array() }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      await handler(mockReq, mockRes);

      // 应该跳过无效 JSON 但继续处理
      expect(mockRes.write).toHaveBeenCalledWith('data: [DONE]\n\n');
    });

    it('should return 500 when no response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: null,
      });

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No response body' });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockReq = createMockRequest('POST', {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'glm-4-flash',
      });

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Network error',
      });
    });

    it('should handle unknown errors', async () => {
      mockReq = createMockRequest('POST', {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'glm-4-flash',
      });

      mockFetch.mockRejectedValueOnce('string error');

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Unknown error',
      });
    });

    it('should log errors to console', async () => {
      mockReq = createMockRequest('POST', {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'glm-4-flash',
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockFetch.mockRejectedValueOnce(new Error('Test error'));

      await handler(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith('Chat API error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('JWT Token Generation', () => {
    it('should handle invalid API key format', async () => {
      process.env.BIGMODEL_API_KEY = 'invalid-format';

      mockReq = createMockRequest('POST', {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'glm-4-flash',
      });

      // JWT 生成会失败
      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('should generate valid token structure', async () => {
      mockReq = createMockRequest('POST', {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'glm-4-flash',
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await handler(mockReq, mockRes);

      const authHeader = JSON.parse(mockFetch.mock.calls[0][1].headers).Authorization;
      expect(authHeader).toMatch(/^Bearer /);
      expect(authHeader).toMatch(/\./); // 应该包含点号分隔符
    });
  });

  describe('Request Forwarding', () => {
    it('should include all provided parameters', async () => {
      mockReq = createMockRequest('POST', {
        messages: [
          { role: 'system', content: 'You are helpful' },
          { role: 'user', content: 'Hello' },
        ],
        model: 'glm-4',
        temperature: 0.3,
        top_p: 0.7,
        max_tokens: 1024,
        stream: false,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await handler(mockReq, mockRes);

      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[0]).toBe('https://open.bigmodel.cn/api/paas/v4/chat/completions');

      const body = JSON.parse(fetchCall[1].body);
      expect(body.model).toBe('glm-4');
      expect(body.messages).toHaveLength(2);
      expect(body.temperature).toBe(0.3);
      expect(body.top_p).toBe(0.7);
      expect(body.max_tokens).toBe(1024);
    });
  });
});
