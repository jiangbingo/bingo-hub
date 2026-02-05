/**
 * ImagePage - 图像生成页面
 * 使用 CogView 模型生成 AI 图像
 */

import ImageWorkspace from '../components/workspace/ImageWorkspace';
import styles from './ImagePage.module.css';

export default function ImagePage() {
  return (
    <div className={styles.imagePage}>
      {/* 页面标题 */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>🎨 图像生成</h1>
        <p className={styles.pageSubtitle}>使用 CogView 模型生成高质量 AI 图像</p>
      </div>

      {/* 图像生成工作区 */}
      <ImageWorkspace />
    </div>
  );
}
