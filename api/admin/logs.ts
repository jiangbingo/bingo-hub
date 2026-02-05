/**
 * Vercel Serverless Function: 管理员日志 API
 * 路径: /api/admin/logs
 *
 * 仅管理员可访问，返回所有登录日志
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { handleOptions, setCORSHeaders } from '../cors';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 管理员用户名列表（与前端保持一致）
const ADMIN_USERNAMES = ['jiangbingo'];

/**
 * 验证请求者是否为管理员
 */
async function isAdmin(req: VercelRequest): Promise<boolean> {
  try {
    // 从 Authorization header 获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.slice(7);

    // 验证 token 并获取用户信息
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return false;
    }

    // 检查用户名是否在管理员列表中
    const username = user.user_metadata?.name || user.user_metadata?.user_name;
    return ADMIN_USERNAMES.includes(username);
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理 OPTIONS 预检请求
  if (handleOptions(req, res)) {
    return;
  }

  // 只允许 GET 请求
  if (req.method !== 'GET') {
    setCORSHeaders(req, res);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 设置 CORS 头
  setCORSHeaders(req, res);

  // 验证管理员权限
  const admin = await isAdmin(req);
  if (!admin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  try {
    // 获取查询参数
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const offset = Number(req.query.offset) || 0;

    // 从数据库获取日志
    const { data, error } = await supabase
      .from('auth_logs')
      .select('*')
      .order('login_timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    // 获取总数
    const { count } = await supabase
      .from('auth_logs')
      .select('*', { count: 'exact', head: true });

    return res.status(200).json({
      logs: data || [],
      total: count || 0,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Logs API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
