/**
 * VideoWorkspace - 视频生成工作区
 * 包含输入表单和任务列表
 */

import { useState, useCallback, KeyboardEvent } from 'react';
import { Spinner, BarLoader } from '@/components/ui/Loading';
import VideoTaskCard, { type VideoTask } from '@/components/workspace/VideoTaskCard';
import {
  generateVideoAsync,
  pollVideoResult,
  downloadVideo,
} from '@/services/bigmodelService';
import { BigModelModel } from '@/types/bigmodel';
import styles from './VideoWorkspace.module.css';

interface VideoWorkspaceProps {
  selectedModel: BigModelModel;
  onModelChange: (model: BigModelModel) => void;
  onGenerate: (prompt: string, config: {
    duration?: number;
    resolution?: '720p' | '1080p';
    aspectRatio?: '16:9' | '9:16';
  }) => string;
  onTaskUpdate: (taskId: string, updates: Partial<VideoTask>) => void;
  tasks: VideoTask[];
  onClearTasks: () => void;
  onDeleteTask: (taskId: string) => void;
}

export default function VideoWorkspace({
  selectedModel,
  onModelChange,
  onGenerate,
  onTaskUpdate,
  tasks,
  onClearTasks,
  onDeleteTask,
}: VideoWorkspaceProps) {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(5);
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateClick = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      // 创建任务
      const taskId = onGenerate(prompt, { duration, resolution, aspectRatio });

      // 更新状态为处理中
      onTaskUpdate(taskId, { status: 'processing' });

      // 调用 API
      const response = await generateVideoAsync({
        prompt,
        model: selectedModel,
        duration,
        resolution,
        aspectRatio,
      });

      // 开始轮询
      await pollVideoResult(
        response.id,
        (status) => {
          if (status.task_status === 'SUCCESS' && status.video_result) {
            onTaskUpdate(taskId, {
              status: 'completed',
              videoUrl: status.video_result.url,
              coverUrl: status.video_result.cover_url,
            });
          } else if (status.task_status === 'FAILED') {
            onTaskUpdate(taskId, {
              status: 'failed',
              error: status.error_message || '生成失败',
            });
          }
        },
        5 * 60 * 1000, // 5 分钟超时
        3000 // 3 秒轮询间隔
      );
    } catch (error) {
      console.error('视频生成失败:', error);
      const errorMessage = error instanceof Error ? error.message : '生成失败';
      // 找到当前处理中的任务并标记为失败
      const pendingTask = tasks.find((t) => t.status === 'pending' || t.status === 'processing');
      if (pendingTask) {
        onTaskUpdate(pendingTask.id, {
          status: 'failed',
          error: errorMessage,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, duration, resolution, aspectRatio, selectedModel, isGenerating, onGenerate, onTaskUpdate, tasks]);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateClick();
    }
  };

  const handleDownload = (videoUrl: string, taskId: string) => {
    const timestamp = new Date().getTime();
    downloadVideo(videoUrl, `cogvideox-${timestamp}.mp4`);
  };

  const activeTaskCount = tasks.filter((t) => t.status === 'processing' || t.status === 'pending').length;

  return (
    <div className={styles.videoWorkspace}>
      <div className={styles.workspaceGrid}>
        {/* 左侧：输入控制区 */}
        <div className={styles.controlPanel}>
          <div className={styles.panelSection}>
            <h2 className={styles.sectionTitle}>生成设置</h2>

            {/* 模型选择 */}
            <div className={styles.formGroup}>
              <label htmlFor="model-select" className={styles.formLabel}>
                模型选择
              </label>
              <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value as BigModelModel)}
                className={styles.formSelect}
                aria-label="选择视频生成模型"
              >
                <option value={BigModelModel.COGVIDEOX_5B}>
                  CogVideoX-5B (高质量)
                </option>
                <option value={BigModelModel.COGVIDEOX_2B}>
                  CogVideoX-2B (快速生成)
                </option>
              </select>
            </div>

            {/* 视频描述 */}
            <div className={styles.formGroup}>
              <label htmlFor="video-prompt" className={styles.formLabel}>
                视频描述
              </label>
              <textarea
                id="video-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="描述你想要生成的视频内容...（英文效果更好）&#10;例如: A cat playing with a ball of yarn, slow motion, cinematic lighting"
                disabled={isGenerating}
                rows={5}
                className={styles.formTextarea}
                aria-label="视频描述输入"
                aria-describedby="prompt-hint"
              />
              <p id="prompt-hint" className={styles.formHint}>
                按 Enter 快速生成，Shift+Enter 换行
              </p>
            </div>

            {/* 时长滑块 */}
            <div className={styles.formGroup}>
              <div className={styles.sliderHeader}>
                <label htmlFor="duration-slider" className={styles.formLabel}>
                  视频时长
                </label>
                <span className={styles.sliderValue} aria-live="polite">
                  {duration} 秒
                </span>
              </div>
              <input
                id="duration-slider"
                type="range"
                min="2"
                max="10"
                step="1"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={isGenerating}
                className={styles.formSlider}
                aria-label="视频时长选择"
                aria-valuemin="2"
                aria-valuemax="10"
                aria-valuenow={duration}
              />
              <div className={styles.sliderLabels}>
                <span>2s</span>
                <span>10s</span>
              </div>
            </div>

            {/* 分辨率选择 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>分辨率</label>
              <div className={styles.radioGroup} role="radiogroup" aria-label="分辨率选择">
                {(['720p', '1080p'] as const).map((res) => (
                  <label key={res} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="resolution"
                      value={res}
                      checked={resolution === res}
                      onChange={() => setResolution(res)}
                      disabled={isGenerating}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioText}>{res}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 比例选择 */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>宽高比</label>
              <div className={styles.radioGroup} role="radiogroup" aria-label="宽高比选择">
                {(['16:9', '9:16'] as const).map((ratio) => (
                  <label key={ratio} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="aspectRatio"
                      value={ratio}
                      checked={aspectRatio === ratio}
                      onChange={() => setAspectRatio(ratio)}
                      disabled={isGenerating}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioText}>{ratio}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 生成按钮 */}
            <button
              onClick={handleGenerateClick}
              disabled={!prompt.trim() || isGenerating}
              className={styles.generateButton}
              aria-label={isGenerating ? '正在生成视频' : '生成视频'}
              aria-busy={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Spinner size="sm" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <span className={styles.btnIcon} aria-hidden="true">🎬</span>
                  <span>生成视频</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 右侧：任务列表 */}
        <div className={styles.tasksPanel}>
          <div className={styles.tasksHeader}>
            <h2 className={styles.sectionTitle}>生成任务</h2>
            {tasks.length > 0 && (
              <button
                onClick={onClearTasks}
                className={styles.clearButton}
                aria-label="清空所有任务"
              >
                清空
              </button>
            )}
          </div>

          {activeTaskCount > 0 && (
            <div className={styles.activeTasksInfo} role="status" aria-live="polite">
              <Spinner size="sm" />
              <span>正在处理 {activeTaskCount} 个任务...</span>
            </div>
          )}

          <div className={styles.tasksList} role="list">
            {tasks.length === 0 ? (
              <div className={styles.tasksEmpty}>
                <div className={styles.emptyIcon} aria-hidden="true">🎬</div>
                <h3>暂无生成任务</h3>
                <p>输入描述并点击生成按钮创建视频</p>
              </div>
            ) : (
              tasks.map((task) => (
                // @ts-expect-error - key prop is handled by React
                <VideoTaskCard
                  key={task.id}
                  task={task}
                  onDownload={handleDownload}
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
