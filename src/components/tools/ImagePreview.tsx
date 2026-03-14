import React from 'react';

interface ImagePreviewProps {
  image: string | null;
  processed: string | null;
  onDownload?: () => void;
}

export function ImagePreview({ image, processed, onDownload }: ImagePreviewProps) {
  if (!image && !processed) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
      {/* 原图 */}
      <div>
        <h4 style={{ marginBottom: '0.5rem', fontWeight: '500' }}>原图</h4>
        <img
          src={image || ''}
          alt="原图"
          style={{
            width: '100%',
            borderRadius: '0.5rem',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        />
      </div>

      {/* 处理后 */}
      {processed && (
        <div>
          <h4 style={{ marginBottom: '0.5rem', fontWeight: '500' }}>处理结果</h4>
          <img
            src={processed}
            alt="处理结果"
            style={{
              width: '100%',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          />
          {onDownload && (
            <button
              onClick={onDownload}
              style={{
                width: '100%',
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              ⬇️ 下载结果
            </button>
          )}
        </div>
      )}
    </div>
  );
}
