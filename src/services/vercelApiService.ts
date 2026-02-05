/**
 * Vercel API 代理服务
 *
 * 通过 Vercel Serverless Functions 调用 BigModel API
 * 解决 CORS 问题
 */

// 检测是否在 Vercel 环境中
const isVercel = typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');
const isProduction = import.meta.env.PROD;

// API 基础路径
const API_BASE = isVercel || isProduction ? '/api' : 'http://localhost:3000/api';

// ============================================
// 类型定义
// ============================================

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url: string;
    revised_prompt?: string;
  }>;
}

export interface VideoTaskResponse {
  id: string;
  request_id: string;
  task_status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  video_result?: {
    url: string;
    cover_url: string;
  };
  error_code?: string;
  error_message?: string;
}

// ============================================
// 文本对话 API
// ============================================

/**
 * 非流式对话完成
 */
export async function chatCompletion(
  messages: Message[],
  model: string = 'glm-4-flash',
  options?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  }
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      temperature: options?.temperature || 0.7,
      top_p: options?.top_p || 0.9,
      max_tokens: options?.max_tokens || 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Chat completion failed');
  }

  return response.json();
}

/**
 * 流式对话完成
 */
export async function* chatCompletionStream(
  messages: Message[],
  model: string = 'glm-4-flash',
  options?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  }
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: options?.temperature || 0.7,
      top_p: options?.top_p || 0.9,
      max_tokens: options?.max_tokens || 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Stream completion failed');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ============================================
// 图像生成 API
// ============================================

export interface ImageGenerationConfig {
  model?: 'cogview-3-plus' | 'cogview-3-flash';
  prompt: string;
  size?: '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864';
  n?: number;
}

/**
 * 生成图像
 */
export async function generateImage(
  config: ImageGenerationConfig
): Promise<ImageGenerationResponse> {
  const response = await fetch(`${API_BASE}/image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model || 'cogview-3-plus',
      prompt: config.prompt,
      size: config.size || '1024x1024',
      n: config.n || 1,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Image generation failed');
  }

  return response.json();
}

/**
 * 下载图像
 */
export async function downloadImage(url: string, filename?: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Download failed');

  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename || `bigmodel-image-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(downloadUrl);
}

/**
 * 复制图像链接
 */
export async function copyImageUrl(url: string): Promise<void> {
  await navigator.clipboard.writeText(url);
}

// ============================================
// 视频生成 API
// ============================================

export interface VideoGenRequest {
  prompt: string;
  model?: 'cogvideox-5b' | 'cogvideox-2b';
  duration?: number;
  resolution?: '720p' | '1080p';
  aspectRatio?: '16:9' | '9:16';
}

/**
 * 提交视频生成任务
 */
export async function generateVideoAsync(
  request: VideoGenRequest
): Promise<VideoTaskResponse> {
  const response = await fetch(`${API_BASE}/video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: request.model || 'cogvideox-5b',
      prompt: request.prompt,
      duration: request.duration || 5,
      resolution: request.resolution || '720p',
      aspect_ratio: request.aspectRatio || '16:9',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Video generation failed');
  }

  return response.json();
}

/**
 * 查询视频生成任务状态
 */
export async function getVideoStatus(taskId: string): Promise<VideoTaskResponse> {
  const response = await fetch(`${API_BASE}/video?id=${taskId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to retrieve video status');
  }

  return response.json();
}

/**
 * 轮询视频生成结果
 */
export async function pollVideoResult(
  taskId: string,
  onUpdate?: (status: VideoTaskResponse) => void,
  timeout: number = 5 * 60 * 1000,
  interval: number = 3000
): Promise<VideoTaskResponse> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const status = await getVideoStatus(taskId);

    if (onUpdate) {
      onUpdate(status);
    }

    if (status.task_status === 'SUCCESS') {
      return status;
    }

    if (status.task_status === 'FAILED') {
      throw new Error(status.error_message || 'Video generation failed');
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error('Video generation timeout');
}

/**
 * 下载视频
 */
export function downloadVideo(url: string, filename: string = 'video.mp4'): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
