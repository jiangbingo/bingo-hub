/**
 * API 验证 Schemas
 * 使用 Zod 进行输入验证
 */

import { z } from 'zod';

// ==================== 基础 Schema ====================

/**
 * Chat 消息 Schema
 * 验证 role 和 content 字段
 */
export const ChatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant'], {
    errorMap: () => ({ message: 'Role must be one of: system, user, assistant' })
  }),
  content: z.string({
    required_error: 'Message content is required'
  }).min(1, 'Message content cannot be empty').max(128000, 'Message content too long'),
});

/**
 * Chat API 请求白名单模型
 */
const CHAT_MODEL_WHITELIST = [
  'glm-4',
  'glm-4-plus',
  'glm-4-0520',
  'glm-4-air',
  'glm-4-airx',
  'glm-4-flash',
  'glm-4-flashx',
  'glm-3-turbo',
] as const;

/**
 * Image API 请求白名单模型
 */
const IMAGE_MODEL_WHITELIST = [
  'cogview-3-plus',
  'cogview-3',
] as const;

/**
 * Video API 请求白名单模型
 */
const VIDEO_MODEL_WHITELIST = [
  'cogvideox-5b',
  'cogvideox-2b',
] as const;

// ==================== Chat API Schema ====================

/**
 * Chat API 请求体 Schema
 */
export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema, {
    required_error: 'Messages array is required',
    invalid_type_error: 'Messages must be an array'
  }).min(1, 'At least one message is required')
    .max(200, 'Too many messages (max 200)'),

  model: z.enum(CHAT_MODEL_WHITELIST, {
    errorMap: () => ({
      message: `Model must be one of: ${CHAT_MODEL_WHITELIST.join(', ')}`
    })
  }),

  stream: z.boolean().optional().default(false),

  temperature: z.number({
    invalid_type_error: 'Temperature must be a number'
  }).min(0, 'Temperature must be between 0 and 2')
    .max(2, 'Temperature must be between 0 and 2')
    .optional()
    .default(0.7),

  top_p: z.number({
    invalid_type_error: 'Top_p must be a number'
  }).min(0, 'Top_p must be between 0 and 1')
    .max(1, 'Top_p must be between 0 and 1')
    .optional()
    .default(0.9),

  max_tokens: z.number({
    invalid_type_error: 'Max_tokens must be a number'
  }).int('Max_tokens must be an integer')
    .min(1, 'Max_tokens must be at least 1')
    .max(128000, 'Max_tokens cannot exceed 128000')
    .optional()
    .default(4096),
});

// ==================== Image API Schema ====================

/**
 * Image API 尺寸白名单
 */
const IMAGE_SIZE_WHITELIST = [
  '1024x1024',
  '768x1344',
  '864x1152',
  '1344x768',
  '1152x864',
] as const;

/**
 * Image API 请求体 Schema
 */
export const ImageRequestSchema = z.object({
  prompt: z.string({
    required_error: 'Prompt is required'
  }).min(1, 'Prompt cannot be empty')
    .max(4000, 'Prompt too long (max 4000 characters)')
    .trim(),

  model: z.enum(IMAGE_MODEL_WHITELIST, {
    errorMap: () => ({
      message: `Model must be one of: ${IMAGE_MODEL_WHITELIST.join(', ')}`
    })
  }).optional().default('cogview-3-plus'),

  size: z.enum(IMAGE_SIZE_WHITELIST, {
    errorMap: () => ({
      message: `Size must be one of: ${IMAGE_SIZE_WHITELIST.join(', ')}`
    })
  }).optional().default('1024x1024'),

  n: z.number({
    invalid_type_error: 'N must be a number'
  }).int('N must be an integer')
    .min(1, 'N must be at least 1')
    .max(4, 'N cannot exceed 4')
    .optional()
    .default(1),
});

// ==================== Video API Schema ====================

/**
 * Video API 时长白名单
 */
const VIDEO_DURATION_WHITELIST = ['5', '6'] as const;

/**
 * Video API 分辨率白名单
 */
const VIDEO_RESOLUTION_WHITELIST = [
  '720p',
  '1080p',
] as const;

/**
 * Video API 宽高比白名单
 */
const VIDEO_ASPECT_RATIO_WHITELIST = [
  '16:9',
  '9:16',
] as const;

/**
 * Video API 请求体 Schema
 */
export const VideoRequestSchema = z.object({
  prompt: z.string({
    required_error: 'Prompt is required'
  }).min(1, 'Prompt cannot be empty')
    .max(2000, 'Prompt too long (max 2000 characters)')
    .trim(),

  model: z.enum(VIDEO_MODEL_WHITELIST, {
    errorMap: () => ({
      message: `Model must be one of: ${VIDEO_MODEL_WHITELIST.join(', ')}`
    })
  }).optional().default('cogvideox-5b'),

  duration: z.enum(VIDEO_DURATION_WHITELIST, {
    errorMap: () => ({
      message: `Duration must be one of: ${VIDEO_DURATION_WHITELIST.join(', ')} seconds`
    })
  }).optional().default('5'),

  resolution: z.enum(VIDEO_RESOLUTION_WHITELIST, {
    errorMap: () => ({
      message: `Resolution must be one of: ${VIDEO_RESOLUTION_WHITELIST.join(', ')}`
    })
  }).optional().default('720p'),

  aspect_ratio: z.enum(VIDEO_ASPECT_RATIO_WHITELIST, {
    errorMap: () => ({
      message: `Aspect ratio must be one of: ${VIDEO_ASPECT_RATIO_WHITELIST.join(', ')}`
    })
  }).optional().default('16:9'),
});

/**
 * Video API 查询参数 Schema (GET 请求)
 */
export const VideoQuerySchema = z.object({
  id: z.string({
    required_error: 'Task ID is required'
  }).min(1, 'Task ID cannot be empty')
    .max(100, 'Task ID too long'),
});

// ==================== 类型导出 ====================

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ImageRequest = z.infer<typeof ImageRequestSchema>;
export type VideoRequest = z.infer<typeof VideoRequestSchema>;
export type VideoQuery = z.infer<typeof VideoQuerySchema>;
