/**
 * GlobalNav - 全局导航栏
 * 用于在不同平台间跳转
 */

import styles from './GlobalNav.module.css';

interface NavLink {
  label: string;
  url: string;
  icon: string;
  active?: boolean;
}

export default function GlobalNav({ current = 'hub' }: { current?: 'hub' | 'platform' }) {
  const links: NavLink[] = [
    {
      label: '平台首页',
      url: 'https://bingoailabs.vercel.app',
      icon: '🏠',
      active: current === 'platform',
    },
    {
      label: 'AI 创作平台',
      url: 'https://bingo-hub.vercel.app/dashboard',
      icon: '🎨',
      active: current === 'hub',
    },
  ];

  return (
    <nav className={styles.globalNav}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <div className={styles.navLogo}>
          <span className={styles.logoIcon}>🦞</span>
          <span className={styles.logoText}>Bingo AI</span>
        </div>

        {/* 导航链接 */}
        <div className={styles.navLinks}>
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              className={`${styles.navLink} ${link.active ? styles.active : ''}`}
            >
              <span className={styles.linkIcon}>{link.icon}</span>
              <span className={styles.linkText}>{link.label}</span>
            </a>
          ))}
        </div>

        {/* 右侧信息 */}
        <div className={styles.navInfo}>
          <span className={styles.version}>v1.0.0</span>
        </div>
      </div>
    </nav>
  );
}
