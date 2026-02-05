/**
 * 设置页面左侧导航
 */

import React from 'react';
import { useSettingsStore } from '@/src/stores/settingsStore';
import type { SettingsNavItem } from '@/src/types/settings';

const navItems: SettingsNavItem[] = [
  { id: 'general', label: '通用', icon: '⚙️' },
  { id: 'api', label: 'API 配置', icon: '🔑' },
  { id: 'model', label: '模型配置', icon: '🤖' },
  { id: 'advanced', label: '高级设置', icon: '🔧' },
  { id: 'data', label: '数据管理', icon: '💾' },
];

const SettingsSidebar: React.FC = () => {
  const { currentCategory, setCurrentCategory } = useSettingsStore();

  return (
    <aside className="flex h-screen w-[240px] flex-col border-r border-neutral-200 bg-white px-8 py-10">
      {/* Logo */}
      <div className="mb-12 flex items-center gap-3">
        <div className="h-7 w-7 bg-red-600" />
        <span className="text-lg font-semibold text-neutral-900">OmniHub</span>
      </div>

      {/* 导航标题 */}
      <span className="mb-4 text-xs text-neutral-500">设置</span>

      {/* 导航菜单 */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentCategory(item.id as any)}
            className={`flex items-center gap-3 py-3 text-left transition-colors ${
              currentCategory === item.id
                ? 'text-neutral-900 font-medium'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <div
              className={`h-1.5 w-1.5 rounded-sm ${
                currentCategory === item.id ? 'bg-red-600' : 'bg-transparent'
              }`}
            />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 底部信息 */}
      <div className="mt-auto">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs font-semibold text-neutral-900">版本信息</p>
          <p className="mt-1 text-[10px] text-neutral-500">OmniHub v1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default SettingsSidebar;
