/**
 * 图像生成相关常量配置
 */

import type { ImageStyle, AspectRatio } from '@/stores/imageStore';

/**
 * 图像风格选项
 */
export const STYLE_OPTIONS: Array<{
  value: ImageStyle;
  label: string;
  description: string;
}> = [
  { value: 'none', label: '无风格', description: '默认风格' },
  { value: 'realistic', label: '写实', description: '照片级真实感' },
  { value: 'anime', label: '动漫', description: '日式动漫风格' },
  { value: 'oil-painting', label: '油画', description: '经典油画质感' },
  { value: 'watercolor', label: '水彩', description: '清新水彩风格' },
  { value: 'sketch', label: '素描', description: '手绘素描效果' },
  { value: '3d-render', label: '3D 渲染', description: '三维渲染质感' },
];

/**
 * 宽高比选项
 */
export const ASPECT_RATIO_OPTIONS: Array<{
  value: AspectRatio;
  label: string;
  dimensions: string;
}> = [
  { value: '1:1', label: '1:1', dimensions: '1024×1024' },
  { value: '9:16', label: '9:16', dimensions: '768×1344' },
  { value: '16:9', label: '16:9', dimensions: '1344×768' },
  { value: '3:4', label: '3:4', dimensions: '864×1152' },
  { value: '4:3', label: '4:3', dimensions: '1152×864' },
];

/**
 * 图像尺寸配置
 */
export const IMAGE_SIZE_CONFIG: Record<AspectRatio, string> = {
  '1:1': '1024x1024',
  '9:16': '768x1344',
  '16:9': '1344x768',
  '3:4': '864x1152',
  '4:3': '1152x864',
};

/**
 * 图像模型配置
 */
export const IMAGE_MODELS = {
  FLASH: 'cogview-3-flash',
  PLUS: 'cogview-3-plus',
} as const;

export type ImageModel = (typeof IMAGE_MODELS)[keyof typeof IMAGE_MODELS];

/**
 * 图像模型选项
 */
export const IMAGE_MODEL_OPTIONS = [
  { value: IMAGE_MODELS.FLASH, label: 'CogView-3 Flash (快速)' },
  { value: IMAGE_MODELS.PLUS, label: 'CogView-3 Plus (高质量)' },
];
