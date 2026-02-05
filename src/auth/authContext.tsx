/**
 * 认证上下文
 * 提供全局认证状态和方法
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import { supabase, recordLoginLog, isUserAdmin, extractUsername, isSupabaseConfigured } from './supabaseClient';
import type { AuthContextValue, AuthState, UserProfile, LoginLog } from './types';

// ============================================
// Context 定义
// ============================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================
// Provider Props
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

// ============================================
// 辅助函数
// ============================================

/**
 * 将 Supabase User 转换为 UserProfile
 */
function toUserProfile(user: User): UserProfile {
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    name: metadata.name || metadata.user_name || metadata.full_name,
    avatar_url: metadata.avatar_url,
    provider: metadata.provider,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at || user.created_at,
  };
}

// ============================================
// AuthProvider 组件
// ============================================

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    session: null,
    error: null,
  });

  // 检查当前用户是否是管理员
  const isAdmin = state.user ? isUserAdmin({ user_metadata: { name: state.user.name } }) : false;

  /**
   * 初始化：检查现有会话
   */
  useEffect(() => {
    // 如果 Supabase 未配置，直接设置为未认证状态
    if (!isSupabaseConfigured || !supabase) {
      setState({
        status: 'unauthenticated',
        user: null,
        session: null,
        error: null,
      });
      return;
    }

    // 获取当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setState({
          status: 'authenticated',
          user: toUserProfile(session.user),
          session,
          error: null,
        });
      } else {
        setState({
          status: 'unauthenticated',
          user: null,
          session: null,
          error: null,
        });
      }
    });

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userProfile = toUserProfile(session.user);

        // 记录登录日志（仅在登录事件时）
        if (_event === 'SIGNED_IN') {
          await recordLoginLog({
            user_id: session.user.id,
            ip_address: await getClientIP(),
            user_agent: navigator.userAgent,
            login_method: (userProfile.provider === 'github' ? 'github' : 'email'),
            success: true,
          });
        }

        setState({
          status: 'authenticated',
          user: userProfile,
          session,
          error: null,
        });
      } else if (_event === 'SIGNED_OUT') {
        setState({
          status: 'unauthenticated',
          user: null,
          session: null,
          error: null,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * GitHub 登录
   */
  const signInWithGitHub = async () => {
    if (!supabase) {
      setState({
        status: 'error',
        user: null,
        session: null,
        error: 'Supabase 未配置，无法登录',
      });
      return;
    }

    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          // 请求额外权限
          scopes: 'read:user user:email',
        },
      });

      if (error) throw error;
      // OAuth 重定向会自动发生
    } catch (error) {
      const authError = error as SupabaseAuthError;
      setState({
        status: 'error',
        user: null,
        session: null,
        error: authError.message || 'GitHub 登录失败',
      });

      // 记录失败日志
      await recordLoginLog({
        user_id: 'anonymous',
        login_method: 'github',
        success: false,
        error_message: authError.message,
      });
    }
  };

  /**
   * 邮箱密码登录
   */
  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) {
      setState({
        status: 'error',
        user: null,
        session: null,
        error: 'Supabase 未配置，无法登录',
      });
      return;
    }

    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 记录成功登录
      if (data.user) {
        await recordLoginLog({
          user_id: data.user.id,
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent,
          login_method: 'email',
          success: true,
        });
      }
    } catch (error) {
      const authError = error as SupabaseAuthError;
      setState({
        status: 'error',
        user: null,
        session: null,
        error: authError.message || '邮箱登录失败',
      });

      // 记录失败日志
      await recordLoginLog({
        user_id: 'anonymous',
        login_method: 'email',
        success: false,
        error_message: authError.message,
      });
    }
  };

  /**
   * 邮箱注册
   */
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (!supabase) {
      setState({
        status: 'error',
        user: null,
        session: null,
        error: 'Supabase 未配置，无法注册',
      });
      return;
    }

    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      const authError = error as SupabaseAuthError;
      setState({
        status: 'error',
        user: null,
        session: null,
        error: authError.message || '注册失败',
      });
    }
  };

  /**
   * 登出
   */
  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setState({
      status: 'unauthenticated',
      user: null,
      session: null,
      error: null,
    });
  };

  /**
   * 更新用户资料
   */
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!state.user || !supabase) return;

    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : null,
      }));
    } catch (error) {
      console.error('更新资料失败:', error);
    }
  };

  /**
   * 获取登录日志（管理员专用）
   */
  const getLoginLogs = async (limit: number = 100): Promise<LoginLog[]> => {
    if (!isAdmin || !supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from('auth_logs')
      .select('*')
      .order('login_timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('获取登录日志失败:', error);
      return [];
    }

    return (data || []) as LoginLog[];
  };

  /**
   * 记录登录日志
   */
  const recordLogin = async (data: Partial<LoginLog>) => {
    if (!state.user) return;

    await recordLoginLog({
      user_id: state.user.id,
      login_method: state.user.provider === 'github' ? 'github' : 'email',
      success: true,
      ...data,
    } as any);
  };

  /**
   * 获取客户端 IP（简化版，实际可能需要调用 IP 服务）
   */
  async function getClientIP(): Promise<string | undefined> {
    // 在生产环境中，可以通过 Vercel 的请求头获取真实 IP
    // 这里返回 undefined，后端会自动记录
    return undefined;
  }

  // 构建上下文值
  const value: AuthContextValue = {
    ...state,
    isAdmin,
    signInWithGitHub,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    getLoginLogs,
    recordLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// Hook: useAuth
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

// ============================================
// Hook: useAdmin (仅管理员组件使用)
// ============================================

export function useAdmin() {
  const auth = useAuth();

  return {
    isAdmin: auth.isAdmin || false,
    user: auth.user,
    error: !auth.isAdmin ? '需要管理员权限' : auth.error,
  };
}
