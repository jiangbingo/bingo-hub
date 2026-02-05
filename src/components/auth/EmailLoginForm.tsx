/**
 * 邮箱登录/注册表单组件
 */

import React, { useState } from 'react';
import { useAuth } from '@/auth/authContext';

export interface EmailLoginFormProps {
  className?: string;
}

export function EmailLoginForm({ className = '' }: EmailLoginFormProps) {
  const { signInWithEmail, signUpWithEmail, status, error } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const validateForm = () => {
    if (!email || !password) {
      setFormError('请填写所有必填字段');
      return false;
    }
    if (!email.includes('@')) {
      setFormError('请输入有效的邮箱地址');
      return false;
    }
    if (password.length < 6) {
      setFormError('密码至少需要 6 个字符');
      return false;
    }
    if (isSignUp && !name) {
      setFormError('请输入您的姓名');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setFormError('');

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '操作失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormError('');
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 姓名（仅注册时显示） */}
        {isSignUp && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              姓名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入您的姓名"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              disabled={isLoading}
            />
          </div>
        )}

        {/* 邮箱 */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            邮箱地址
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            disabled={isLoading}
          />
        </div>

        {/* 密码 */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            密码
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignUp ? '至少 6 个字符' : '请输入密码'}
            required
            minLength={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            disabled={isLoading}
          />
        </div>

        {/* 错误提示 */}
        {(formError || error) && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {formError || error}
          </div>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isLoading || status === 'loading'}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '处理中...' : isSignUp ? '注册' : '登录'}
        </button>

        {/* 切换登录/注册 */}
        <div className="text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {isSignUp ? '已有账号？' : '还没有账号？'}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            className="ml-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            disabled={isLoading}
          >
            {isSignUp ? '立即登录' : '立即注册'}
          </button>
        </div>
      </form>
    </div>
  );
}
