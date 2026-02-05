/**
 * 认证系统类型定义
 */

import { User, Session } from '@supabase/supabase-js';

// ============================================
// 用户信息类型
// ============================================

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  provider?: 'github' | 'email';
  created_at: string;
  last_sign_in_at: string;
}

// ============================================
// 登录日志类型
// ============================================

export interface LoginLog {
  id: number;
  user_id: string;
  login_timestamp: string;
  ip_address?: string;
  user_agent?: string;
  login_method: 'github' | 'email';
  success: boolean;
  error_message?: string;
  created_at: string;
}

// ============================================
// 认证状态类型
// ============================================

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthState {
  status: AuthStatus;
  user: UserProfile | null;
  session: Session | null;
  error: string | null;
}

// ============================================
// 认证上下文类型
// ============================================

export interface AuthContextValue extends AuthState {
  // 管理员状态
  isAdmin: boolean;

  // 认证方法
  signInWithGitHub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;

  // 用户管理
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;

  // 日志管理
  getLoginLogs: (limit?: number) => Promise<LoginLog[]>;
  recordLogin: (data: Partial<LoginLog>) => Promise<void>;
}

// ============================================
// Supabase Row 类型（用于类型安全）
// ============================================

export interface DatabaseUserProfile {
  id: string;
  raw_user_meta_data?: {
    avatar_url?: string;
    name?: string;
    email?: string;
    provider?: string;
  };
  created_at: string;
  last_sign_in_at: string;
  updated_at?: string;
}

// ============================================
// 认证错误类型
// ============================================

export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ============================================
// 登录记录统计
// ============================================

export interface LoginStats {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  lastLogin: string | null;
  mostUsedMethod: 'github' | 'email' | null;
  loginHistory: LoginLog[];
}
