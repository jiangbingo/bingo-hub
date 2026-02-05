/**
 * 路由保护组件
 * 只有登录用户才能访问受保护的页面
 */

import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/auth/authContext';
import Loading from '@/components/ui/Loading';

export interface ProtectedRouteProps {
  children: ReactNode;
  // 管理员专用页面
  adminOnly?: boolean;
  // 重定向路径
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  adminOnly = false,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { status, user, isAdmin } = useAuth();

  // 加载中
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  // 未登录
  if (status === 'unauthenticated') {
    return <Navigate to={redirectTo} replace />;
  }

  // 管理员页面但用户不是管理员
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            访问被拒绝
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            此页面仅管理员可访问
          </p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回首页
          </a>
        </div>
      </div>
    );
  }

  // 已登录且有权限
  return <>{children}</>;
}

/**
 * 管理员专用路由组件
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute adminOnly>{children}</ProtectedRoute>;
}
