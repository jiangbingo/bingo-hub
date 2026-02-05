/**
 * API 配置
 */

import React, { useState } from 'react';
import { useSettingsStore } from '@/src/stores/settingsStore';

const ApiSettings: React.FC = () => {
  const { config, updateApiSettings } = useSettingsStore();
  const { api } = config;
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    // 模拟测试连接
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTestingConnection(false);
  };

  return (
    <div className="flex flex-col gap-12">
      {/* 标题 */}
      <div>
        <h1 className="text-[40px] font-semibold text-neutral-900">API 配置</h1>
        <p className="mt-2 text-sm text-neutral-500">配置 API Key 和端点</p>
      </div>

      {/* API Key */}
      <section className="rounded-sm border border-neutral-200 p-8">
        <h2 className="mb-3 text-sm font-medium text-neutral-900">API Key</h2>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={api.apiKey}
              onChange={(e) => updateApiSettings({ apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full rounded-sm border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-red-600 focus:outline-none"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-neutral-700"
            >
              {showApiKey ? '隐藏' : '显示'}
            </button>
          </div>
          {api.apiKey && (
            <span className="flex items-center rounded-sm bg-green-100 px-3 py-2 text-xs font-medium text-green-700">
              ✓ 已配置
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          API Key 将用于所有 API 请求。请妥善保管。
        </p>
      </section>

      {/* API 端点 */}
      <section className="rounded-sm border border-neutral-200 p-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-900">API 端点</h2>
          <button
            onClick={handleTestConnection}
            disabled={testingConnection || !api.apiEndpoint}
            className="flex items-center gap-2 rounded-sm border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-neutral-300 disabled:opacity-50"
          >
            {testingConnection ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700" />
                测试中...
              </>
            ) : (
              <>测试连接</>
            )}
          </button>
        </div>
        <input
          type="url"
          value={api.apiEndpoint}
          onChange={(e) => updateApiSettings({ apiEndpoint: e.target.value })}
          placeholder="https://api.openai.com/v1"
          className="w-full rounded-sm border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-red-600 focus:outline-none"
        />
        <p className="mt-2 text-xs text-neutral-500">
          自定义 API 端点地址，用于代理或私有部署。
        </p>
      </section>

      {/* 环境变量状态 */}
      <section className="rounded-sm border border-neutral-200 p-8">
        <h2 className="mb-4 text-sm font-medium text-neutral-900">环境变量状态</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-sm bg-neutral-50 px-3 py-2">
            <span className="text-sm font-mono text-neutral-700">OPENAI_API_KEY</span>
            <span className={`text-xs ${api.envVars.OPENAI_API_KEY ? 'text-green-600' : 'text-neutral-400'}`}>
              {api.envVars.OPENAI_API_KEY ? '✓ 已加载' : '✗ 未设置'}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-sm bg-neutral-50 px-3 py-2">
            <span className="text-sm font-mono text-neutral-700">OPENAI_BASE_URL</span>
            <span className={`text-xs ${api.envVars.OPENAI_BASE_URL ? 'text-green-600' : 'text-yellow-600'}`}>
              {api.envVars.OPENAI_BASE_URL ? '✓ 已加载' : '⚠ 使用默认'}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-sm bg-neutral-50 px-3 py-2">
            <span className="text-sm font-mono text-neutral-700">OMNI_MODEL</span>
            <span className={`text-xs ${api.envVars.OMNI_MODEL ? 'text-green-600' : 'text-yellow-600'}`}>
              {api.envVars.OMNI_MODEL ? '✓ 已加载' : '⚠ 使用默认'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ApiSettings;
