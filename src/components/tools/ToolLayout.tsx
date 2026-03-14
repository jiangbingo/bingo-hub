import React from 'react';

interface ToolLayoutProps {
  title: string;
  children: React.ReactNode;
  onBack: () => void;
}

export function ToolLayout({ title, children, onBack }: ToolLayoutProps) {
  return (
    <div style={{ padding: '2rem 0' }}>
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          marginBottom: '1.5rem',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          fontSize: '1rem',
          color: '#4b5563',
        }}
      >
        ← 返回
      </button>

      {/* 标题 */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        {title}
      </h2>

      {/* 内容 */}
      {children}
    </div>
  );
}
