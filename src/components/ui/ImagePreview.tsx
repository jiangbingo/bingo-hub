/**
 * ImagePreview - 图片预览组件
 * 支持缩放、拖拽的图片预览模态框
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './ImagePreview.module.css';

interface ImagePreviewProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImagePreview({ src, alt, isOpen, onClose }: ImagePreviewProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 重置状态
  const reset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // 关闭时重置
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // ESC 键关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // 阻止背景滚动
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 缩放处理
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => {
      const newScale = Math.max(0.5, Math.min(5, prev + delta));
      return newScale;
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // 拖拽处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 双击重置
  const handleDoubleClick = useCallback(() => {
    reset();
  }, [reset]);

  // 缩放按钮
  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(5, prev + 0.25));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.5, prev - 0.25));
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className={styles.imagePreviewOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
    >
      <div
        ref={containerRef}
        className={styles.imagePreviewContainer}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={styles.imagePreviewImage}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
          draggable={false}
        />

        {/* 工具栏 */}
        <div className={styles.imagePreviewToolbar}>
          <button
            onClick={zoomOut}
            className={styles.toolbarButton}
            aria-label="缩小"
            disabled={scale <= 0.5}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" x2="14" y1="11" y2="11" />
            </svg>
          </button>

          <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>

          <button
            onClick={zoomIn}
            className={styles.toolbarButton}
            aria-label="放大"
            disabled={scale >= 5}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" x2="11" y1="8" y2="14" />
              <line x1="8" x2="14" y1="11" y2="11" />
            </svg>
          </button>

          <div className={styles.toolbarDivider} />

          <button
            onClick={reset}
            className={styles.toolbarButton}
            aria-label="重置"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>

          <div className={styles.toolbarDivider} />

          <button
            onClick={onClose}
            className={`${styles.toolbarButton} ${styles.toolbarButtonClose}`}
            aria-label="关闭"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 提示信息 */}
        <div className={styles.imagePreviewHint}>
          滚轮缩放 · 拖拽移动 · 双击重置 · ESC 关闭
        </div>
      </div>
    </div>
  );
}
