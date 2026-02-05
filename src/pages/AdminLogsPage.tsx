/**
 * 管理员日志页面
 * 仅管理员 (jiangbingo) 可访问
 */

import React from 'react';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { LoginLogs } from '@/components/auth/LoginLogs';
import MainLayout from '@/components/layout/MainLayout';

export default function AdminLogsPage() {
  return (
    <AdminRoute>
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoginLogs />
        </div>
      </MainLayout>
    </AdminRoute>
  );
}
