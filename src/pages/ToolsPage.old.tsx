import React, { useState } from 'react';
import { bigmodelService } from '../services/bigmodelService';

// 图片处理工具类型
type ToolType = 'home' | 'compress' | 'id-photo' | 'upscale' | 'convert';

// 工具配置
const TOOLS = [
  { id: 'compress', name: '图片压缩', description: '压缩图片到指定大小', icon: '📦' },
  { id: 'id-photo', name: '证件照', description: '生成标准证件照', icon: '📷' },
  { id: 'upscale', name: '图片放大', description: 'AI 放大图片', icon: '🔍' },
  { id: 'convert', name: '格式转换', description: '转换图片格式', icon: '🔄' },
];

// 证件照背景颜色
const ID_PHOTO_COLORS = [
  { name: '白色', value: 'white' },
  { name: '蓝色', value: '#3b82f6' },
  { name: '红色', value: '#ef4444' },
];

// 图片格式
const IMAGE_FORMATS = [
  { name: 'JPEG', value: 'image/jpeg' },
  { name: 'PNG', value: 'image/png' },
  { name: 'WebP', value: 'image/webp' },
];

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolType>('home');
  const [image, setImage] = useState<string | null>(null);
  const [processed, setProcessed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 图片压缩参数
  const [targetKb, setTargetKb] = useState(100);
  
  // 证件照参数
  const [idColor, setIdColor] = useState('white');
  
  // 格式转换参数
  const [targetFormat, setTargetFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(0.92);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setProcessed(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // 图片压缩
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

  // 证件照生成
  const handleIdPhoto = async () => {
    if (!image) return;
    
    setLoading(true);
    try {
      const result = await bigmodelService.idPhoto(image, idColor);
      setProcessed(result);
    } catch (error) {
      console.error('证件照生成失败:', error);
      alert('证件照生成失败，请检查 API 配置');
    } finally {
      setLoading(false);
    }
  };

  // 图片放大
  const handleUpscale = async () => {
    if (!image) return;
    
    setLoading(true);
    try {
      const result = await bigmodelService.upscale(image);
      setProcessed(result);
    } catch (error) {
      console.error('图片放大失败:', error);
      alert('图片放大失败，请检查 API 配置');
    } finally {
      setLoading(false);
    }
  };

  // 格式转换
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
      alert('格式转换失败');
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    switch (activeTool) {
      case 'compress':
        await handleCompress();
        break;
      case 'id-photo':
        await handleIdPhoto();
        break;
      case 'upscale':
        await handleUpscale();
        break;
      case 'convert':
        await handleConvert();
        break;
    }
  };

  const handleDownload = () => {
    if (!processed) return;
    
    const link = document.createElement('a');
    link.href = processed;
    link.download = `processed-${Date.now()}.jpg`;
    link.click();
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
            <>
              {/* 工具参数 */}
              {activeTool === 'compress' && (
                <div className="params-section">
                  <label>
                    目标大小: {targetKb} KB
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      value={targetKb}
                      onChange={(e) => setTargetKb(Number(e.target.value))}
                    />
                  </label>
                </div>
              )}

              {activeTool === 'id-photo' && (
                <div className="params-section">
                  <label>背景颜色:</label>
                  <div className="color-options">
                    {ID_PHOTO_COLORS.map((color) => (
                      <button
                        key={color.value}
                        className={`color-btn ${idColor === color.value ? 'active' : ''}`}
                        onClick={() => setIdColor(color.value)}
                      >
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTool === 'convert' && (
                <div className="params-section">
                  <label>
                    目标格式:
                    <select value={targetFormat} onChange={(e) => setTargetFormat(e.target.value)}>
                      {IMAGE_FORMATS.map((format) => (
                        <option key={format.value} value={format.value}>
                          {format.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    质量: {Math.round(quality * 100)}%
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.01"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                    />
                  </label>
                </div>
              )}

              {/* 预览 */}
              <div className="preview-section">
                <div className="preview-container">
                  <div className="preview-item">
                    <h4>原图</h4>
                    <img src={image} alt="Original" className="image-preview" />
                  </div>
                  {processed && (
                    <div className="preview-item">
                      <h4>处理结果</h4>
                      <img src={processed} alt="Processed" className="image-preview" />
                    </div>
                  )}
                </div>

                <div className="action-buttons">
                  <button
                    onClick={handleProcess}
                    className="process-button"
                    disabled={loading}
                  >
                    {loading ? '处理中...' : '开始处理'}
                  </button>
                  {processed && (
                    <button onClick={handleDownload} className="download-button">
                      下载结果
                    </button>
                  )}
                </div>
              </div>
            </>
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

        .params-section {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .params-section label {
          display: block;
          margin-bottom: 1rem;
        }

        .params-section input[type="range"] {
          width: 100%;
          margin-top: 0.5rem;
        }

        .params-section select {
          width: 100%;
          padding: 0.5rem;
          margin-top: 0.5rem;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }

        .color-options {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .color-btn {
          padding: 0.5rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
        }

        .color-btn.active {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .preview-section {
          text-align: center;
        }

        .preview-container {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .preview-item {
          flex: 1;
          max-width: 400px;
        }

        .preview-item h4 {
          margin-bottom: 1rem;
        }

        .image-preview {
          max-width: 100%;
          max-height: 400px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .process-button,
        .download-button {
          padding: 1rem 2rem;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.1rem;
          transition: all 0.3s;
        }

        .process-button {
          background: #48bb78;
        }

        .process-button:hover:not(:disabled) {
          background: #38a169;
        }

        .process-button:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
        }

        .download-button {
          background: #4299e1;
        }

        .download-button:hover {
          background: #3182ce;
        }
      `}</style>
    </div>
  );
}
