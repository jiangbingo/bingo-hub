/**
 * VideoTaskCard - 单个视频任务卡片
 * 显示视频生成任务的状态和结果
 */

import { BarLoader } from '@/components/ui/Loading';
import { BigModelModel } from '@/types/bigmodel';
import styles from './VideoTaskCard.module.css';

export interface VideoTask {
  id: string;
  prompt: string;
  model: BigModelModel;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  coverUrl?: string;
  error?: string;
  timestamp: number;
}

interface VideoTaskCardProps {
  task: VideoTask;
  onDownload: (videoUrl: string, taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const STATUS_CONFIG = {
  pending: {
    label: '等待中',
    color: 'var(--warning)',
    bgColor: 'var(--warning-light)',
    icon: '⏳',
  },
  processing: {
    label: '生成中',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.1)',
    icon: '🎬',
  },
  completed: {
    label: '已完成',
    color: 'var(--success)',
    bgColor: 'var(--success-light)',
    icon: '✅',
  },
  failed: {
    label: '失败',
    color: 'var(--error)',
    bgColor: 'var(--error-light)',
    icon: '❌',
  },
} as const;

export default function VideoTaskCard({ task, onDownload, onDelete }: VideoTaskCardProps) {
  const config = STATUS_CONFIG[task.status];

  return (
    <div className={styles.taskCard} role="listitem">
      <div className={styles.taskHeader}>
        <div
          className={styles.taskStatus}
          style={{ color: config.color, background: config.bgColor }}
        >
          <span className={styles.statusIcon} aria-hidden="true">
            {config.icon}
          </span>
          <span className={styles.statusLabel}>{config.label}</span>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className={styles.deleteButton}
          aria-label="删除任务"
          disabled={task.status === 'processing'}
        >
          ×
        </button>
      </div>

      <div className={styles.taskPrompt}>
        <p>{task.prompt}</p>
      </div>

      {task.status === 'processing' && (
        <div className={styles.taskProgress}>
          <BarLoader />
          <p className={styles.progressText}>正在生成视频，请稍候...</p>
        </div>
      )}

      {task.status === 'completed' && task.videoUrl && (
        <div className={styles.taskResult}>
          <video
            src={task.videoUrl}
            poster={task.coverUrl}
            controls
            className={styles.videoPlayer}
            aria-label={`生成的视频: ${task.prompt}`}
          />
          <div className={styles.taskActions}>
            <button
              onClick={() => onDownload(task.videoUrl!, task.id)}
              className={styles.actionButton}
              aria-label="下载视频"
            >
              <span aria-hidden="true">⬇️</span>
              <span>下载</span>
            </button>
          </div>
        </div>
      )}

      {task.status === 'failed' && (
        <div className={styles.taskError}>
          <p className={styles.errorMessage}>{task.error || '视频生成失败'}</p>
        </div>
      )}

      <div className={styles.taskFooter}>
        <span className={styles.taskTime}>
          {new Date(task.timestamp).toLocaleString('zh-CN')}
        </span>
        <span className={styles.taskModel}>{task.model}</span>
      </div>
    </div>
  );
}
