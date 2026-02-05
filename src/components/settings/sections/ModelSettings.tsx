/**
 * 模型配置
 */

import React from 'react';
import { useSettingsStore } from '@/src/stores/settingsStore';

const MODEL_OPTIONS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'o1', label: 'o1' },
  { value: 'o3-mini', label: 'o3-mini' },
];

const ModelSettings: React.FC = () => {
  const { config, updateModelSettings } = useSettingsStore();
  const { model } = config;

  return (
    <div className="flex flex-col gap-12">
      {/* 标题 */}
      <div>
        <h1 className="text-[40px] font-semibold text-neutral-900">模型配置</h1>
        <p className="mt-2 text-sm text-neutral-500">配置默认模型和生成参数</p>
      </div>

      {/* 默认模型 */}
      <section className="rounded-sm border border-neutral-200 p-8">
        <h2 className="mb-3 text-sm font-medium text-neutral-900">默认模型</h2>
        <div className="relative w-64">
          <select
            value={model.defaultModel}
            onChange={(e) => updateModelSettings({ defaultModel: e.target.value })}
            className="w-full appearance-none rounded-sm border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:border-red-600 focus:outline-none"
          >
            {MODEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
            ▼
          </span>
        </div>
      </section>

      {/* 温度 */}
      <section className="rounded-sm border border-neutral-200 p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-900">温度 (Temperature)</h2>
          <span className="text-sm font-semibold text-neutral-900">{model.temperature}</span>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={model.temperature}
          onChange={(e) => updateModelSettings({ temperature: parseFloat(e.target.value) })}
          className="w-full accent-red-600"
        />
        <p className="mt-3 text-xs text-neutral-500">
          控制随机性。值越高越随机，适合创意任务；值越低越精确，适合代码生成。
        </p>
      </section>

      {/* Top-P */}
      <section className="rounded-sm border border-neutral-200 p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-900">Top-P</h2>
          <span className="text-sm font-semibold text-neutral-900">{model.topP}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={model.topP}
          onChange={(e) => updateModelSettings({ topP: parseFloat(e.target.value) })}
          className="w-full accent-red-600"
        />
        <p className="mt-3 text-xs text-neutral-500">
          核采样概率。控制生成词汇的多样性范围。
        </p>
      </section>

      {/* Max Tokens */}
      <section className="rounded-sm border border-neutral-200 p-8">
        <h2 className="mb-3 text-sm font-medium text-neutral-900">最大生成长度 (Max Tokens)</h2>
        <input
          type="number"
          min="1"
          max="128000"
          value={model.maxTokens}
          onChange={(e) => updateModelSettings({ maxTokens: parseInt(e.target.value) || 4096 })}
          className="w-48 rounded-sm border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:border-red-600 focus:outline-none"
        />
        <p className="mt-2 text-xs text-neutral-500">
          单次生成的最大 token 数量，影响输出长度和成本。
        </p>
      </section>

      {/* 参数说明卡片 */}
      <section className="rounded-sm border border-neutral-200 bg-neutral-50 p-6">
        <h3 className="mb-3 text-sm font-semibold text-neutral-900">💡 参数建议</h3>
        <ul className="space-y-2 text-xs text-neutral-600">
          <li>• <strong>温度 0-0.3</strong>：适合需要精确答案的任务（代码生成、数据提取）</li>
          <li>• <strong>温度 0.7-1.0</strong>：适合创意任务（写作、头脑风暴）</li>
          <li>• <strong>温度 1.0-2.0</strong>：高随机性，适合实验性探索</li>
        </ul>
      </section>
    </div>
  );
};

export default ModelSettings;
