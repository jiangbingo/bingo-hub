/**
 * 设置页面相关类型定义
 */

// 存储位置类型
export type StorageLocation = 'localStorage' | 'indexedDB' | 'custom';

// 主题类型
export type Theme = 'light' | 'dark' | 'system';

// 语言类型
export type Language = 'zh' | 'en' | 'ja';

// 代理类型
export type ProxyType = 'http' | 'https' | 'socks5';

// 环境变量状态
export interface EnvVarStatus {
  OPENAI_API_KEY: boolean;
  OPENAI_BASE_URL: boolean;
  OMNI_MODEL: boolean;
}

// 通用设置
export interface GeneralSettings {
  storage: StorageLocation;
  customPath?: string;
  theme: Theme;
  language: Language;
}

// API 配置
export interface ApiSettings {
  apiKey: string;
  apiEndpoint: string;
  envVars: EnvVarStatus;
}

// 模型配置
export interface ModelSettings {
  defaultModel: string;
  temperature: number;
  topP: number;
  maxTokens: number;
}

// 代理配置
export interface ProxyConfig {
  enabled: boolean;
  type: ProxyType;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
}

// 高级设置
export interface AdvancedSettings {
  timeout: number;
  retryCount: number;
  retryDelay: number;
  proxy: ProxyConfig;
}

// 完整设置配置
export interface SettingsConfig {
  general: GeneralSettings;
  api: ApiSettings;
  model: ModelSettings;
  advanced: AdvancedSettings;
}

// 导航项
export interface SettingsNavItem {
  id: string;
  label: string;
  icon: string;
}

// 设置分类
export type SettingsCategory = 'general' | 'api' | 'model' | 'advanced' | 'data';
