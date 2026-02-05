/**
 * Skeleton - 骨架屏组件
 * 用于内容加载时的占位显示
 */

import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 骨架屏的宽度
   */
  width?: string | number;

  /**
   * 骨架屏的高度
   */
  height?: string | number;

  /**
   * 是否为圆形骨架
   */
  circle?: boolean;

  /**
   * 额外的类名
   */
  className?: string;
}

export function Skeleton({
  width,
  height,
  circle = false,
  className,
  ...props
}: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      role="status"
      aria-label="加载中"
      className={clsx('skeleton', circle && 'skeleton-circle', className)}
      style={style}
      {...props}
    >
      <span className="sr-only">加载中...</span>
    </div>
  );
}

/**
 * CardSkeleton - 卡片骨架屏
 */
export function CardSkeleton() {
  return (
    <div className="card-skeleton" role="status" aria-label="卡片加载中">
      <Skeleton width={48} height={48} circle />
      <Skeleton className="card-skeleton-title" height={24} />
      <Skeleton className="card-skeleton-text" height={16} />
      <Skeleton className="card-skeleton-text" height={16} width="80%" />
    </div>
  );
}

/**
 * MessageSkeleton - 消息骨架屏
 */
export function MessageSkeleton() {
  return (
    <div className="message-skeleton" role="status" aria-label="消息加载中">
      <Skeleton width={32} height={32} circle />
      <div className="message-skeleton-content">
        <Skeleton className="message-skeleton-line" height={16} />
        <Skeleton className="message-skeleton-line" height={16} width="90%" />
        <Skeleton className="message-skeleton-line" height={16} width="60%" />
      </div>
    </div>
  );
}

// 内联样式（为了保持组件独立性）
const styles = `
.skeleton {
  display: inline-block;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-circle {
  border-radius: 50%;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.card-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
}

.card-skeleton-title {
  width: 60%;
  margin-top: var(--spacing-2);
}

.card-skeleton-text {
  margin-top: var(--spacing-2);
}

.message-skeleton {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
}

.message-skeleton-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  flex: 1;
}

.message-skeleton-line {
  width: 100%;
}
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  if (!document.head.querySelector('style[data-skeleton]')) {
    styleElement.setAttribute('data-skeleton', 'true');
    document.head.appendChild(styleElement);
  }
}
