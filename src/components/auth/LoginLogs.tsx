/**
 * 登录日志组件
 * 仅管理员可见
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/auth/authContext';
import type { LoginLog } from '@/auth/types';

export function LoginLogs() {
  const { isAdmin } = useAdmin();
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'github' | 'email'>('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      // 这里调用 API 获取日志
      const response = await fetch('/api/admin/logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('获取日志失败:', error);
    } finally {
      setLoading(false);
    }
  }

  // 非管理员不渲染
  if (!isAdmin) {
    return null;
  }

  // 过滤日志
  const filteredLogs = logs.filter((log) => {
    if (filter === 'success' && !log.success) return false;
    if (filter === 'failed' && log.success) return false;
    if (methodFilter !== 'all' && log.login_method !== methodFilter) return false;
    return true;
  });

  // 统计
  const stats = {
    total: logs.length,
    success: logs.filter((l) => l.success).length,
    failed: logs.filter((l) => !l.success).length,
    github: logs.filter((l) => l.login_method === 'github').length,
    email: logs.filter((l) => l.login_method === 'email').length,
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">登录日志</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          查看所有用户的登录记录（仅管理员可见）
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="总计" value={stats.total} />
        <StatCard label="成功" value={stats.success} color="green" />
        <StatCard label="失败" value={stats.failed} color="red" />
        <StatCard label="GitHub" value={stats.github} color="gray" />
        <StatCard label="邮箱" value={stats.email} color="blue" />
      </div>

      {/* 过滤器 */}
      <div className="flex flex-wrap gap-2">
        <FilterButtons
          options={[
            { value: 'all', label: '全部' },
            { value: 'success', label: '成功' },
            { value: 'failed', label: '失败' },
          ]}
          value={filter}
          onChange={setFilter}
        />

        <FilterButtons
          options={[
            { value: 'all', label: '全部方式' },
            { value: 'github', label: 'GitHub' },
            { value: 'email', label: '邮箱' },
          ]}
          value={methodFilter}
          onChange={setMethodFilter}
        />

        <button
          onClick={fetchLogs}
          className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          刷新
        </button>
      </div>

      {/* 日志表格 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">暂无日志</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                    时间
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                    用户 ID
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                    方式
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                    状态
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                    IP 地址
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                    错误信息
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                      {new Date(log.login_timestamp).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">
                      {log.user_id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3">
                      <MethodBadge method={log.login_method} />
                    </td>
                    <td className="px-4 py-3">
                      {log.success ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          成功
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          失败
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                      {log.ip_address || '-'}
                    </td>
                    <td className="px-4 py-3 text-red-600 dark:text-red-400 text-xs max-w-xs truncate">
                      {log.error_message || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// 统计卡片
function StatCard({
  label,
  value,
  color = 'gray',
}: {
  label: string;
  value: number;
  color?: 'gray' | 'green' | 'red' | 'blue';
}) {
  const colorClasses = {
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white',
    green: 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100',
    red: 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100',
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-70 mt-1">{label}</div>
    </div>
  );
}

// 过滤按钮
function FilterButtons({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: any) => void;
}) {
  return (
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            value === option.value
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// 登录方式徽章
function MethodBadge({ method }: { method: 'github' | 'email' }) {
  const config = {
    github: {
      label: 'GitHub',
      className: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
    },
    email: {
      label: '邮箱',
      className: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    },
  };

  const { label, className } = config[method];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
