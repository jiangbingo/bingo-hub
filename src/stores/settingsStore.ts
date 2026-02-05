/**
 * 设置页面状态管理
 * 使用 Zustand 管理设置状态
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  SettingsConfig,
  GeneralSettings,
  ApiSettings,
  ModelSettings,
  AdvancedSettings,
  SettingsCategory,
} from '@/src/types/settings';

// 默认配置
const defaultGeneralSettings: GeneralSettings = {
  storage: 'localStorage',
  theme: 'system',
  language: 'zh',
};

const defaultApiSettings: ApiSettings = {
  apiKey: '',
  apiEndpoint: 'https://api.openai.com/v1',
  envVars: {
    OPENAI_API_KEY: false,
    OPENAI_BASE_URL: false,
    OMNI_MODEL: false,
  },
};

const defaultModelSettings: ModelSettings = {
  defaultModel: 'gpt-4o',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 4096,
};

const defaultAdvancedSettings: AdvancedSettings = {
  timeout: 120,
  retryCount: 3,
  retryDelay: 1000,
  proxy: {
    enabled: false,
    type: 'http',
  },
};

interface SettingsStore {
  // 当前设置
  config: SettingsConfig;

  // 当前选中的分类
  currentCategory: SettingsCategory;

  // 是否有未保存的更改
  hasUnsavedChanges: boolean;

  // 设置当前分类
  setCurrentCategory: (category: SettingsCategory) => void;

  // 更新通用设置
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => void;

  // 更新 API 设置
  updateApiSettings: (settings: Partial<ApiSettings>) => void;

  // 更新模型设置
  updateModelSettings: (settings: Partial<ModelSettings>) => void;

  // 更新高级设置
  updateAdvancedSettings: (settings: Partial<AdvancedSettings>) => void;

  // 保存所有设置
  saveSettings: () => Promise<void>;

  // 重置设置
  resetSettings: () => void;

  // 导出设置
  exportSettings: () => string;

  // 导入设置
  importSettings: (json: string) => boolean;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      config: {
        general: defaultGeneralSettings,
        api: defaultApiSettings,
        model: defaultModelSettings,
        advanced: defaultAdvancedSettings,
      },
      currentCategory: 'general',
      hasUnsavedChanges: false,

      setCurrentCategory: (category) => set({ currentCategory: category }),

      updateGeneralSettings: (settings) =>
        set((state) => ({
          config: {
            ...state.config,
            general: { ...state.config.general, ...settings },
          },
          hasUnsavedChanges: true,
        })),

      updateApiSettings: (settings) =>
        set((state) => ({
          config: {
            ...state.config,
            api: { ...state.config.api, ...settings },
          },
          hasUnsavedChanges: true,
        })),

      updateModelSettings: (settings) =>
        set((state) => ({
          config: {
            ...state.config,
            model: { ...state.config.model, ...settings },
          },
          hasUnsavedChanges: true,
        })),

      updateAdvancedSettings: (settings) =>
        set((state) => ({
          config: {
            ...state.config,
            advanced: { ...state.config.advanced, ...settings },
          },
          hasUnsavedChanges: true,
        })),

      saveSettings: async () => {
        // 这里可以添加 API 调用或其他持久化逻辑
        set({ hasUnsavedChanges: false });
      },

      resetSettings: () =>
        set({
          config: {
            general: defaultGeneralSettings,
            api: defaultApiSettings,
            model: defaultModelSettings,
            advanced: defaultAdvancedSettings,
          },
          hasUnsavedChanges: true,
        }),

      exportSettings: () => {
        return JSON.stringify(get().config, null, 2);
      },

      importSettings: (json) => {
        try {
          const config = JSON.parse(json) as SettingsConfig;
          set({ config, hasUnsavedChanges: true });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'omnihub-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
