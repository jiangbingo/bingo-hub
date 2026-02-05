/**
 * Sidebar - 侧边栏导航组件
 * 响应式导航菜单
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const menuItems: NavItem[] = [
  { path: '/dashboard', icon: '🏠', label: '仪表盘' },
  { path: '/chat', icon: '💬', label: '文本对话' },
  { path: '/image', icon: '🎨', label: '图像生成' },
  { path: '/video', icon: '🎬', label: '视频生成' },
  { path: '/history', icon: '📋', label: '历史记录' },
];

export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* 移动端遮罩层 */}
      <div
        className={`${styles.sidebarOverlay} ${!isCollapsed ? styles.sidebarOverlayOpen : ''}`}
        onClick={() => setIsCollapsed(true)}
        aria-hidden="true"
      />

      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}
        role="navigation"
        aria-label="主导航"
      >
        {/* 收起/展开按钮 */}
        <button
          className={styles.sidebarToggle}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
          aria-expanded={!isCollapsed}
        >
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
          >
            <path d={isCollapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} />
          </svg>
        </button>

        {/* 导航菜单 */}
        <nav className={styles.sidebarNav} aria-label="页面导航">
          <ul className={styles.navList} role="list">
            {menuItems.map((item) => (
              <li key={item.path} role="listitem">
                <Link
                  to={item.path}
                  className={`${styles.navItem} ${isActive(item.path) ? styles.navItemActive : ''}`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                  {isActive(item.path) && (
                    <span className={styles.navIndicator} aria-hidden="true" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 底部信息 */}
        <div className={styles.sidebarFooter}>
          <p className={styles.footerText}>BingoHub</p>
          <p className={styles.footerVersion}>v1.0.0</p>
        </div>
      </aside>
    </>
  );
}
