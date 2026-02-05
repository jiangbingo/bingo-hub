/**
 * Loading - 加载状态组件
 * 提供多种加载状态的展示方式
 */

import { clsx } from 'clsx';

interface LoadingProps {
  /**
   * 加载状态的大小
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * 加载文本
   */
  text?: string;

  /**
   * 额外的类名
   */
  className?: string;
}

/**
 * Spinner - 旋转加载指示器
 */
export function Spinner({ size = 'md', className }: Omit<LoadingProps, 'text'>) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      className={clsx('spinner', sizeClasses[size], className)}
      role="status"
      aria-label="加载中"
    >
      <span className="sr-only">加载中...</span>
    </div>
  );
}

/**
 * Loading - 完整加载组件
 */
export default function Loading({ size = 'md', text, className }: LoadingProps) {
  return (
    <div className={clsx('loading', className)} role="status" aria-live="polite">
      <Spinner size={size} />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

/**
 * DotsLoader - 点状加载器
 */
export function DotsLoader({ text }: { text?: string }) {
  return (
    <div className="dots-loader" role="status" aria-label="加载中">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
      {text && <span className="dots-text">{text}</span>}
    </div>
  );
}

/**
 * BarLoader - 进度条加载器
 */
export function BarLoader({ progress = undefined }: { progress?: number }) {
  const isIndeterminate = progress === undefined;

  return (
    <div className="bar-loader-container" role="progressbar" aria-valuenow={progress}>
      <div
        className={clsx('bar-loader-fill', isIndeterminate && 'bar-animate')}
        style={isIndeterminate ? undefined : { width: `${progress}%` }}
      />
    </div>
  );
}

/**
 * FullPageLoader - 全屏加载器
 */
export function FullPageLoader({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="fullpage-loader" role="status" aria-live="polite">
      <Spinner size="lg" />
      <p className="fullpage-text">{text}</p>
    </div>
  );
}

/**
 * InlineLoader - 内联加载器（用于按钮等）
 */
export function InlineLoader() {
  return (
    <span className="inline-loader" role="status" aria-label="处理中">
      <Spinner size="sm" />
    </span>
  );
}

// 内联样式
const styles =`
.spinner {
  display: inline-block;
  border-color: var(--bg-tertiary);
  border-top-color: var(--primary-600);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-6);
}

.loading-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.dots-loader {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--primary-600);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.dots-text {
  margin-left: var(--spacing-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.bar-loader-container {
  width: 100%;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.bar-loader-fill {
  height: 100%;
  background: var(--primary-600);
  border-radius: var(--radius-full);
  transition: width var(--transition-base);
}

.bar-animate {
  animation: indeterminate 1.5s infinite ease-in-out;
}

@keyframes indeterminate {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.fullpage-loader {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  z-index: var(--z-modal);
}

.fullpage-text {
  margin-top: var(--spacing-4);
  font-size: var(--text-lg);
  color: var(--text-secondary);
}

.inline-loader {
  display: inline-flex;
  align-items: center;
}
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  if (!document.head.querySelector('style[data-loading]')) {
    styleElement.setAttribute('data-loading', 'true');
    document.head.appendChild(styleElement);
  }
}
