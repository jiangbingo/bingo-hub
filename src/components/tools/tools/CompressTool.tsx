import React, { useState } from 'react';
import { ToolLayout } from '../ToolLayout';
import { ImageUploader } from '../ImageUploader';
import { ImagePreview } from '../ImagePreview';
import { useImageTool } from '../../../hooks/useImageTool';

interface CompressToolProps {
  onBack: () => void;
}

export function CompressTool({ onBack }: CompressToolProps) {
  const { image, processed, loading, setProcessed, setLoading, handleImageUpload, downloadResult } = useImageTool();
  const [targetKb, setTargetKb] = useState(100);

  const handleCompress = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        // 逐步降低质量直到达到目标大小
        let quality = 0.92;
        let result = canvas.toDataURL('image/jpeg', quality);

        const targetBytes = targetKb * 1024;
        while (result.length > targetBytes * 1.37 && quality > 0.1) {
          quality -= 0.05;
          result = canvas.toDataURL('image/jpeg', quality);
        }

        setProcessed(result);
        setLoading(false);
      };

      img.src = image;
    } catch (error) {
      console.error('压缩失败:', error);
      alert('图片压缩失败');
      setLoading(false);
    }
  };

  return (
    <ToolLayout title="图片压缩" onBack={onBack}>
      {/* 上传图片 */}
      <ImageUploader onImageSelect={(img) => {
        const event = { target: { files: [null] } } as any;
        const file = new File([img], 'image.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        event.target.files = dataTransfer.files;
        handleImageUpload(event);
      }} currentImage={image} />

      {/* 参数设置 */}
      {image && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            目标大小: {targetKb} KB
          </label>
          <input
            type="range"
            min="10"
            max="500"
            value={targetKb}
            onChange={(e) => setTargetKb(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6b7280' }}>
            <span>10 KB</span>
            <span>500 KB</span>
          </div>
        </div>
      )}

      {/* 开始处理 */}
      {image && !processed && (
        <button
          onClick={handleCompress}
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
          {loading ? '⏳ 处理中...' : '🚀 开始压缩'}
        </button>
      )}

      {/* 预览 */}
      <ImagePreview image={image} processed={processed} onDownload={downloadResult} />
    </ToolLayout>
  );
}
