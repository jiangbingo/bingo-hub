/**
 * ChatPage - 文本对话页面
 * 与 BigModel 进行流式对话
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useAppStore } from '../stores/appStore';
import { chatCompletionStream } from '../services/bigmodelService';
import styles from './ChatPage.module.css';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { currentMessages, addMessage, clearMessages, selectedModel } = useAppStore();

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, streamContent]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setInput('');
    setIsGenerating(true);
    setStreamContent('');

    try {
      let fullResponse = '';

      await chatCompletionStream(
        [...currentMessages, userMessage].map(m => ({ role: m.role, content: m.content })),
        import.meta.env.VITE_BIGMODEL_API_KEY,
        selectedModel,
        (chunk) => {
          fullResponse += chunk;
          setStreamContent(fullResponse);
        }
      );

      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('生成失败:', error);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `错误: ${error instanceof Error ? error.message : '生成失败'}`,
        timestamp: Date.now(),
      });
    } finally {
      setIsGenerating(false);
      setStreamContent('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getMessageClass = (role: string) => {
    return role === 'user' ? styles.messageUser : styles.messageAssistant;
  };

  const getBubbleClass = (role: string, isStreaming?: boolean) => {
    const baseClass = role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant;
    return isStreaming ? `${baseClass} ${styles.messageBubbleStreaming}` : baseClass;
  };

  return (
    <div className={styles.chatPage}>
      {/* 页面标题 */}
      <div className={styles.chatHeader}>
        <h1 className={styles.chatTitle}>💬 文本对话</h1>
        <p className={styles.chatSubtitle}>与 GLM-4 模型进行智能对话</p>
      </div>

      {/* 消息列表 */}
      <div
        className={styles.chatMessages}
        role="log"
        aria-live="polite"
        aria-atomic="false"
      >
        {currentMessages.length === 0 ? (
          <div className={styles.chatEmpty}>
            <div className={styles.emptyIcon}>💬</div>
            <h2>开始对话</h2>
            <p>输入你的问题，与 AI 开始交流</p>
          </div>
        ) : (
          <div className={styles.messagesList}>
            {currentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.message} ${getMessageClass(msg.role)}`}
              >
                <div className={getBubbleClass(msg.role)}>
                  <p className={styles.messageContent}>{msg.content}</p>
                </div>
                <span className={styles.messageTime} aria-label="消息时间">
                  {new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
            {streamContent && (
              <div className={`${styles.message} ${styles.messageAssistant} ${styles.messageStreaming}`}>
                <div className={getBubbleClass('assistant', true)}>
                  <p className={styles.messageContent}>
                    {streamContent}
                    <span className="cursor-blink" aria-hidden="true" />
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className={styles.chatInputArea}>
        <textarea
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="输入你的问题... (Enter 发送, Shift+Enter 换行)"
          disabled={isGenerating}
          rows={3}
          className={styles.chatTextarea}
          aria-label="消息输入"
          aria-describedby="input-hint"
        />
        <p id="input-hint" className="sr-only">
          按 Enter 发送消息，按 Shift+Enter 换行
        </p>
        <button
          onClick={handleSend}
          disabled={!input.trim() || isGenerating}
          className={styles.chatSendButton}
          aria-label={isGenerating ? '正在生成' : '发送消息'}
        >
          {isGenerating ? (
            <>
              <span className={styles.loadingSpinner} aria-hidden="true" />
              <span>生成中...</span>
            </>
          ) : (
            <>
              <span className={styles.sendIcon} aria-hidden="true">→</span>
              <span>发送</span>
            </>
          )}
        </button>
      </div>

      {/* 操作按钮 */}
      <div className={styles.chatActions}>
        <button
          onClick={clearMessages}
          className={styles.clearButton}
          aria-label="清空对话历史"
        >
          清空对话
        </button>
      </div>
    </div>
  );
}
