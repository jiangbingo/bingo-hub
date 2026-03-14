import React, { useState } from 'react';
import { ToolLayout } from '../ToolLayout';
import { ImageUploader } from '../ImageUploader';
import { ImagePreview } from '../ImagePreview';
import { useImageTool } from '../../../hooks/useImageTool';

interface ConvertToolProps {
  onBack: () => void;
}

const IMAGE_FORMATS = [
  { name: 'JPEG', value: 'image/jpeg' },
  { name: 'PNG', value: 'image/png' },
  { name: 'WebP', value: 'image/webp' },
];

export function ConvertTool({ onBack }: ConvertToolProps) {
  const { image, processed, loading, setProcessed, setLoading, handleImageUpload, downloadResult } = useImageTool();
  const [targetFormat, setTargetFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(0.92);

  const handleConvert = async () => {
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

        const result = canvas.toDataURL(targetFormat, quality);
        setProcessed(result);
        setLoading(false);
      };

      img.src = image;
    } catch (error) {
      console.error('格式转换失败:', error);
      alert('图片格式转换失败');
      setLoading(false);
    }
  };

  const getFormatExtension = () => {
    switch (targetFormat) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      default:
        return 'jpg';
    }
  };

  return (
    <ToolLayout title="格式转换" onBack={onBack}>
      {/* 上传图片 */}
      <ImageUploader onImageSelect={(img) => {
        const event = { target: { files: [null] } } as any;
        const file = new File([img], 'image.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        event.target.files = dataTransfer.files;
        handleImageUpload(event);
      }} currentImage={image} />

      {/* 格式选择 */}
      {image && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            目标格式
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {IMAGE_FORMATS.map((format) => (
              <button
                key={format.value}
                onClick={() => setTargetFormat(format.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: targetFormat === format.value ? '2px solid #3b82f6' : '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  backgroundColor: targetFormat === format.value ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                {format.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 质量设置 */}
      {image && targetFormat !== 'image/png' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            图片质量: {Math.round(quality * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6b7280' }}>
            <span>低质量</span>
            <span>高质量</span>
          </div>
        </div>
      )}

      {/* 开始处理 */}
      {image && !processed && (
        <button
          onClick={handleConvert}
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
          {loading ? '⏳ 转换中...' : '🚀 开始转换'}
        </button>
      )}

      {/* 预览 */}
      <ImagePreview image={image} processed={processed} onDownload={downloadResult} />
    </ToolLayout>
  );
}
