/**
 * 视频生成相关常量配置
 */

import { BigModelModel } from 'zhipuai';

/**
 * 视频模型选项
 */
export const VIDEO_MODEL_OPTIONS: Array<{
  value: BigModelModel;
  label: string;
  description: string;
}> = [
  {
    value: 'cogvideox-5',
    label: 'CogVideoX-5',
    description: '最新一代视频生成模型，质量最高'
  },
  {
    value: 'cogvideox-5b',
    label: 'CogVideoX-5B',
    description: '精简版模型，生成速度更快'
  },
];

/**
 * 默认视频生成参数
 */
export const DEFAULT_VIDEO_CONFIG = {
  model: 'cogvideox-5b' as BigModelModel,
  promptLength: { min: 10, max: 500 },
} as const;

/**
 * 任务状态
 */
export const TASK_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

/**
 * 轮询配置
 */
export const POLLING_CONFIG = {
  interval: 3000, // 3秒
  maxAttempts: 100, // 最多5分钟
  backoffMultiplier: 1.1,
} as const;
