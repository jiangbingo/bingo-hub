// BigModel 模型枚举
export enum BigModelModel {
  // 文本对话
  GLM_4_PLUS = 'glm-4-plus',
  GLM_4_AIR = 'glm-4-air',
  GLM_4_FLASH = 'glm-4-flash',
  GLM_4_LONG = 'glm-4-long',

  // 图像生成
  COGVIEW_3_PLUS = 'cogview-3-plus',
  COGVIEW_3_FLASH = 'cogview-3-flash',

  // 视频生成
  COGVIDEOX_5B = 'cogvideox-5b',
  COGVIDEOX_2B = 'cogvideox-2b',
}

// 应用模式
export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  CODE = 'CODE',
  LONGTEXT = 'LONGTEXT',
  HISTORY = 'HISTORY',
  VISUAL_STUDIO = 'VISUAL_STUDIO',
  SONIC_LAB = 'SONIC_LAB',
  REASONING_HUB = 'REASONING_HUB',
  SETTINGS = 'SETTINGS',
}

// 消息类型
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// 会话
export interface Session {
  id: string;
  mode: AppMode;
  model: BigModelModel;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// 生成的内容资源
export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video' | 'audio' | 'code';
  url: string;
  prompt: string;
  model: BigModelModel;
  timestamp: number;
  metadata?: Record<string, any>;
}

// 生成配置
export interface GenerationConfig {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// 图像生成参数
export interface ImageGenConfig extends GenerationConfig {
  size?: '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864';
  style?: string;
  n?: number;
}

// 视频生成参数
export interface VideoGenConfig {
  duration?: number;
  resolution?: '720p' | '1080p';
  aspectRatio?: '16:9' | '9:16';
}
