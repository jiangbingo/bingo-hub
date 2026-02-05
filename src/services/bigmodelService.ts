const API_BASE = 'https://open.bigmodel.cn/api/paas/v4';

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

export async function chatCompletion(
  messages: Message[],
  apiKey: string,
  model: string = 'glm-4-flash'
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function chatCompletionStream(
  messages: Message[],
  apiKey: string,
  model: string = 'glm-4-flash',
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}

export function getApiKey(): string {
  return import.meta.env.VITE_BIGMODEL_API_KEY || '';
}

// ============================================
// 图像生成 API
// ============================================

export interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url: string;
    revised_prompt?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface ImageGenerationConfig {
  model: 'cogview-3-plus' | 'cogview-3-flash';
  prompt: string;
  size?: '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864';
  quality?: 'standard' | 'hd';
  style?: string;
  n?: number;
}

/**
 * 生成图像
 * 使用 zhipuai SDK 的图像生成功能
 */
export async function generateImage(
  config: ImageGenerationConfig
): Promise<ImageGenerationResponse> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('API Key 未配置，请在环境变量中设置 VITE_BIGMODEL_API_KEY');
  }

  try {
    const response = await fetch(`${API_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        prompt: config.prompt,
        size: config.size || '1024x1024',
        quality: config.quality || 'standard',
        style: config.style,
        n: config.n || 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API Error: ${response.status} ${response.statusText}. ${
          errorData.error?.message || ''
        }`
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('图像生成失败，请稍后重试');
  }
}

/**
 * 从 URL 下载图像
 */
export async function downloadImage(url: string, filename?: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`下载失败: ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || `bigmodel-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    throw new Error(`下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 复制图像链接到剪贴板
 */
export async function copyImageUrl(url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url);
  } catch (error) {
    throw new Error(`复制失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// ============================================
// 视频生成 API
// ============================================

export interface VideoGenRequest {
  prompt: string;
  model?: string;
  duration?: number;
  resolution?: '720p' | '1080p';
  aspectRatio?: '16:9' | '9:16';
}

export interface VideoTaskResponse {
  id: string;
  request_id: string;
  task_status: 'PROCESSING' | 'SUCCESS' | 'FAILED';
  video_result?: {
    url: string;
    cover_url: string;
  };
  error_code?: string;
  error_message?: string;
}

/**
 * 生成 JWT Token (简化版，使用 HMAC-SHA256)
 * 注意：这是浏览器端的简化实现，生产环境应在服务端生成
 */
async function generateToken(apiKey: string): Promise<string> {
  try {
    const [id, secret] = apiKey.split('.');

    if (!id || !secret) {
      throw new Error('无效的 API Key 格式');
    }

    // 创建 header
    const header = {
      alg: 'HS256',
      sign_type: 'SIGN',
    };

    // 创建 payload
    const now = Date.now();
    const payload = {
      api_key: id,
      exp: now + 3600000, // 1 小时后过期
      timestamp: now,
    };

    // Base64URL 编码
    function base64UrlEncode(obj: any): string {
      const str = JSON.stringify(obj);
      const base64 = btoa(str);
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payload);
    const data = `${encodedHeader}.${encodedPayload}`;

    // 使用 Web Crypto API 生成签名
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(data);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
    const encodedSignature = signatureBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    return `${data}.${encodedSignature}`;
  } catch (error) {
    console.error('生成 Token 失败:', error);
    throw new Error('生成认证 Token 失败');
  }
}

/**
 * 提交视频生成任务
 * 使用原生 fetch API 进行异步视频生成
 */
export async function generateVideoAsync(
  request: VideoGenRequest,
  apiKey: string = getApiKey()
): Promise<VideoTaskResponse> {
  if (!apiKey) {
    throw new Error('API Key 未配置，请在环境变量中设置 VITE_BIGMODEL_API_KEY');
  }

  try {
    const token = await generateToken(apiKey);

    const response = await fetch(`${API_BASE}/videos/async`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: request.model || 'cogvideox-5b',
        prompt: request.prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API Error: ${response.status} ${response.statusText}. ${
          errorData.error?.message || ''
        }`
      );
    }

    const data = await response.json();

    return {
      id: data.id,
      request_id: data.request_id || data.id,
      task_status: 'PROCESSING',
    };
  } catch (error) {
    console.error('视频生成请求失败:', error);
    throw new Error(
      `视频生成失败: ${error instanceof Error ? error.message : '未知错误'}`
    );
  }
}

/**
 * 查询视频生成任务状态
 */
export async function getVideoStatus(
  taskId: string,
  apiKey: string = getApiKey()
): Promise<VideoTaskResponse> {
  if (!apiKey) {
    throw new Error('API Key 未配置，请在环境变量中设置 VITE_BIGMODEL_API_KEY');
  }

  try {
    const token = await generateToken(apiKey);

    const response = await fetch(`${API_BASE}/videos/async/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API Error: ${response.status} ${response.statusText}. ${
          errorData.error?.message || ''
        }`
      );
    }

    const data = await response.json();

    return {
      id: data.id,
      request_id: data.request_id || data.id,
      task_status: data.task_status,
      video_result: data.video_result,
      error_code: data.error_code,
      error_message: data.error_message,
    };
  } catch (error) {
    console.error('查询视频状态失败:', error);
    throw new Error(
      `查询状态失败: ${error instanceof Error ? error.message : '未知错误'}`
    );
  }
}

/**
 * 轮询视频生成结果
 * @param taskId 任务 ID
 * @param onUpdate 状态更新回调
 * @param timeout 超时时间（毫秒），默认 5 分钟
 * @param interval 轮询间隔（毫秒），默认 3 秒
 */
export async function pollVideoResult(
  taskId: string,
  onUpdate: (status: VideoTaskResponse) => void,
  timeout: number = 5 * 60 * 1000,
  interval: number = 3000,
  apiKey: string = getApiKey()
): Promise<VideoTaskResponse> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const status = await getVideoStatus(taskId, apiKey);
      onUpdate(status);

      if (status.task_status === 'SUCCESS') {
        return status;
      }

      if (status.task_status === 'FAILED') {
        throw new Error(
          status.error_message || '视频生成失败'
        );
      }

      // 等待下次轮询
      await new Promise((resolve) => setTimeout(resolve, interval));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('轮询过程中发生错误');
    }
  }

  throw new Error('视频生成超时，请稍后查看任务状态');
}

/**
 * 下载视频文件
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
