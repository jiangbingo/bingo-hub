/**
 * ImageWorkspace - 图像生成工作区组件
 * 提供图像生成的完整界面
 */

import { useState, KeyboardEvent, useCallback } from 'react';
import { useImageStore } from '@/stores/imageStore';
import { generateImage, downloadImage, copyImageUrl } from '@/services/bigmodelService';
import ImagePreview from '@/components/ui/ImagePreview';
import { STYLE_OPTIONS, ASPECT_RATIO_OPTIONS, IMAGE_MODEL_OPTIONS } from '@/constants';
import styles from './ImageWorkspace.module.css';

export default function ImageWorkspace() {
  const [prompt, setPrompt] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; alt: string } | null>(null);

  const {
    generatedImages,
    selectedModel,
    selectedSize,
    selectedAspectRatio,
    selectedStyle,
    isGenerating,
    error,
    setSelectedModel,
    setSelectedAspectRatio,
    setSelectedStyle,
    addImage,
    removeImage,
    clearImages,
    setGenerating,
    setError,
  } = useImageStore();

  const showNotification = (message: string, duration: number = 3000) => {
    setNotification(message);
    setTimeout(() => setNotification(null), duration);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('请输入图像描述');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await generateImage({
        model: selectedModel,
        prompt,
        size: selectedSize,
        style: selectedStyle === 'none' ? undefined : selectedStyle,
      });

      if (response.data && response.data.length > 0) {
        const imageData = response.data[0];

        const newImage = {
          id: `img-${Date.now()}`,
          url: imageData.url,
          prompt,
          model: selectedModel,
          size: selectedSize,
          style: selectedStyle,
          timestamp: Date.now(),
        };

        addImage(newImage);
        showNotification('图像生成成功！');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '图像生成失败';
      setError(errorMessage);
      showNotification(`错误: ${errorMessage}`, 5000);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (url: string, id: string) => {
    try {
      await downloadImage(url, `bigmodel-${id}.png`);
      showNotification('下载已开始');
    } catch (err) {
      showNotification('下载失败，请稍后重试');
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await copyImageUrl(url);
      showNotification('链接已复制到剪贴板');
    } catch (err) {
      showNotification('复制失败，请稍后重试');
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const openPreview = useCallback((url: string, prompt: string) => {
    setPreviewImage({ url, alt: prompt });
  }, []);

  const closePreview = useCallback(() => {
    setPreviewImage(null);
  }, []);

  return (
    <div className={styles.imageWorkspace}>
      {/* 通知 */}
      {notification && (
        <div className={styles.notification} role="alert" aria-live="polite">
          {notification}
        </div>
      )}

      {/* 控制面板 */}
      <div className={styles.controlPanel}>
        {/* 提示词输入 */}
        <div className={styles.promptSection}>
          <label htmlFor="image-prompt" className={styles.sectionLabel}>
            图像描述
          </label>
          <textarea
            id="image-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="描述你想要生成的图像...&#10;例如：一只在森林里跳跃的鹿，阳光透过树叶洒下斑驳的光影"
            disabled={isGenerating}
            rows={4}
            className={styles.promptTextarea}
            aria-label="图像描述输入"
            aria-describedby="prompt-hint"
          />
          <p id="prompt-hint" className={styles.hintText}>
            按 Enter 生成，Shift+Enter 换行
          </p>
        </div>

        {/* 配置选项 */}
        <div className={styles.configGrid}>
          {/* 模型选择 */}
          <div className={styles.configItem}>
            <label htmlFor="model-select" className={styles.configLabel}>
              模型
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) =>
                setSelectedModel(e.target.value as typeof selectedModel)
              }
              disabled={isGenerating}
              className={styles.configSelect}
              aria-label="选择模型"
            >
              {IMAGE_MODEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 宽高比选择 */}
          <div className={styles.configItem}>
            <label className={styles.configLabel}>宽高比</label>
            <div className={styles.ratioButtons} role="radiogroup" aria-label="选择宽高比">
              {ASPECT_RATIO_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedAspectRatio(option.value)}
                  disabled={isGenerating}
                  className={`${styles.ratioButton} ${
                    selectedAspectRatio === option.value ? styles.ratioButtonActive : ''
                  }`}
                  aria-pressed={selectedAspectRatio === option.value}
                  aria-label={`${option.label} - ${option.dimensions}`}
                >
                  <span className={styles.ratioLabel}>{option.label}</span>
                  <span className={styles.ratioDimensions}>{option.dimensions}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 风格选择 */}
          <div className={styles.configItem}>
            <label htmlFor="style-select" className={styles.configLabel}>
              风格
            </label>
            <select
              id="style-select"
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value as ImageStyle)}
              disabled={isGenerating}
              className={styles.configSelect}
              aria-label="选择风格"
            >
              {STYLE_OPTIONS.map((style) => (
                <option key={style.value} value={style.value}>
                  {style.label} - {style.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className={styles.actionButtons}>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={styles.generateButton}
            aria-label={isGenerating ? '正在生成图像' : '生成图像'}
          >
            {isGenerating ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span>生成中...</span>
              </>
            ) : (
              <>
                <span className={styles.generateIcon} aria-hidden="true">✨</span>
                <span>生成图像</span>
              </>
            )}
          </button>

          {generatedImages.length > 0 && (
            <button
              onClick={clearImages}
              disabled={isGenerating}
              className={styles.clearButton}
              aria-label="清空所有图像"
            >
              清空画廊
            </button>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className={styles.errorMessage} role="alert" aria-live="assertive">
            <span className={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 图像画廊 */}
      <div className={styles.imageGallery}>
        {generatedImages.length === 0 ? (
          <div className={styles.galleryEmpty}>
            <div className={styles.emptyIcon}>🎨</div>
            <h2>开始创作</h2>
            <p>输入描述，选择风格，让 AI 为你生成独特的图像</p>
          </div>
        ) : (
          <div className={styles.galleryGrid}>
            {generatedImages.map((image) => (
              <div key={image.id} className={styles.imageCard}>
                <div className={styles.imageContainer}>
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className={styles.generatedImage}
                    loading="lazy"
                    onClick={() => openPreview(image.url, image.prompt)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openPreview(image.url, image.prompt);
                      }
                    }}
                  />
                  <div className={styles.imageOverlay}>
                    <div className={styles.overlayActions}>
                      <button
                        onClick={() => handleDownload(image.url, image.id)}
                        className={styles.overlayButton}
                        aria-label="下载图像"
                        title="下载"
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
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleCopyUrl(image.url)}
                        className={styles.overlayButton}
                        aria-label="复制链接"
                        title="复制链接"
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
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="overlay-button overlay-button-danger"
                        aria-label="删除图像"
                        title="删除"
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
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className={styles.imageInfo}>
                  <p className={styles.imagePrompt}>{image.prompt}</p>
                  <div className={styles.imageMeta}>
                    <span className={styles.metaItem}>
                      {image.model === 'cogview-3-plus' ? 'Plus' : 'Flash'}
                    </span>
                    <span className={styles.metaItem}>{image.size}</span>
                    {image.style !== 'none' && (
                      <span className={styles.metaItem}>
                        {
                          STYLE_OPTIONS.find((s) => s.value === image.style)
                            ?.label
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 图片预览 */}
      {previewImage && (
        <ImagePreview
          src={previewImage.url}
          alt={previewImage.alt}
          isOpen={!!previewImage}
          onClose={closePreview}
        />
      )}
    </div>
  );
}
