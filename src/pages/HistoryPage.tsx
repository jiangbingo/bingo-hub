/**
 * HistoryPage - 历史记录页面
 * 展示用户的所有对话会话和生成内容
 */

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore, SessionMode } from '../stores/appStore';
import styles from './HistoryPage.module.css';

type FilterType = 'all' | 'chat' | 'image' | 'video' | 'code';

interface FilterTab {
  value: FilterType;
  label: string;
  icon: string;
}

const FILTER_TABS: FilterTab[] = [
  { value: 'all', label: '全部', icon: '📋' },
  { value: 'chat', label: '对话', icon: '💬' },
  { value: 'image', label: '图像', icon: '🎨' },
  { value: 'video', label: '视频', icon: '🎬' },
  { value: 'code', label: '代码', icon: '💻' },
];

const MODE_ICONS: Record<SessionMode, string> = {
  chat: '💬',
  image: '🎨',
  video: '🎬',
  code: '💻',
};

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes} 分钟前`;
  } else if (hours < 24) {
    return `${hours} 小时前`;
  } else if (days < 7) {
    return `${days} 天前`;
  } else {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
}

function getMessagePreview(messages: Array<{ content: string }>, maxLength = 50): string {
  if (messages.length === 0) {
    return '暂无消息';
  }

  const firstMessage = messages[0].content;
  if (firstMessage.length <= maxLength) {
    return firstMessage;
  }

  return firstMessage.substring(0, maxLength) + '...';
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { sessions, generatedAssets, deleteSession, deleteGeneratedAsset } = useAppStore();

  // 过滤后的会话列表
  const filteredSessions = useMemo(() => {
    if (activeFilter === 'all') {
      return sessions;
    }
    return sessions.filter((session) => session.mode === activeFilter);
  }, [sessions, activeFilter]);

  // 过滤后的生成内容列表
  const filteredAssets = useMemo(() => {
    if (activeFilter === 'all' || activeFilter === 'chat') {
      return [];
    }
    return generatedAssets.filter((asset) => asset.type === activeFilter);
  }, [generatedAssets, activeFilter]);

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    setShowDeleteConfirm(null);
  };

  const handleDeleteAsset = (assetId: string) => {
    deleteGeneratedAsset(assetId);
    setShowDeleteConfirm(null);
  };

  const isEmpty = filteredSessions.length === 0 && filteredAssets.length === 0;

  return (
    <div className={styles.historyPage}>
      <div className={styles.historyContainer}>
        {/* 页面头部 */}
        <header className={styles.historyHeader}>
          <div className={styles.headerContent}>
            <Link to="/dashboard" className={styles.backLink} aria-label="返回仪表盘">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>返回</span>
            </Link>

            <h1 className={styles.pageTitle}>历史记录</h1>

            <div className={styles.headerStats}>
              <span className={styles.statItem}>
                {sessions.length} 个会话
              </span>
              <span className={styles.statDivider}>•</span>
              <span className={styles.statItem}>
                {generatedAssets.length} 个生成内容
              </span>
            </div>
          </div>
        </header>

        {/* 筛选标签 */}
        <div className={styles.filterTabs} role="tablist" aria-label="历史记录筛选">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={activeFilter === tab.value}
              aria-controls="history-content"
              className={`${styles.filterTab} ${activeFilter === tab.value ? styles.filterTabActive : ''}`}
              onClick={() => setActiveFilter(tab.value)}
            >
              <span className={styles.tabIcon} aria-hidden="true">{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
              {tab.value === 'all' && (
                <span className={styles.tabBadge}>{sessions.length + generatedAssets.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div id="history-content" className={styles.historyContent} role="tabpanel">
          {isEmpty ? (
            // 空状态
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <h2 className={styles.emptyTitle}>暂无历史记录</h2>
              <p className={styles.emptyDescription}>
                {activeFilter === 'all'
                  ? '开始使用 AI 助手创建您的第一个对话或生成内容'
                  : `暂无${FILTER_TABS.find((t) => t.value === activeFilter)?.label}类型的历史记录`}
              </p>
              <Link to="/dashboard" className={`${styles.btn} ${styles.btnPrimary}`}>
                开始使用
              </Link>
            </div>
          ) : (
            <>
              {/* 会话列表 */}
              {filteredSessions.length > 0 && (
                <section className={styles.sessionsSection}>
                  <h2 className={styles.sectionTitle}>对话会话</h2>
                  <div className={styles.sessionsList}>
                    {filteredSessions.map((session) => (
                      <div key={session.id} className={styles.sessionCard}>
                        <div className={styles.sessionHeader}>
                          <span className={styles.sessionModeIcon} aria-hidden="true">
                            {MODE_ICONS[session.mode]}
                          </span>
                          <h3 className={styles.sessionTitle}>{session.title}</h3>
                          <span className={styles.sessionTime} aria-label="创建时间">
                            {formatTimestamp(session.createdAt)}
                          </span>
                        </div>

                        <p className={styles.sessionPreview}>
                          {getMessagePreview(session.messages)}
                        </p>

                        <div className={styles.sessionMeta}>
                          <span className={styles.messageCount}>
                            {session.messages.length} 条消息
                          </span>
                        </div>

                        <div className={styles.sessionActions}>
                          <Link
                            to={`/chat?session=${session.id}`}
                            className={styles.btnView}
                            aria-label={`查看会话：${session.title}`}
                          >
                            查看详情
                          </Link>
                          <button
                            className={styles.btnDelete}
                            onClick={() => setShowDeleteConfirm(session.id)}
                            aria-label={`删除会话：${session.title}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>

                        {/* 删除确认 */}
                        {showDeleteConfirm === session.id && (
                          <div className={styles.deleteConfirm} role="alertdialog" aria-labelledby={`delete-title-${session.id}`}>
                            <p id={`delete-title-${session.id}`} className={styles.confirmText}>
                              确定要删除这个会话吗？
                            </p>
                            <div className={styles.confirmActions}>
                              <button
                                className={`${styles.btn} ${styles.btnSecondary}`}
                                onClick={() => setShowDeleteConfirm(null)}
                              >
                                取消
                              </button>
                              <button
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                style={{ backgroundColor: 'var(--error-600)' }}
                                onClick={() => handleDeleteSession(session.id)}
                              >
                                删除
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 生成内容网格 */}
              {filteredAssets.length > 0 && (
                <section className={styles.assetsSection}>
                  <h2 className={styles.sectionTitle}>
                    生成内容 ({filteredAssets.length})
                  </h2>
                  <div className={styles.assetsGrid}>
                    {filteredAssets.map((asset) => (
                      <div key={asset.id} className={styles.assetCard}>
                        <div className={styles.assetThumbnail}>
                          {asset.thumbnail ? (
                            <img
                              src={asset.thumbnail}
                              alt={asset.title}
                              className={styles.thumbnailImage}
                            />
                          ) : (
                            <div className={styles.thumbnailPlaceholder}>
                              <span className={styles.placeholderIcon} aria-hidden="true">
                                {asset.type === 'image' && '🎨'}
                                {asset.type === 'video' && '🎬'}
                                {asset.type === 'code' && '💻'}
                                {asset.type === 'document' && '📄'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className={styles.assetInfo}>
                          <h3 className={styles.assetTitle}>{asset.title}</h3>
                          <span className={styles.assetTime} aria-label="创建时间">
                            {formatTimestamp(asset.createdAt)}
                          </span>
                        </div>

                        <div className={styles.assetActions}>
                          <button
                            className={styles.btnDelete}
                            onClick={() => setShowDeleteConfirm(asset.id)}
                            aria-label={`删除内容：${asset.title}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>

                        {/* 删除确认 */}
                        {showDeleteConfirm === asset.id && (
                          <div className={styles.deleteConfirm} role="alertdialog">
                            <p className={styles.confirmText}>确定要删除这个内容吗？</p>
                            <div className={styles.confirmActions}>
                              <button
                                className={`${styles.btn} ${styles.btnSecondary}`}
                                onClick={() => setShowDeleteConfirm(null)}
                              >
                                取消
                              </button>
                              <button
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                style={{ backgroundColor: 'var(--error-600)' }}
                                onClick={() => handleDeleteAsset(asset.id)}
                              >
                                删除
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
