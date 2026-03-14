import React, { useState } from 'react';
import { ToolLayout } from '../ToolLayout';
import { ImageUploader } from '../ImageUploader';
import { ImagePreview } from '../ImagePreview';
import { useImageTool } from '../../../hooks/useImageTool';
import { bigmodelService } from '../../../services/bigmodelService';

interface IdPhotoToolProps {
  onBack: () => void;
}

const ID_PHOTO_COLORS = [
  { name: '白色', value: 'white' },
  { name: '蓝色', value: '#3b82f6' },
  { name: '红色', value: '#ef4444' },
];

export function IdPhotoTool({ onBack }: IdPhotoToolProps) {
  const { image, processed, loading, setProcessed, setLoading, handleImageUpload, downloadResult } = useImageTool();
  const [idColor, setIdColor] = useState('white');

  const handleIdPhoto = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const result = await bigmodelService.idPhoto(image, idColor);
      setProcessed(result);
    } catch (error) {
      console.error('证件照生成失败:', error);
      alert('证件照生成失败，请检查 API Key 配置');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout title="证件照生成" onBack={onBack}>
      {/* 上传图片 */}
      <ImageUploader onImageSelect={(img) => {
        const event = { target: { files: [null] } } as any;
        const file = new File([img], 'image.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        event.target.files = dataTransfer.files;
        handleImageUpload(event);
      }} currentImage={image} />

      {/* 背景颜色选择 */}
      {image && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            背景颜色
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {ID_PHOTO_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setIdColor(color.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: idColor === color.value ? '2px solid #3b82f6' : '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  backgroundColor: color.value === 'white' ? '#ffffff' : color.value,
                  color: color.value === 'white' ? '#000' : '#fff',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                {color.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 开始处理 */}
      {image && !processed && (
        <button
          onClick={handleIdPhoto}
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
          {loading ? '⏳ 生成中...' : '🚀 生成证件照'}
        </button>
      )}

      {/* 预览 */}
      <ImagePreview image={image} processed={processed} onDownload={downloadResult} />
    </ToolLayout>
  );
}
