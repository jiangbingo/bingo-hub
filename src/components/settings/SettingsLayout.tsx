/**
 * 设置页面主布局
 */

import React from 'react';
import { useSettingsStore } from '@/src/stores/settingsStore';
import SettingsSidebar from './SettingsSidebar';
import GeneralSettings from './sections/GeneralSettings';
import ApiSettings from './sections/ApiSettings';
import ModelSettings from './sections/ModelSettings';
import AdvancedSettings from './sections/AdvancedSettings';
import DataManagement from './sections/DataManagement';

const SettingsLayout: React.FC = () => {
  const { currentCategory, hasUnsavedChanges, saveSettings } = useSettingsStore();

  const renderContent = () => {
    switch (currentCategory) {
      case 'general':
        return <GeneralSettings />;
      case 'api':
        return <ApiSettings />;
      case 'model':
        return <ModelSettings />;
      case 'advanced':
        return <AdvancedSettings />;
      case 'data':
        return <DataManagement />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="flex h-screen bg-white text-neutral-900 font-sans">
      {/* 左侧导航 */}
      <SettingsSidebar />

      {/* 右侧内容区 */}
      <main className="flex-1 overflow-y-auto bg-white px-12 py-10">
        {/* 未保存提示 */}
        {hasUnsavedChanges && (
          <div className="mb-6 flex items-center justify-between border border-neutral-200 bg-neutral-50 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-sm bg-red-600" />
              <span className="text-sm text-neutral-600">您有未保存的更改</span>
            </div>
            <button className="text-xs text-neutral-400 hover:text-neutral-600">✕</button>
          </div>
        )}

        {/* 内容区 */}
        {renderContent()}

        {/* 底部保存按钮 */}
        <div className="mt-8 flex justify-end gap-3 border-t border-neutral-200 pt-6">
          <button className="px-5 py-2.5 text-sm font-medium text-neutral-900">
            取消
          </button>
          <button
            onClick={() => saveSettings()}
            className="bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            保存更改
          </button>
        </div>
      </main>
    </div>
  );
};

export default SettingsLayout;
