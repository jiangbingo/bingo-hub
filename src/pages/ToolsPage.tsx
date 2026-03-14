import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// 图片处理工具类型
type ToolType = 'home' | 'compress' | 'id-photo' | 'upscale' | 'convert';

// 工具配置
const TOOLS = [
  { id: 'compress', name: '图片压缩', description: '压缩图片到指定大小', icon: '📦' },
  { id: 'id-photo', name: '证件照', description: '生成标准证件照', icon: '📷' },
  { id: 'upscale', name: '图片放大', description: 'AI 放大图片', icon: '🔍' },
  { id: 'convert', name: '格式转换', description: '转换图片格式', icon: '🔄' },
];

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolType>('home');
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    // TODO: 实现图片处理逻辑
    alert('图片处理功能开发中...');
  };

  return (
    <div className="tools-page">
      <header className="tools-header">
        <h1>🛠️ AI 图片处理工具</h1>
        <p>专业的 AI 图片处理工具集</p>
      </header>

      {activeTool === 'home' ? (
        <div className="tools-grid">
          {TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="tool-card"
              onClick={() => setActiveTool(tool.id as ToolType)}
            >
              <span className="tool-icon">{tool.icon}</span>
              <h3>{tool.name}</h3>
              <p>{tool.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="tool-workspace">
          <div className="tool-header">
            <button onClick={() => setActiveTool('home')} className="back-button">
              ← 返回
            </button>
            <h2>{TOOLS.find(t => t.id === activeTool)?.name}</h2>
          </div>

          <div className="upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload" className="upload-button">
              {image ? '更换图片' : '上传图片'}
            </label>
          </div>

          {image && (
            <div className="preview-section">
              <img src={image} alt="Preview" className="image-preview" />
              <button onClick={handleProcess} className="process-button">
                开始处理
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .tools-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .tools-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .tools-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .tool-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .tool-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .tool-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
        }

        .tool-card h3 {
          margin-bottom: 0.5rem;
        }

        .tool-card p {
          color: #666;
        }

        .tool-workspace {
          background: white;
          border-radius: 12px;
          padding: 2rem;
        }

        .tool-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .back-button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          color: #666;
        }

        .back-button:hover {
          color: #333;
        }

        .upload-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .upload-button {
          display: inline-block;
          padding: 1rem 2rem;
          background: #667eea;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .upload-button:hover {
          background: #5568d3;
        }

        .preview-section {
          text-align: center;
        }

        .image-preview {
          max-width: 100%;
          max-height: 400px;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .process-button {
          padding: 1rem 2rem;
          background: #48bb78;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.1rem;
          transition: background 0.3s;
        }

        .process-button:hover {
          background: #38a169;
        }
      `}</style>
    </div>
  );
}
