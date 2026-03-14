import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelect: (image: string) => void;
  currentImage?: string | null;
}

export function ImageUploader({ onImageSelect, currentImage }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageSelect(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        style={{
          width: '100%',
          padding: '1rem',
          border: '2px dashed #d1d5db',
          borderRadius: '0.5rem',
          backgroundColor: '#f9fafb',
          cursor: 'pointer',
          transition: 'border-color 0.2s, background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#60a5fa';
          e.currentTarget.style.backgroundColor = '#eff6ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.backgroundColor = '#f9fafb';
        }}
      >
        {currentImage ? '📷 更换图片' : '📷 上传图片'}
      </button>
    </div>
  );
}
