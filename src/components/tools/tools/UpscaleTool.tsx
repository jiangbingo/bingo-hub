import React from 'react';
import { ToolLayout } from '../ToolLayout';
import { ImageUploader } from '../ImageUploader';
import { ImagePreview } from '../ImagePreview';
import { useImageTool } from '../../../hooks/useImageTool';
import { bigmodelService } from '../../../services/bigmodelService';

interface UpscaleToolProps {
  onBack: () => void;
}

export function UpscaleTool({ onBack }: UpscaleToolProps) {
  const { image, processed, loading, setProcessed, setLoading, handleImageUpload, downloadResult } = useImageTool();

  const handleUpscale = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const result = await bigmodelService.upscale(image);
      setProcessed(result);
    } catch (error) {
      console.error('图片放大失败:', error);
      alert('图片放大失败，请检查 API Key 配置');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout title="图片放大" onBack={onBack}>
      {/* 上传图片 */}
      <ImageUploader onImageSelect={(img) => {
        const event = { target: { files: [null] } } as any;
        const file = new File([img], 'image.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        event.target.files = dataTransfer.files;
        handleImageUpload(event);
      }} currentImage={image} />

      {/* 说明 */}
      {image && !processed && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#eff6ff',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: '#1e40af',
        }}>
          ℹ️ AI 将自动放大图片 2-4 倍，同时保持清晰度
        </div>
      )}

      {/* 开始处理 */}
      {image && !processed && (
        <button
          onClick={handleUpscale}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? '⏳ 处理中...' : '🚀 开始放大'}
        </button>
      )}

      {/* 预览 */}
      <ImagePreview image={image} processed={processed} onDownload={downloadResult} />
    </ToolLayout>
  );
}
