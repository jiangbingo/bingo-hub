/**
 * 高级设置
 */

import React from 'react';
import { useSettingsStore } from '@/src/stores/settingsStore';

const PROXY_TYPES = [
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
  { value: 'socks5', label: 'SOCKS5' },
];

const AdvancedSettings: React.FC = () => {
  const { config, updateAdvancedSettings } = useSettingsStore();
  const { advanced } = config;

  return (
    <div className="flex flex-col gap-12">
      {/* 标题 */}
      <div>
        <h1 className="text-[40px] font-semibold text-neutral-900">高级设置</h1>
        <p className="mt-2 text-sm text-neutral-500">配置请求超时、重试和代理设置</p>
      </div>

      {/* 请求配置 */}
      <section className="rounded-sm border border-neutral-200 p-8">
        <h2 className="mb-6 text-sm font-medium text-neutral-900">请求配置</h2>

        {/* 超时时间 */}
        <div className="mb-6">
          <label className="mb-2 block text-sm text-neutral-700">超时时间（秒）</label>
          <input
            type="number"
            min="10"
            max="600"
            value={advanced.timeout}
            onChange={(e) =>
              updateAdvancedSettings({ timeout: parseInt(e.target.value) || 120 })
            }
            className="w-48 rounded-sm border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:border-red-600 focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-neutral-500">
            请求超时时间，10-600 秒
          </p>
        </div>

        {/* 重试次数 */}
        <div className="mb-6">
          <label className="mb-2 block text-sm text-neutral-700">重试次数</label>
          <input
            type="number"
            min="0"
            max="10"
            value={advanced.retryCount}
            onChange={(e) =>
              updateAdvancedSettings({ retryCount: parseInt(e.target.value) || 3 })
            }
            className="w-48 rounded-sm border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:border-red-600 focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-neutral-500">
            失败后自动重试的次数，0-10 次
          </p>
        </div>

        {/* 重试延迟 */}
        <div>
          <label className="mb-2 block text-sm text-neutral-700">重试延迟（毫秒）</label>
          <input
            type="number"
            min="100"
            max="10000"
            value={advanced.retryDelay}
            onChange={(e) =>
              updateAdvancedSettings({ retryDelay: parseInt(e.target.value) || 1000 })
            }
            className="w-48 rounded-sm border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:border-red-600 focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-neutral-500">
            重试间隔时间，100-10000 毫秒
          </p>
        </div>
      </section>

      {/* 代理设置 */}
      <section className="rounded-sm border border-neutral-200 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-900">代理设置</h2>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={advanced.proxy.enabled}
              onChange={(e) =>
                updateAdvancedSettings({
                  proxy: { ...advanced.proxy, enabled: e.target.checked },
                })
              }
              className="sr-only"
            />
            <div
              className={`h-5 w-9 rounded-sm transition-colors ${
                advanced.proxy.enabled ? 'bg-red-600' : 'bg-neutral-200'
              }`}
            >
              <div
                className={`h-4 w-4 rounded-sm bg-white transition-transform ${
                  advanced.proxy.enabled ? 'translate-x-4' : 'translate-x-0.5'
                } mt-0.5`}
              />
            </div>
            <span className="text-sm text-neutral-700">启用代理</span>
          </label>
        </div>

        {advanced.proxy.enabled && (
          <div className="space-y-4">
            {/* 代理类型 */}
            <div>
              <label className="mb-2 block text-sm text-neutral-700">代理类型</label>
              <div className="relative w-48">
                <select
                  value={advanced.proxy.type}
                  onChange={(e) =>
                    updateAdvancedSettings({
                      proxy: { ...advanced.proxy, type: e.target.value as any },
                    })
                  }
                  className="w-full appearance-none rounded-sm border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:border-red-600 focus:outline-none"
                >
                  {PROXY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                  ▼
                </span>
              </div>
            </div>

            {/* Host */}
            <div>
              <label className="mb-2 block text-sm text-neutral-700">主机地址</label>
              <input
                type="text"
                value={advanced.proxy.host || ''}
                onChange={(e) =>
                  updateAdvancedSettings({
                    proxy: { ...advanced.proxy, host: e.target.value },
                  })
                }
                placeholder="proxy.example.com"
                className="w-full rounded-sm border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-red-600 focus:outline-none"
              />
            </div>

            {/* Port */}
            <div>
              <label className="mb-2 block text-sm text-neutral-700">端口</label>
              <input
                type="number"
                min="1"
                max="65535"
                value={advanced.proxy.port || ''}
                onChange={(e) =>
                  updateAdvancedSettings({
                    proxy: { ...advanced.proxy, port: parseInt(e.target.value) || undefined },
                  })
                }
                placeholder="8080"
                className="w-full rounded-sm border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-red-600 focus:outline-none"
              />
            </div>

            {/* 用户名（可选） */}
            <div>
              <label className="mb-2 block text-sm text-neutral-700">用户名（可选）</label>
              <input
                type="text"
                value={advanced.proxy.username || ''}
                onChange={(e) =>
                  updateAdvancedSettings({
                    proxy: { ...advanced.proxy, username: e.target.value },
                  })
                }
                placeholder="代理认证用户名"
                className="w-full rounded-sm border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-red-600 focus:outline-none"
              />
            </div>

            {/* 密码（可选） */}
            <div>
              <label className="mb-2 block text-sm text-neutral-700">密码（可选）</label>
              <input
                type="password"
                value={advanced.proxy.password || ''}
                onChange={(e) =>
                  updateAdvancedSettings({
                    proxy: { ...advanced.proxy, password: e.target.value },
                  })
                }
                placeholder="代理认证密码"
                className="w-full rounded-sm border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-red-600 focus:outline-none"
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdvancedSettings;
