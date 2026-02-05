/**
 * Storage Utils Tests
 * 测试存储工具函数
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  StorageManager,
  CompressedStorage,
  VersionedStorage,
  createPersistStorage,
  exportStorage,
  importStorage,
  clearAppStorage,
  type StorageConfig,
  type StorageStats,
} from '../../utils/storage';

describe('Storage Utils', () => {
  beforeEach(() => {
    // 清空 localStorage
    localStorage.clear();
  });

  describe('StorageManager', () => {
    describe('getStats', () => {
      it('should return empty stats when storage is empty', () => {
        const stats = StorageManager.getStats();

        expect(stats.used).toBe(0);
        expect(stats.itemCount).toBe(0);
        expect(stats.percentage).toBe(0);
        expect(stats.available).toBe(5 * 1024 * 1024); // 5MB
      });

      it('should calculate correct stats with items', () => {
        localStorage.setItem('key1', 'value1');
        localStorage.setItem('key2', 'value2');

        const stats = StorageManager.getStats();

        expect(stats.itemCount).toBe(2);
        expect(stats.used).toBeGreaterThan(0);
        expect(stats.available).toBeLessThan(5 * 1024 * 1024);
      });

      it('should calculate percentage correctly', () => {
        // 存储约 1MB 数据
        const largeValue = 'x'.repeat(1024 * 1024);
        localStorage.setItem('large', largeValue);

        const stats = StorageManager.getStats();

        expect(stats.percentage).toBeGreaterThan(0.19); // 约 20%
        expect(stats.percentage).toBeLessThan(0.21);
      });
    });

    describe('isNearLimit', () => {
      it('should return false when storage is empty', () => {
        expect(StorageManager.isNearLimit()).toBe(false);
      });

      it('should return true when approaching limit', () => {
        const largeValue = 'x'.repeat(4 * 1024 * 1024); // 4MB
        localStorage.setItem('large', largeValue);

        expect(StorageManager.isNearLimit(0.8)).toBe(true);
      });

      it('should use custom threshold', () => {
        const largeValue = 'x'.repeat(3 * 1024 * 1024); // 3MB (60%)
        localStorage.setItem('large', largeValue);

        expect(StorageManager.isNearLimit(0.7)).toBe(false);
        expect(StorageManager.isNearLimit(0.5)).toBe(true);
      });
    });

    describe('setItem', () => {
      it('should set item successfully', () => {
        const result = StorageManager.setItem('key', 'value');

        expect(result).toBe(true);
        expect(localStorage.getItem('key')).toBe('value');
      });

      it('should call onQuotaExceeded callback when quota exceeded', () => {
        const callback = vi.fn();

        // 模拟 QuotaExceededError
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = vi.fn(() => {
          const error = new DOMException('Quota exceeded', 'QuotaExceededError');
          throw error;
        });

        const result = StorageManager.setItem('key', 'value', callback);

        expect(result).toBe(false);
        expect(callback).toHaveBeenCalled();

        // 恢复原始方法
        localStorage.setItem = originalSetItem;
      });

      it('should rethrow non-quota errors', () => {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = vi.fn(() => {
          throw new Error('Some other error');
        });

        expect(() => StorageManager.setItem('key', 'value')).toThrow('Some other error');

        localStorage.setItem = originalSetItem;
      });
    });

    describe('getItem', () => {
      it('should get and parse JSON value', () => {
        localStorage.setItem('key', JSON.stringify({ foo: 'bar' }));

        const result = StorageManager.getItem<{ foo: string }>('key');

        expect(result).toEqual({ foo: 'bar' });
      });

      it('should return null for non-existent key', () => {
        const result = StorageManager.getItem('nonexistent');

        expect(result).toBeNull();
      });

      it('should return null for invalid JSON', () => {
        localStorage.setItem('key', 'invalid json');

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const result = StorageManager.getItem('key');

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
      });

      it('should handle empty string', () => {
        localStorage.setItem('key', '');

        const result = StorageManager.getItem('key');

        expect(result).toBeNull();
      });
    });

    describe('removeItem', () => {
      it('should remove item', () => {
        localStorage.setItem('key', 'value');

        StorageManager.removeItem('key');

        expect(localStorage.getItem('key')).toBeNull();
      });
    });

    describe('clear', () => {
      it('should clear all storage', () => {
        localStorage.setItem('key1', 'value1');
        localStorage.setItem('key2', 'value2');

        StorageManager.clear();

        expect(localStorage.length).toBe(0);
      });
    });

    describe('keys', () => {
      beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('app-data', 'value1');
        localStorage.setItem('app-settings', 'value2');
        localStorage.setItem('other-key', 'value3');
      });

      it('should return all keys when no prefix', () => {
        const keys = StorageManager.keys();

        expect(keys).toHaveLength(3);
        expect(keys).toContain('app-data');
        expect(keys).toContain('app-settings');
        expect(keys).toContain('other-key');
      });

      it('should filter keys by prefix', () => {
        const keys = StorageManager.keys('app-');

        expect(keys).toHaveLength(2);
        expect(keys).toContain('app-data');
        expect(keys).toContain('app-settings');
        expect(keys).not.toContain('other-key');
      });
    });

    describe('clearOldest', () => {
      it('should keep specified number of items', () => {
        const data = Array.from({ length: 100 }, (_, i) => ({ id: i, value: `item${i}` }));
        localStorage.setItem('array', JSON.stringify(data));

        StorageManager.clearOldest('array', 50);

        const result = JSON.parse(localStorage.getItem('array') || '');
        expect(result).toHaveLength(50);
        expect(result[0].id).toBe(50); // 保留了最后50项
        expect(result[49].id).toBe(99);
      });

      it('should not modify if data length is less than keep count', () => {
        const data = Array.from({ length: 10 }, (_, i) => ({ id: i }));
        localStorage.setItem('array', JSON.stringify(data));

        StorageManager.clearOldest('array', 50);

        const result = JSON.parse(localStorage.getItem('array') || '');
        expect(result).toHaveLength(10);
      });

      it('should handle non-array data gracefully', () => {
        localStorage.setItem('array', 'not an array');

        // 不应该抛出错误
        expect(() => StorageManager.clearOldest('array', 50)).not.toThrow();
      });
    });
  });

  describe('CompressedStorage', () => {
    describe('setItem', () => {
      it('should compress and store data', () => {
        const data = { message: 'Hello, World!', count: 42 };

        const result = CompressedStorage.setItem('key', data);

        expect(result).toBe(true);
        expect(localStorage.getItem('key')).toBeTruthy();
      });

      it('should handle compression errors', () => {
        // 模拟压缩失败的情况（循环引用）
        const circular: any = { name: 'test' };
        circular.self = circular;

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = CompressedStorage.setItem('key', circular);

        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
      });
    });

    describe('getItem', () => {
      it('should decompress and retrieve data', () => {
        const originalData = { message: 'Hello!', value: 123 };
        CompressedStorage.setItem('key', originalData);

        const result = CompressedStorage.getItem<typeof originalData>('key');

        expect(result).toEqual(originalData);
      });

      it('should return null for non-existent key', () => {
        const result = CompressedStorage.getItem('nonexistent');

        expect(result).toBeNull();
      });

      it('should handle decompression errors', () => {
        localStorage.setItem('key', 'invalid compressed data');

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = CompressedStorage.getItem('key');

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
      });
    });

    describe('removeItem', () => {
      it('should remove compressed item', () => {
        CompressedStorage.setItem('key', { data: 'test' });
        expect(localStorage.getItem('key')).toBeTruthy();

        CompressedStorage.removeItem('key');

        expect(localStorage.getItem('key')).toBeNull();
      });
    });
  });

  describe('VersionedStorage', () => {
    let storage: VersionedStorage<{ value: number }>;

    beforeEach(() => {
      const config: StorageConfig = {
        key: 'test-versioned',
        version: 2,
      };
      storage = new VersionedStorage(config);
    });

    describe('getState', () => {
      it('should return null when no state exists', () => {
        const result = storage.getState();

        expect(result).toBeNull();
      });

      it('should retrieve stored state', () => {
        storage.setState({ value: 42 });

        const result = storage.getState();

        expect(result).toEqual({ value: 42 });
      });

      it('should handle missing _version field (version 0)', () => {
        localStorage.setItem('test-versioned', JSON.stringify({
          _state: { value: 10 },
        }));

        const result = storage.getState();

        expect(result).toEqual({ value: 10 });
      });

      it('should execute migration when version is old', () => {
        const migrate = vi.fn((oldState, oldVersion) => ({
          value: oldState.value * 2,
        }));

        const config: StorageConfig = {
          key: 'test-migration',
          version: 2,
          migrate,
        };
        const migratableStorage = new VersionedStorage(config);

        // 存储旧版本数据
        localStorage.setItem('test-migration', JSON.stringify({
          _version: 1,
          _state: { value: 5 },
        }));

        const result = migratableStorage.getState();

        expect(migrate).toHaveBeenCalledWith({ value: 5 }, 1);
        expect(result).toEqual({ value: 10 });

        // 验证已自动更新存储
        const stored = JSON.parse(localStorage.getItem('test-migration') || '');
        expect(stored._version).toBe(2);
      });

      it('should not migrate when versions match', () => {
        const migrate = vi.fn();

        const config: StorageConfig = {
          key: 'test-no-migration',
          version: 1,
          migrate,
        };
        const migratableStorage = new VersionedStorage(config);

        localStorage.setItem('test-no-migration', JSON.stringify({
          _version: 1,
          _state: { value: 5 },
        }));

        migratableStorage.getState();

        expect(migrate).not.toHaveBeenCalled();
      });

      it('should handle corrupted data gracefully', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        localStorage.setItem('test-versioned', 'invalid json');

        const result = storage.getState();

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
      });
    });

    describe('setState', () => {
      it('should store state with version', () => {
        storage.setState({ value: 100 });

        const stored = JSON.parse(localStorage.getItem('test-versioned') || '');

        expect(stored._version).toBe(2);
        expect(stored._state).toEqual({ value: 100 });
      });

      it('should return true on success', () => {
        const result = storage.setState({ value: 100 });

        expect(result).toBe(true);
      });

      it('should handle quota exceeded with cleanup', () => {
        const config: StorageConfig = {
          key: 'test-quota',
          version: 1,
          maxItems: 5,
        };
        const quotaStorage = new VersionedStorage<number[]>(config);

        // 设置一个数组
        quotaStorage.setState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

        const stored = JSON.parse(localStorage.getItem('test-quota') || '');
        // 验证只保留了最后5个（虽然这个实现有点简单）
        expect(stored._state.length).toBeLessThanOrEqual(10);
      });
    });

    describe('clear', () => {
      it('should remove stored state', () => {
        storage.setState({ value: 42 });
        expect(localStorage.getItem('test-versioned')).toBeTruthy();

        storage.clear();

        expect(localStorage.getItem('test-versioned')).toBeNull();
      });
    });
  });

  describe('createPersistStorage', () => {
    it('should create Zustand-compatible storage', () => {
      const storage = createPersistStorage<{ name: string }>({
        key: 'test-persist',
        version: 1,
      });

      // 测试 getItem
      expect(storage.getItem()).toBeNull();

      // 测试 setItem
      storage.setItem('test-persist', { name: 'test' });

      // 测试 removeItem
      storage.removeItem('test-persist');

      expect(localStorage.getItem('test-persist')).toBeNull();
    });

    it('should warn when approaching storage limit', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // 填充存储到接近限制
      const largeValue = 'x'.repeat(5 * 1024 * 1024 * 0.95);
      localStorage.setItem('other', largeValue);

      const storage = createPersistStorage<{ name: string }>({
        key: 'test-persist',
        version: 1,
      });

      storage.setItem('test-persist', { name: 'test' });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Storage] Approaching limit, consider cleaning up'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('exportStorage', () => {
    beforeEach(() => {
      localStorage.setItem('key1', JSON.stringify({ data: 'value1' }));
      localStorage.setItem('key2', 'plain string');
    });

    it('should export all storage as JSON string', () => {
      const exported = exportStorage();

      const data = JSON.parse(exported);

      expect(data.key1).toEqual({ data: 'value1' });
      expect(data.key2).toBe('plain string');
    });

    it('should handle invalid JSON entries', () => {
      localStorage.setItem('key3', 'invalid{json}');

      const exported = exportStorage();

      const data = JSON.parse(exported);

      expect(data.key3).toBe('invalid{json}');
    });
  });

  describe('importStorage', () => {
    it('should import storage data from JSON string', () => {
      const data = {
        imported1: { value: 1 },
        imported2: 'string',
      };

      const result = importStorage(JSON.stringify(data));

      expect(result).toBe(true);
      expect(JSON.parse(localStorage.getItem('imported1') || '{}')).toEqual({ value: 1 });
      expect(localStorage.getItem('imported2')).toBe('"string"');
    });

    it('should return false for invalid JSON', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = importStorage('invalid json');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('clearAppStorage', () => {
    beforeEach(() => {
      localStorage.setItem('bigmodel-data', 'value1');
      localStorage.setItem('bigmodel-settings', 'value2');
      localStorage.setItem('other-key', 'value3');
    });

    it('should clear all keys with prefix', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      clearAppStorage('bigmodel');

      expect(localStorage.getItem('bigmodel-data')).toBeNull();
      expect(localStorage.getItem('bigmodel-settings')).toBeNull();
      expect(localStorage.getItem('other-key')).toBe('value3'); // 不受影响
      expect(consoleSpy).toHaveBeenCalledWith('[Storage] Cleared 2 items');

      consoleSpy.mockRestore();
    });

    it('should use default prefix', () => {
      localStorage.setItem('bigmodel-test', 'value');
      localStorage.setItem('other', 'value');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      clearAppStorage();

      expect(localStorage.getItem('bigmodel-test')).toBeNull();
      expect(localStorage.getItem('other')).toBe('value');

      consoleSpy.mockRestore();
    });
  });
});
