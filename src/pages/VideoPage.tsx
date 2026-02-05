/**
 * VideoPage - 视频生成页面
 * 使用 CogVideoX 模型生成 AI 视频
 */

import { useState } from 'react';
import VideoWorkspace from '../components/workspace/VideoWorkspace';
import { BigModelModel } from '../types/bigmodel';
import styles from './VideoPage.module.css';

interface VideoTask {
  id: string;
  prompt: string;
  model: BigModelModel;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  coverUrl?: string;
  error?: string;
  timestamp: number;
}

export default function VideoPage() {
  const [tasks, setTasks] = useState<VideoTask[]>([]);
  const [selectedModel, setSelectedModel] = useState<BigModelModel>(
    BigModelModel.COGVIDEOX_5B
  );

  const handleGenerate = (prompt: string, config: {
    duration?: number;
    resolution?: '720p' | '1080p';
    aspectRatio?: '16:9' | '9:16';
  }) => {
    const taskId = `video-${Date.now()}`;

    const newTask: VideoTask = {
      id: taskId,
      prompt,
      model: selectedModel,
      status: 'pending',
      timestamp: Date.now(),
    };

    setTasks((prev) => [newTask, ...prev]);
    return taskId;
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<VideoTask>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const handleClearTasks = () => {
    setTasks([]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  return (
    <div className={styles.videoPage}>
      {/* 页面标题 */}
      <div className={styles.videoHeader}>
        <h1 className={styles.videoTitle}>视频生成</h1>
        <p className={styles.videoSubtitle}>使用 CogVideoX 创建 AI 视频</p>
      </div>

      {/* 视频工作区 */}
      <VideoWorkspace
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onGenerate={handleGenerate}
        onTaskUpdate={handleTaskUpdate}
        tasks={tasks}
        onClearTasks={handleClearTasks}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
}
