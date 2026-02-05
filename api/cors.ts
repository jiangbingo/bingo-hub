/**
 * CORS 配置工具函数
 * 用于 Vercel Serverless Functions
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * 获取允许的源地址
 * 从环境变量 CORS_ALLOWED_ORIGINS 读取，支持多个域名用逗号分隔
 * 生产环境必须设置白名单，否则拒绝请求
 */
function getAllowedOrigin(req: VercelRequest): string {
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS;
  const origin = req.headers.origin;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!allowedOrigins) {
    if (isProduction) {
      // 生产环境必须设置白名单
      throw new Error('CORS_ALLOWED_ORIGINS must be set in production');
    }
    // 开发环境仅允许 localhost
    const devOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    if (origin && devOrigins.includes(origin)) {
      return origin;
    }
    return devOrigins[0];
  }

  const origins = allowedOrigins.split(',').map(o => o.trim());

  // 检查请求的源是否在允许列表中
  if (origin && origins.includes(origin)) {
    return origin;
  }

  // 如果请求的源不在列表中，返回第一个允许的源
  return origins[0];
}

/**
 * CORS 配置
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};

/**
 * 设置 CORS 响应头
 */
export function setCORSHeaders(req: VercelRequest, res: VercelResponse): void {
  const origin = getAllowedOrigin(req);

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', CORS_HEADERS['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Headers', CORS_HEADERS['Access-Control-Allow-Headers']);
  res.setHeader('Access-Control-Allow-Credentials', CORS_HEADERS['Access-Control-Allow-Credentials']);
}

/**
 * 处理 OPTIONS 预检请求
 * 返回 true 表示请求已处理，不需要继续执行
 * 返回 false 表示不是 OPTIONS 请求，需要继续处理
 */
export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    setCORSHeaders(req, res);
    res.status(204).end();
    return true;
  }
  return false;
}

/**
 * 包装响应，自动添加 CORS 头
 */
export function withCORS(
  req: VercelRequest,
  res: VercelResponse,
  statusCode: number,
  data: unknown
): VercelResponse {
  setCORSHeaders(req, res);
  return res.status(statusCode).json(data);
}
