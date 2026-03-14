/**
 * Dashboard - 仪表盘首页
 * 展示所有可用功能
 */

import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';

interface Card {
  path: string;
  icon: string;
  title: string;
  desc: string;
  color: string;
  gradient: string;
}

export default function Dashboard() {
  const cards: Card[] = [
    {
      path: '/chat',
      icon: '💬',
      title: '文本对话',
      desc: '使用 GLM-4 模型进行智能对话',
      color: 'var(--primary-600)',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      path: '/image',
      icon: '🎨',
      title: '图像生成',
      desc: '使用 CogView 生成高质量图像',
      color: 'var(--purple-600)',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      path: '/video',
      icon: '🎬',
      title: '视频生成',
      desc: '使用 CogVideoX 创建视频内容',
      color: 'var(--pink-600)',
      gradient: 'from-pink-500 to-pink-600',
    },
    {
      path: '/tools',
      icon: '🖼️',
      title: '图片处理',
      desc: 'AI 图片压缩、证件照、放大、格式转换',
      color: 'var(--green-600)',
      gradient: 'from-green-500 to-green-600',
    },
  ];

  return (
    <div className={styles.dashboardPage}>
      {/* 头部 */}
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>BingoHub Explorer</h1>
        <p className={styles.dashboardSubtitle}>多模态 AI 创作平台 - 探索智谱 AI 的强大能力</p>
      </div>

      {/* 功能卡片网格 */}
      <div className={styles.dashboardGrid}>
        {cards.map((card, index) => (
          <Link
            key={card.path}
            to={card.path}
            className={styles.dashboardCard}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={styles.cardIconWrapper}
              style={{ background: `linear-gradient(135deg, ${card.gradient})` }}
            >
              <span className={styles.cardIcon}>{card.icon}</span>
            </div>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardDescription}>{card.desc}</p>
            <div className={styles.cardArrow}>→</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
