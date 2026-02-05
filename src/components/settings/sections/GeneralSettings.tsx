/**
 * 通用设置
 */

import React from 'react';
import { useSettingsStore } from '@/src/stores/settingsStore';

const GeneralSettings: React.FC = () => {
  const { config, updateGeneralSettings } = useSettingsStore();
  const { general } = config;

  return (
    <div className="flex flex-col gap-12">
      {/* 标题 */}
      <div>
        <h1 className="text-[40px] font-semibold text-neutral-900">通用设置</h1>
        <p className="mt-2 text-sm text-neutral-500">配置应用程序的基础设置</p>
      </div>

      {/* 存储位置 */}
      <section className="rounded-sm border border-neutral-200 p-8">
        <h2 className="mb-4 text-sm font-medium text-neutral-900">存储位置</h2>
        <div className="flex gap-6">
          <label className="flex cursor-pointer items-center gap-2 px-3 py-2">
            <div className="relative">
              <input
                type="radio"
                name="storage"
                checked={general.storage === 'localStorage'}
                onChange={() => updateGeneralSettings({ storage: 'localStorage' })}
                className="peer sr-only"
              />
              <div className="h-4 w-4 rounded-sm border-2 border-neutral-200 peer-checked:border-red-600 peer-checked:bg-red-600">
                {general.storage === 'localStorage' && (
                  <div className="ml-0.5 mt-0.5 h-2 w-2 bg-white" />
                )}
              </div>
            </div>
            <span className="text-sm text-neutral-900">LocalStorage</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2 px-3 py-2">
            <div className="relative">
              <input
                type="radio"
                name="storage"
                checked={general.storage === 'indexedDB'}
                onChange={() => updateGeneralSettings({ storage: 'indexedDB' })}
                className="peer sr-only"
              />
              <div className="h-4 w-4 rounded-sm border-2 border-neutral-200 peer-checked:border-red-600 peer-checked:bg-red-600">
                {general.storage === 'indexedDB' && (
                  <div className="ml-0.5 mt-0.5 h-2 w-2 bg-white" />
                )}
              </div>
            </div>
            <span className="text-sm text-neutral-900">IndexedDB</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2 px-3 py-2">
            <div className="relative">
              <input
                type="radio"
                name="storage"
                checked={general.storage === 'custom'}
                onChange={() => updateGeneralSettings({ storage: 'custom' })}
                className="peer sr-only"
              />
              <div className="h-4 w-4 rounded-sm border-2 border-neutral-200 peer-checked:border-red-600 peer-checked:bg-red-600">
                {general.storage === 'custom' && (
                  <div className="ml-0.5 mt-0.5 h-2 w-2 bg-white" />
                )}
              </div>
            </div>
            <span className="text-sm text-neutral-900">自定义路径</span>
          </label>
        </div>

        {general.storage === 'custom' && (
          <input
            type="text"
            value={general.customPath || ''}
            onChange={(e) => updateGeneralSettings({ customPath: e.target.value })}
            placeholder="输入自定义路径..."
            className="mt-4 w-full rounded-sm border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-red-600 focus:outline-none"
          />
        )}
      </section>

      {/* 主题设置 */}
      <section className="rounded-sm border border-neutral-200 p-8">
        <h2 className="mb-4 text-sm font-medium text-neutral-900">主题</h2>
        <div className="flex gap-4">
          {/* 浅色主题 */}
          <button
            onClick={() => updateGeneralSettings({ theme: 'light' })}
            className={`flex h-20 w-[100px] flex-col gap-2 rounded-sm border p-3 transition-colors ${
              general.theme === 'light'
                ? 'border-red-600'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className="h-10 w-full border border-neutral-200 bg-white" />
            <span className="text-xs text-neutral-500">浅色</span>
          </button>

          {/* 深色主题 */}
          <button
            onClick={() => updateGeneralSettings({ theme: 'dark' })}
            className={`flex h-20 w-[100px] flex-col gap-2 rounded-sm border p-3 transition-colors ${
              general.theme === 'dark'
                ? 'border-red-600'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className="h-10 w-full border border-neutral-200 bg-neutral-900" />
            <span className="text-xs text-neutral-900">深色</span>
          </button>

          {/* 跟随系统 */}
          <button
            onClick={() => updateGeneralSettings({ theme: 'system' })}
            className={`flex h-20 w-[100px] flex-col gap-2 rounded-sm border p-3 transition-colors ${
              general.theme === 'system'
                ? 'border-red-600'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className="h-10 w-full border border-neutral-200 bg-white" />
            <span className="text-xs text-neutral-500">跟随系统</span>
          </button>
        </div>
      </section>

      {/* 语言设置 */}
      <section className="rounded-sm border border-neutral-200 p-8">
        <h2 className="mb-3 text-sm font-medium text-neutral-900">语言</h2>
        <div className="relative w-48">
          <select
            value={general.language}
            onChange={(e) =>
              updateGeneralSettings({ language: e.target.value as any })
            }
            className="w-full appearance-none rounded-sm border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:border-red-600 focus:outline-none"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
            ▼
          </span>
        </div>
      </section>
    </div>
  );
};

export default GeneralSettings;
