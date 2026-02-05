/**
 * Header - 页面头部组件
 * 包含 Logo、导航和主题切换
 */

import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';
import styles from './Header.module.css';

// BingoHub Logo SVG 图标
const BingoHubIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={styles.logoIcon}
  >
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#logo-gradient)" opacity="0.2"/>
    <circle cx="16" cy="16" r="10" fill="url(#logo-gradient)" opacity="0.4"/>
    <circle cx="16" cy="16" r="6" fill="url(#logo-gradient)"/>
    <path
      d="M16 8 L16 12 M16 20 L16 24 M8 16 L12 16 M20 16 L24 16"
      stroke="url(#logo-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="16" cy="16" r="3" fill="#fff"/>
  </svg>
);

interface HeaderProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export default function Header({ isSidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <header
      className={styles.header}
      role="banner"
    >
      <div className={styles.headerLeft}>
        {/* 侧边栏展开按钮 - 仅在侧边栏收起时显示 */}
        {isSidebarCollapsed && onToggleSidebar && (
          <button
            className={styles.menuButton}
            onClick={onToggleSidebar}
            aria-label="展开侧边栏"
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
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        <Link to="/dashboard" className={styles.logo} aria-label="BingoHub 首页">
          <BingoHubIcon />
          <span className={styles.logoText}>BingoHub</span>
        </Link>
      </div>

      <div className={styles.headerCenter}>
        {!isDashboard && (
          <Link
            to="/dashboard"
            className={styles.backLink}
            aria-label="返回仪表盘"
          >
            ← 返回仪表盘
          </Link>
        )}
      </div>

      <div className={styles.headerRight}>
        <ThemeToggle />
      </div>
    </header>
  );
}
