/**
 * 用户菜单组件
 * 显示用户头像、名称，提供登出等操作
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/auth/authContext';

export interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className = '' }: UserMenuProps) {
  const { user, signOut, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="用户菜单"
        aria-expanded={isOpen}
      >
        {/* 头像 */}
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name || '用户头像'}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
        )}

        {/* 用户名（桌面端显示） */}
        <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
          {user.name || user.email || '用户'}
        </span>

        {/* 管理员徽章 */}
        {isAdmin && (
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            管理员
          </span>
        )}

        {/* 下拉箭头 */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {/* 用户信息 */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user.name || '用户'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email || ''}
            </p>
            {isAdmin && (
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                管理员权限
              </p>
            )}
          </div>

          {/* 菜单项 */}
          <div className="py-1">
            {/* 查看日志（仅管理员） */}
            {isAdmin && (
              <a
                href="/admin/logs"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                登录日志
              </a>
            )}

            {/* 分隔线 */}
            {isAdmin && <div className="border-t border-gray-200 dark:border-gray-700 my-1" />}

            {/* 登出 */}
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
