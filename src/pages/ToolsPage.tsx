import React, { useState } from 'react';
import { ToolCard } from '../components/tools/ToolCard';
import { CompressTool } from '../components/tools/tools/CompressTool';
import { IdPhotoTool } from '../components/tools/tools/IdPhotoTool';
import { UpscaleTool } from '../components/tools/tools/UpscaleTool';
import { ConvertTool } from '../components/tools/tools/ConvertTool';

type ToolType = 'home' | 'compress' | 'id-photo' | 'upscale' | 'convert';

const TOOLS = [
  { id: 'compress', name: '图片压缩', description: '压缩图片到指定大小', icon: '📦' },
  { id: 'id-photo', name: '证件照', description: '生成标准证件照', icon: '📷' },
  { id: 'upscale', name: '图片放大', description: 'AI 放大图片', icon: '🔍' },
  { id: 'convert', name: '格式转换', description: '转换图片格式', icon: '🔄' },
];

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolType>('home');

  // 主页 - 使用与 Dashboard 一致的深色设计
  if (activeTool === 'home') {
    return (
      <div style={{
        padding: '2rem 0',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
      }}>
        {/* 头部 */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #60a5fa, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            AI 图片处理工具
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '1.1rem',
          }}>
            专业的 AI 图片处理工具集 - 探索智谱 AI 的强大能力
          </p>
        </div>

        {/* 工具卡片网格 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
        }}>
          {TOOLS.map((tool, index) => (
            <div
              key={tool.id}
              onClick={() => setActiveTool(tool.id as ToolType)}
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '1rem',
                padding: '2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                animation: `fadeInUp 0.5s ease-out ${index * 100}ms both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.4)';
                e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
              }}
            >
              {/* 图标 */}
              <div style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '1rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                fontSize: '2rem',
              }}>
                {tool.icon}
              </div>

              {/* 标题和描述 */}
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#f1f5f9',
                marginBottom: '0.5rem',
              }}>
                {tool.name}
              </h3>
              <p style={{
                color: '#94a3b8',
                fontSize: '0.95rem',
                lineHeight: '1.5',
              }}>
                {tool.description}
              </p>

              {/* 箭头 */}
              <div style={{
                marginTop: '1rem',
                color: '#60a5fa',
                fontSize: '1.25rem',
              }}>
                →
              </div>
            </div>
          ))}
        </div>

        {/* 添加动画样式 */}
        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  // 工具页面
  switch (activeTool) {
    case 'compress':
      return <CompressTool onBack={() => setActiveTool('home')} />;
    case 'id-photo':
      return <IdPhotoTool onBack={() => setActiveTool('home')} />;
    case 'upscale':
      return <UpscaleTool onBack={() => setActiveTool('home')} />;
    case 'convert':
      return <ConvertTool onBack={() => setActiveTool('home')} />;
    default:
      return null;
  }
}
