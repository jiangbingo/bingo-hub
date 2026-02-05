/**
 * Supabase 客户端配置
 */

import { createClient } from '@supabase/supabase-js';

// ============================================
// 环境变量
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 检查是否配置了 Supabase
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase 未配置，部分功能将不可用');
}

// ============================================
// 管理员配置
// ============================================

export const ADMIN_USERNAMES = ['jiangbingo'] as const;
export type AdminUsername = typeof ADMIN_USERNAMES[number];

/**
 * 检查用户是否是管理员
 */
export function isAdmin(username: string | null | undefined): boolean {
  if (!username) return false;
  return ADMIN_USERNAMES.includes(username as AdminUsername);
}

/**
 * 从用户数据中提取用户名
 */
export function extractUsername(user: any): string | null {
  // GitHub 用户名路径
  if (user?.user_metadata?.user_name) {
    return user.user_metadata.user_name;
  }
  if (user?.user_metadata?.name) {
    return user.user_metadata.name;
  }
  if (user?.user_metadata?.preferred_username) {
    return user.user_metadata.preferred_username;
  }
  return null;
}

/**
 * 检查用户对象是否是管理员
 */
export function isUserAdmin(user: any): boolean {
  const username = extractUsername(user);
  return isAdmin(username);
}

// ============================================
// Supabase 客户端
// ============================================

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        // 自动刷新 token
        autoRefreshToken: true,
        // 检测会话变化
        detectSessionInUrl: true,
        // 持久化会话
        persistSession: true,
        // 使用 localStorage 存储会话
        storage: window.localStorage,
        // 重定向 URL
        redirectTo: window.location.origin + '/dashboard',
      },
    })
  : null;

// ============================================
// 数据库表名称常量
// ============================================

export const TABLES = {
  AUTH_LOGS: 'auth_logs',
  USER_PROFILES: 'user_profiles',
} as const;

// ============================================
// 登录日志 API
// ============================================

/**
 * 记录登录日志
 */
export async function recordLoginLog(data: {
  user_id: string;
  ip_address?: string;
  user_agent?: string;
  login_method: 'github' | 'email';
  success: boolean;
  error_message?: string;
}): Promise<void> {
  try {
    const { error } = await supabase.from(TABLES.AUTH_LOGS).insert({
      ...data,
      login_timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error('记录登录日志失败:', error);
    }
  } catch (e) {
    console.error('记录登录日志异常:', e);
  }
}

/**
 * 获取所有登录日志（仅管理员）
 */
export async function getAllLoginLogs(limit: number = 100): Promise<any[]> {
  const { data, error } = await supabase
    .from(TABLES.AUTH_LOGS)
    .select('*')
    .order('login_timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('获取登录日志失败:', error);
    return [];
  }

  return data || [];
}

/**
 * 获取当前用户的登录日志
 */
export async function getUserLoginLogs(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  const { data, error } = await supabase
    .from(TABLES.AUTH_LOGS)
    .select('*')
    .eq('user_id', userId)
    .order('login_timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('获取用户登录日志失败:', error);
    return [];
  }

  return data || [];
}

/**
 * 获取登录统计
 */
export async function getLoginStats(userId?: string): Promise<{
  total: number;
  successful: number;
  failed: number;
  lastLogin: string | null;
  methodCounts: Record<string, number>;
}> {
  const query = supabase
    .from(TABLES.AUTH_LOGS)
    .select('login_method, success, login_timestamp');

  if (userId) {
    query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return {
      total: 0,
      successful: 0,
      failed: 0,
      lastLogin: null,
      methodCounts: {},
    };
  }

  const successful = data.filter((log) => log.success).length;
  const failed = data.filter((log) => !log.success).length;
  const lastLogin = data[0]?.login_timestamp || null;

  const methodCounts: Record<string, number> = {};
  data.forEach((log) => {
    methodCounts[log.login_method] = (methodCounts[log.login_method] || 0) + 1;
  });

  return {
    total: data.length,
    successful,
    failed,
    lastLogin,
    methodCounts,
  };
}

// ============================================
// 用户资料 API
// ============================================

/**
 * 获取用户资料
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from(TABLES.USER_PROFILES)
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('获取用户资料失败:', error);
    return null;
  }

  return data;
}

/**
 * 更新用户资料
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    name: string;
    avatar_url: string;
    role: 'admin' | 'user';
  }>
) {
  const { data, error } = await supabase
    .from(TABLES.USER_PROFILES)
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('更新用户资料失败:', error);
    return null;
  }

  return data;
}
