/**
 * 登录页面
 */

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/auth/authContext';
import { LoginButton } from '@/components/auth/LoginButton';
import { EmailLoginForm } from '@/components/auth/EmailLoginForm';

export default function LoginPage() {
  const { status } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'github' | 'email'>('github');

  // 已登录用户重定向到首页
  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo 和标题 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            BingoHub
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            多模态 AI 创作平台
          </p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            欢迎回来
          </h2>

          {/* 登录方式选择 */}
          <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setLoginMethod('github')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginMethod === 'github'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              GitHub
            </button>
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                loginMethod === 'email'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              邮箱
            </button>
          </div>

          {/* GitHub 登录 */}
          {loginMethod === 'github' && (
            <div className="space-y-4">
              <LoginButton fullWidth size="md" />
            </div>
          )}

          {/* 邮箱登录 */}
          {loginMethod === 'email' && (
            <EmailLoginForm />
          )}

          {/* 说明文字 */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            登录即表示您同意我们的服务条款和隐私政策
          </p>
        </div>

        {/* 功能说明 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            登录后可使用：
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              AI 对话与内容生成
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              图像生成与管理
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              视频创作与编辑
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              历史记录与数据管理
            </li>
          </ul>
        </div>

        {/* 页脚 */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          © 2025 BingoHub
        </p>
      </div>
    </div>
  );
}
