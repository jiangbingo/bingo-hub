/**
 * useTheme - 主题管理 Hook
 * 提供主题切换功能，支持暗色/亮色模式
 */

import { useEffect } from 'react';
import { useAppStore } from '../stores/appStore';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const { theme, setTheme } = useAppStore();

  // 初始化主题：从 localStorage 读取或使用系统偏好
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;

    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      // 使用系统偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // 同步主题到 DOM
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }

    // 持久化到 localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // 只有当用户没有手动设置过主题时才跟随系统
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };
}
