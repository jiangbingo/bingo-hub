/**
 * Vercel Serverless Function: 文本对话 API 代理
 * 路径: /api/chat
 *
 * 解决浏览器调用 BigModel API 的 CORS 问题
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ZodError } from 'zod';
import { handleOptions, setCORSHeaders } from './cors';
import { generateJWT } from './utils/jwt';
import { ChatRequestSchema } from './schemas';
import { createRateLimitMiddleware } from './lib/rate-limit-middleware';

// 创建速率限制器：10秒内最多10次请求
const rateLimiter = createRateLimitMiddleware({
  config: { windowMs: 10000, maxRequests: 10 },
});

const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理 OPTIONS 预检请求
  if (handleOptions(req, res)) {
    return;
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    setCORSHeaders(req, res);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 设置 CORS 头
  setCORSHeaders(req, res);

  // 应用速率限制
  if (!rateLimiter(req, res)) {
    return; // 速率限制已响应
  }

  try {
    // 使用 Zod 验证请求体
    const validatedData = ChatRequestSchema.parse(req.body);

    // 从环境变量获取 API Key
    const apiKey = process.env.BIGMODEL_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // 构建 JWT Token
    const token = await generateJWT(apiKey);

    // 发起请求到 BigModel API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: 'BigModel API error',
        details: errorData,
      });
    }

    // 处理流式响应
    if (validatedData.stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body?.getReader();
      if (!reader) {
        return res.status(500).json({ error: 'No response body' });
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              res.write('data: [DONE]\n\n');
            } else {
              try {
                const parsed = JSON.parse(data);
                res.write(`data: ${JSON.stringify(parsed)}\n\n`);
              } catch {
                // 跳过无效 JSON
              }
            }
          }
        }
      }

      return res.end();
    }

    // 非流式响应
    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    // 处理 Zod 验证错误
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    console.error('Chat API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
