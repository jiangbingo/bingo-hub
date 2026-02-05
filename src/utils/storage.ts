/**
 * 增强的 LocalStorage 管理工具
 * 提供配额管理、压缩、版本控制等功能
 */

import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

// ============================================
// 类型定义
// ============================================

export interface StorageConfig {
  key: string;
  version: number;
  compress?: boolean;
  maxItems?: number;
  migrate?: (oldState: any, oldVersion: number) => any;
}

export interface StorageStats {
  used: number;
  available: number;
  percentage: number;
  itemCount: number;
}

// ============================================
// 存储管理器
// ============================================

export class StorageManager {
  private static readonly QUOTA_LIMIT = 5 * 1024 * 1024; // 5MB
  private static readonly WARNING_THRESHOLD = 0.8; // 80%

  /**
   * 获取存储统计信息
   */
  static getStats(): StorageStats {
    let used = 0;
    let itemCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        used += key.length + value.length;
        itemCount++;
      }
    }

    return {
      used,
      available: this.QUOTA_LIMIT - used,
      percentage: used / this.QUOTA_LIMIT,
      itemCount,
    };
  }

  /**
   * 检查是否接近存储上限
   */
  static isNearLimit(threshold: number = this.WARNING_THRESHOLD): boolean {
    const stats = this.getStats();
    return stats.percentage >= threshold;
  }

  /**
   * 安全地设置存储项（处理配额超限）
   */
  static setItem(
    key: string,
    value: string,
    onQuotaExceeded?: () => void
  ): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        // 保留: 配额超限是重要的运行时错误，需要向开发者警告
        // TODO: 未来应替换为专门的日志服务 (如 Sentry/DataDog)
        console.warn('[Storage] Quota exceeded for:', key);
        onQuotaExceeded?.call(null);
        return false;
      }
      throw e;
    }
  }

  /**
   * 安全地获取存储项（处理解析错误）
   */
  static getItem<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      // 保留: 数据解析失败可能导致静默错误，需要警告
      // TODO: 未来应替换为专门的日志服务 (如 Sentry/DataDog)
      console.warn('[Storage] Failed to parse:', key, e);
      return null;
    }
  }

  /**
   * 移除存储项
   */
  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * 清除所有存储
   */
  static clear(): void {
    localStorage.clear();
  }

  /**
   * 获取所有键
   */
  static keys(prefix: string = ''): string[] {
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        allKeys.push(key);
      }
    }
    return allKeys;
  }

  /**
   * 清理最旧的数据（保留最新的 N 项）
   */
  static clearOldest(key: string, keepCount: number = 50): void {
    const data = this.getItem<any[]>(key);
    if (data && data.length > keepCount) {
      const trimmed = data.slice(-keepCount);
      this.setItem(key, JSON.stringify(trimmed));
    }
  }
}

// ============================================
// 压缩存储
// ============================================

export class CompressedStorage {
  /**
   * 存储压缩数据
   */
  static setItem(key: string, value: any): boolean {
    try {
      const json = JSON.stringify(value);
      const compressed = compressToUTF16(json);
      return StorageManager.setItem(key, compressed);
    } catch (e) {
      console.error('[CompressedStorage] Failed to compress:', key, e);
      return false;
    }
  }

  /**
   * 获取并解压数据
   */
  static getItem<T>(key: string): T | null {
    try {
      const compressed = localStorage.getItem(key);
      if (!compressed) return null;

      const decompressed = decompressFromUTF16(compressed);
      return JSON.parse(decompressed) as T;
    } catch (e) {
      console.error('[CompressedStorage] Failed to decompress:', key, e);
      return null;
    }
  }

  /**
   * 移除存储项
   */
  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}

// ============================================
// 版本化存储
// ============================================

export class VersionedStorage<T> {
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  /**
   * 获取数据（带版本迁移）
   */
  getState(): T | null {
    const stored = localStorage.getItem(this.config.key);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);
      const version = parsed._version || 0;
      const state = parsed._state;

      // 执行版本迁移
      if (version < this.config.version && this.config.migrate) {
        const migrated = this.config.migrate(state, version);
        this.setState(migrated as T);
        return migrated as T;
      }

      return state as T;
    } catch (e) {
      console.error('[VersionedStorage] Failed to load state:', e);
      return null;
    }
  }

  /**
   * 保存数据（带版本号）
   */
  setState(state: T): boolean {
    const payload = {
      _version: this.config.version,
      _state: state,
    };

    const json = JSON.stringify(payload);
    const data = this.config.compress
      ? compressToUTF16(json)
      : json;

    return StorageManager.setItem(this.config.key, data, () => {
      // 配额超限时清理
      if (this.config.maxItems) {
        this.cleanup();
      }
    });
  }

  /**
   * 清理旧数据
   */
  private cleanup(): void {
    const state = this.getState();
    if (state && typeof state === 'object' && Array.isArray(state)) {
      const trimmed = (state as any).slice(-this.config.maxItems!);
      this.setState(trimmed as T);
    }
  }

  /**
   * 清除存储
   */
  clear(): void {
    localStorage.removeItem(this.config.key);
  }
}

// ============================================
// Zustand 存储适配器
// ============================================

export function createPersistStorage<T>(config: StorageConfig) {
  const versioned = new VersionedStorage<T>(config);

  return {
    getItem: (): T | null => {
      return versioned.getState();
    },
    setItem: (name: string, value: T): void => {
      versioned.setState(value);

      // 检查存储状态
      if (StorageManager.isNearLimit(0.9)) {
        // 保留: 存储接近上限是重要的容量警告，需要提醒开发者
        // TODO: 未来应替换为专门的日志服务 (如 Sentry/DataDog)
        console.warn('[Storage] Approaching limit, consider cleaning up');
      }
    },
    removeItem: (name: string): void => {
      versioned.clear();
    },
  };
}

// ============================================
// 导出工具函数
// ============================================

/**
 * 导出所有存储数据
 */
export function exportStorage(): string {
  const data: Record<string, any> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      try {
        data[key] = JSON.parse(localStorage.getItem(key) || '');
      } catch {
        data[key] = localStorage.getItem(key);
      }
    }
  }

  return JSON.stringify(data, null, 2);
}

/**
 * 导入存储数据
 */
export function importStorage(json: string): boolean {
  try {
    const data = JSON.parse(json);
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
    return true;
  } catch (e) {
    console.error('[Storage] Failed to import:', e);
    return false;
  }
}

/**
 * 清除所有应用存储
 */
export function clearAppStorage(prefix: string = 'bigmodel'): void {
  const keys = StorageManager.keys(prefix);
  keys.forEach((key) => localStorage.removeItem(key));
}
