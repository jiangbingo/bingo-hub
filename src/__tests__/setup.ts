/**
 * Vitest 测试环境配置
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// 扩展 Vitest 的 expect 断言
expect.extend(matchers);

// 每个测试后清理 DOM
afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock document.createElement for download functionality
vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
  const element = {
    tagName: tag.toUpperCase(),
    href: '',
    download: '',
    target: '',
    style: {},
    click: vi.fn(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    setAttribute: vi.fn(),
  } as any;
  return element;
});

// Mock crypto.subtle for JWT generation
const mockCryptoKey = {
  algorithm: { name: 'HMAC', hash: 'SHA-256' },
  extractable: false,
  type: 'secret',
  usages: ['sign'],
};

vi.stubGlobal('crypto', {
  subtle: {
    importKey: vi.fn(() => Promise.resolve(mockCryptoKey)),
    sign: vi.fn(async () => {
      // 返回模拟的 HMAC-SHA256 签名
      return new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);
    }),
  },
});

// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({}),
    body: {
      getReader: () => ({
        read: () => Promise.resolve({ done: true, value: new Uint8Array() }),
      }),
    },
  } as Response)
);
