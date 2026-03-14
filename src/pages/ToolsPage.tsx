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

  // 主页
  if (activeTool === 'home') {
    return (
      <div style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          AI 图片处理工具
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          专业的 AI 图片处理工具集
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}>
          {TOOLS.map((tool) => (
            <ToolCard
              key={tool.id}
              id={tool.id}
              name={tool.name}
              description={tool.description}
              icon={tool.icon}
              onClick={() => setActiveTool(tool.id as ToolType)}
            />
          ))}
        </div>
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
