/**
 * BigModel Service Tests
 * 测试 BigModel API 服务
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  chatCompletion,
  chatCompletionStream,
  getApiKey,
  generateImage,
  downloadImage,
  copyImageUrl,
  generateVideoAsync,
  getVideoStatus,
  pollVideoResult,
  downloadVideo,
  type Message,
  type ChatResponse,
} from '../../services/bigmodelService';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('bigmodelService', () => {
  beforeEach(() => {
    // 设置环境变量
    vi.stubEnv('VITE_BIGMODEL_API_KEY', 'test-id.test-secret');
  });

  afterEach(() => {
    mockFetch.mockClear();
  });

  describe('getApiKey', () => {
    it('should return API key from environment', () => {
      expect(getApiKey()).toBe('test-id.test-secret');
    });

    it('should return empty string when API key is not set', () => {
      vi.stubEnv('VITE_BIGMODEL_API_KEY', '');
      expect(getApiKey()).toBe('');
    });
  });

  describe('chatCompletion', () => {
    const mockMessages: Message[] = [
      { role: 'user', content: 'Hello' },
    ];

    const mockResponse: ChatResponse = {
      id: 'chat-123',
      created: Date.now(),
      model: 'glm-4-flash',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: 'Hi there!',
        },
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      },
    };

    it('should call API with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await chatCompletion(mockMessages, 'test-api-key', 'glm-4-flash');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
          }),
          body: expect.stringContaining('"model":"glm-4-flash"'),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should use default model when not specified', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await chatCompletion(mockMessages, 'test-api-key');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"model":"glm-4-flash"'),
        })
      );
    });

    it('should throw error when API returns error status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(chatCompletion(mockMessages, 'invalid-key'))
        .rejects.toThrow('API Error: 401 Unauthorized');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(chatCompletion(mockMessages, 'test-api-key'))
        .rejects.toThrow('Network error');
    });
  });

  describe('chatCompletionStream', () => {
    const mockMessages: Message[] = [
      { role: 'user', content: 'Hello' },
    ];

    it('should call API with stream option', async () => {
      const chunks = ['Hello', ' world', '!'];
      let chunkIndex = 0;

      const mockReader = {
        read: vi.fn(async () => {
          if (chunkIndex < chunks.length) {
            const chunk = chunks[chunkIndex];
            chunkIndex++;
            return {
              done: false,
              value: new TextEncoder().encode(`data: {"choices":[{"delta":{"content":"${chunk}"}}]}\n\n`),
            };
          }
          return { done: true, value: undefined };
        }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });

      const receivedChunks: string[] = [];
      await chatCompletionStream(mockMessages, 'test-api-key', 'glm-4-flash', (chunk) => {
        receivedChunks.push(chunk);
      });

      expect(receivedChunks).toEqual(['Hello', ' world', '!']);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('"stream":true'),
        })
      );
    });

    it('should handle [DONE] signal', async () => {
      const mockReader = {
        read: vi.fn(async () => ({
          done: true,
          value: new TextEncoder().encode('data: [DONE]\n\n'),
        })),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      const onChunk = vi.fn();
      await chatCompletionStream(mockMessages, 'test-api-key', 'glm-4-flash', onChunk);

      expect(onChunk).not.toHaveBeenCalled();
    });

    it('should throw error when no response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: null,
      });

      await expect(
        chatCompletionStream(mockMessages, 'test-api-key', 'glm-4-flash', vi.fn())
      ).rejects.toThrow('No response body');
    });

    it('should skip invalid JSON chunks', async () => {
      const mockReader = {
        read: vi.fn(async () => ({
          done: true,
          value: new TextEncoder().encode('data: invalid json\n\n'),
        })),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => mockReader },
      });

      const onChunk = vi.fn();
      await chatCompletionStream(mockMessages, 'test-api-key', 'glm-4-flash', onChunk);

      expect(onChunk).not.toHaveBeenCalled();
    });
  });

  describe('generateImage', () => {
    it('should throw error when API key is not configured', async () => {
      vi.stubEnv('VITE_BIGMODEL_API_KEY', '');

      await expect(
        generateImage({ model: 'cogview-3-plus', prompt: 'A beautiful sunset' })
      ).rejects.toThrow('API Key 未配置');
    });

    it('should call image generation API with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          created: Date.now(),
          data: [{ url: 'https://example.com/image.png' }],
        }),
      });

      const result = await generateImage({
        model: 'cogview-3-plus',
        prompt: 'A beautiful sunset',
        size: '1024x1024',
        quality: 'hd',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://open.bigmodel.cn/api/paas/v4/images/generations',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-id.test-secret',
          }),
        })
      );
      expect(result.data).toHaveLength(1);
    });

    it('should use default values when optional parameters not provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          created: Date.now(),
          data: [{ url: 'https://example.com/image.png' }],
        }),
      });

      await generateImage({
        model: 'cogview-3-flash',
        prompt: 'Test prompt',
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.size).toBe('1024x1024');
      expect(requestBody.quality).toBe('standard');
      expect(requestBody.n).toBe(1);
    });

    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: { message: 'Invalid prompt' } }),
      });

      await expect(
        generateImage({ model: 'cogview-3-plus', prompt: '' })
      ).rejects.toThrow('API Error: 400 Bad Request. Invalid prompt');
    });
  });

  describe('downloadImage', () => {
    it('should download image with default filename', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['image data'], { type: 'image/png' }),
      });

      const mockLink = {
        href: '',
        download: '',
        target: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValueOnce(mockLink as any);

      await downloadImage('https://example.com/image.png');

      expect(mockLink.download).toContain('bigmodel-image-');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should download image with custom filename', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['image data'], { type: 'image/png' }),
      });

      const mockLink = {
        href: '',
        download: '',
        target: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValueOnce(mockLink as any);

      await downloadImage('https://example.com/image.png', 'custom-name.png');

      expect(mockLink.download).toBe('custom-name.png');
    });

    it('should handle download error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(downloadImage('https://example.com/not-found'))
        .rejects.toThrow('下载失败: Not Found');
    });
  });

  describe('copyImageUrl', () => {
    it('should copy URL to clipboard', async () => {
      const mockClipboard = {
        writeText: vi.fn(() => Promise.resolve()),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      await copyImageUrl('https://example.com/image.png');

      expect(mockClipboard.writeText).toHaveBeenCalledWith('https://example.com/image.png');
    });

    it('should handle clipboard error', async () => {
      const mockClipboard = {
        writeText: vi.fn(() => Promise.reject(new Error('Permission denied'))),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      await expect(copyImageUrl('https://example.com/image.png'))
        .rejects.toThrow('复制失败: Permission denied');
    });
  });

  describe('generateVideoAsync', () => {
    it('should throw error when API key is not configured', async () => {
      vi.stubEnv('VITE_BIGMODEL_API_KEY', '');

      await expect(
        generateVideoAsync({ prompt: 'A video of sunset' })
      ).rejects.toThrow('API Key 未配置');
    });

    it('should submit video generation request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'video-task-123',
          request_id: 'req-123',
        }),
      });

      const result = await generateVideoAsync({
        prompt: 'A video of sunset',
        model: 'cogvideox-5b',
      });

      expect(result.id).toBe('video-task-123');
      expect(result.task_status).toBe('PROCESSING');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://open.bigmodel.cn/api/paas/v4/videos/async',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should use default model when not specified', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'video-task-123',
          request_id: 'req-123',
        }),
      });

      await generateVideoAsync({ prompt: 'Test video' });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.model).toBe('cogvideox-5b');
    });
  });

  describe('getVideoStatus', () => {
    it('should query video task status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'video-task-123',
          task_status: 'SUCCESS',
          video_result: {
            url: 'https://example.com/video.mp4',
            cover_url: 'https://example.com/cover.jpg',
          },
        }),
      });

      const result = await getVideoStatus('video-task-123');

      expect(result.task_status).toBe('SUCCESS');
      expect(result.video_result?.url).toBe('https://example.com/video.mp4');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://open.bigmodel.cn/api/paas/v4/videos/async/tasks/video-task-123',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle failed video generation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'video-task-123',
          task_status: 'FAILED',
          error_code: 'INVALID_PROMPT',
          error_message: 'Invalid prompt provided',
        }),
      });

      const result = await getVideoStatus('video-task-123');

      expect(result.task_status).toBe('FAILED');
      expect(result.error_message).toBe('Invalid prompt provided');
    });
  });

  describe('pollVideoResult', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should poll until success', async () => {
      let attempt = 0;
      mockFetch.mockImplementation(async () => ({
        ok: true,
        json: async () => {
          attempt++;
          if (attempt < 3) {
            return { id: 'task-123', task_status: 'PROCESSING' };
          }
          return {
            id: 'task-123',
            task_status: 'SUCCESS',
            video_result: { url: 'https://example.com/video.mp4' },
          };
        },
      }));

      const onUpdate = vi.fn();
      const promise = pollVideoResult('task-123', onUpdate, 10000, 100);

      // 快进时间
      for (let i = 0; i < 5; i++) {
        await vi.advanceTimersByTimeAsync(100);
        await Promise.resolve();
      }

      const result = await promise;

      expect(result.task_status).toBe('SUCCESS');
      expect(onUpdate).toHaveBeenCalledTimes(3);
    });

    it('should throw error on failed task', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'task-123',
          task_status: 'FAILED',
          error_message: 'Generation failed',
        }),
      });

      await expect(
        pollVideoResult('task-123', vi.fn(), 10000, 100)
      ).rejects.toThrow('Generation failed');
    });

    it('should timeout after specified duration', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'task-123',
          task_status: 'PROCESSING',
        }),
      });

      const onUpdate = vi.fn();
      const promise = pollVideoResult('task-123', onUpdate, 100, 50);

      // 超过超时时间
      await vi.advanceTimersByTimeAsync(200);

      await expect(promise).rejects.toThrow('视频生成超时');
    });
  });

  describe('downloadVideo', () => {
    it('should create download link with default filename', () => {
      const mockLink = {
        href: '',
        download: '',
        target: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValueOnce(mockLink as any);

      downloadVideo('https://example.com/video.mp4');

      expect(mockLink.href).toBe('https://example.com/video.mp4');
      expect(mockLink.download).toBe('video.mp4');
      expect(mockLink.target).toBe('_blank');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should create download link with custom filename', () => {
      const mockLink = {
        href: '',
        download: '',
        target: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValueOnce(mockLink as any);

      downloadVideo('https://example.com/video.mp4', 'my-video.mp4');

      expect(mockLink.download).toBe('my-video.mp4');
    });
  });
});
