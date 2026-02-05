// 导出 BigModel 类型
export * from './bigmodel';

// 保留现有的 GeneratedAsset 和 GroundingSource 以兼容
export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  prompt: string;
  timestamp: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}
