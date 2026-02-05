/**
 * 数据管理
 */

import React, { useRef, useState } from 'react';
import { useSettingsStore } from '@/src/stores/settingsStore';

const DataManagement: React.FC = () => {
  const { config, resetSettings, exportSettings, importSettings } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [resetInput, setResetInput] = useState('');

  const handleExport = () => {
    const json = exportSettings();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnihub-settings-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      if (importSettings(json)) {
        alert('配置导入成功！');
      } else {
        alert('配置文件格式错误，导入失败。');
      }
    };
    reader.readAsText(file);
    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (resetInput === 'RESET ALL') {
      resetSettings();
      setShowResetConfirm(false);
      setResetInput('');
      alert('所有设置已重置为默认值。');
    }
  };

  const handleClearConfig = () => {
    if (showClearConfirm) {
      localStorage.clear();
      sessionStorage.clear();
      setShowClearConfirm(false);
      alert('所有配置已清除，页面将刷新。');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setShowClearConfirm(true);
    }
  };

  return (
    <div className="flex flex-col gap-12">
      {/* 标题 */}
      <div>
        <h1 className="text-[40px] font-semibold text-neutral-900">数据管理</h1>
        <p className="mt-2 text-sm text-neutral-500">导入、导出和管理配置数据</p>
      </div>

      {/* 导入配置 */}
      <section className="rounded-sm border border-neutral-200 p-8">
        <h2 className="mb-4 text-sm font-medium text-neutral-900">导入配置</h2>
        <p className="mb-4 text-sm text-neutral-600">
          从 JSON 文件导入配置，将覆盖当前设置。
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-sm border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-900 hover:border-neutral-300"
        >
          选择文件
        </button>
      </section>

      {/* 导出配置 */}
      <section className="rounded-sm border border-neutral-200 p-8">
        <h2 className="mb-4 text-sm font-medium text-neutral-900">导出配置</h2>
        <p className="mb-4 text-sm text-neutral-600">
          将当前配置导出为 JSON 文件，可用于备份或迁移。
        </p>
        <button
          onClick={handleExport}
          className="rounded-sm border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-900 hover:border-neutral-300"
        >
          导出配置
        </button>
      </section>

      {/* 危险操作区 */}
      <section className="rounded-sm border border-neutral-200 p-6">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <h2 className="text-sm font-medium text-neutral-900">危险操作</h2>
        </div>
        <p className="mb-6 text-sm text-neutral-500">
          以下操作不可逆，请谨慎操作
        </p>

        <div className="space-y-3">
          {/* 清除配置 */}
          <button
            onClick={handleClearConfig}
            className="w-full rounded-sm border border-neutral-200 px-4 py-3 text-left text-sm font-medium text-neutral-900 hover:border-neutral-300"
          >
            {showClearConfirm ? '确认清除配置？' : '清除配置'}
          </button>

          {/* 重置全部 */}
          <button
            onClick={() => setShowResetConfirm(!showResetConfirm)}
            className="w-full rounded-sm border border-red-600 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            重置全部
          </button>

          {/* 重置确认 */}
          {showResetConfirm && (
            <div className="rounded-sm border border-red-200 bg-red-50 p-4">
              <p className="mb-3 text-sm text-red-700">
                此操作将清除所有数据并恢复默认设置。输入 <code className="rounded-sm bg-red-100 px-1.5 py-0.5 text-xs font-mono">RESET ALL</code> 确认。
              </p>
              <input
                type="text"
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder="RESET ALL"
                className="mb-3 w-full rounded-sm border border-red-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-red-600 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetInput('');
                  }}
                  className="flex-1 rounded-sm border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-300"
                >
                  取消
                </button>
                <button
                  onClick={handleReset}
                  disabled={resetInput !== 'RESET ALL'}
                  className="flex-1 rounded-sm bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认重置
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DataManagement;
